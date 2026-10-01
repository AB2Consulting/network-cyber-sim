/**
 * Chromebook Repair Lab - Code.gs
 * Google Apps Script backend for the repair lab management system.
 *
 * Deploy as a Web App (Execute as: Me, Who has access: Anyone in your org).
 *
 * Pages served via doGet(?page=):
 *   clock       - Browser-based clock in/out for technicians
 *   screensaver - TV dashboard (active technicians + open ticket count)
 *   tickets     - Ticket creation & management form
 *   loaners     - Loaner Chromebook assignment / return
 */

// ─────────────────────────────────────────────
//  ROUTING
// ─────────────────────────────────────────────

function doGet(e) {
  const page = (e.parameter.page || 'clock').toLowerCase();
  const pageMap = {
    clock:       'Clock',
    screensaver: 'Screensaver',
    tickets:     'Tickets',
    loaners:     'Loaners',
    lab:         'Lab',       // Combined Tickets + Loaners
  };
  const template = pageMap[page] || 'Clock';
  return HtmlService.createTemplateFromFile(template)
    .evaluate()
    .setTitle('Repair Lab — ' + template)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ─────────────────────────────────────────────
//  CLOCK IN / OUT
// ─────────────────────────────────────────────

/**
 * Logs a student's Clock In or Clock Out.
 * @param {string} studentId
 * @param {string} actionType - "IN" or "OUT"
 */
function logAction(studentId, actionType) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const studentName = getStudentName(ss, studentId);
  if (!studentName) {
    throw new Error('ID Not Found in Roster');
  }

  let sheet = ss.getSheetByName('HoursLog');
  if (!sheet) {
    sheet = ss.insertSheet('HoursLog');
    sheet.appendRow(['Timestamp', 'Student Name', 'Student ID', 'Action']);
  }

  sheet.appendRow([new Date(), studentName, studentId, actionType.toUpperCase()]);
  return { success: true, message: `Clocked ${actionType.toUpperCase()} — ${studentName}`, studentName: studentName };
}

/**
 * Checks whether a student is currently clocked in.
 * Used by the clock page to auto-detect IN vs OUT on badge scan.
 * @param {string} studentId
 * @returns {{ isIn: boolean, studentName: string }}
 */
function getStudentStatus(studentId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const studentName = getStudentName(ss, studentId);
  if (!studentName) throw new Error('ID Not Found in Roster');

  const logSheet = getLogSheet(ss);
  if (!logSheet) return { isIn: false, studentName };

  const today = new Date();
  const data  = logSheet.getDataRange().getValues();
  data.shift(); // remove header row

  let isIn = false;
  data.forEach(row => {
    const time = new Date(row[0]);
    if (isNaN(time.getTime())) return;
    const diffMs = today.getTime() - time.getTime();
    if (diffMs < -300000 || diffMs > 72000000) return; // outside 20-hour window
    if (row[1] !== studentName) return;
    const action = String(row[3]).trim().toUpperCase();
    if (action === 'IN')  isIn = true;
    if (action === 'OUT') isIn = false;
  });

  return { isIn, studentName };
}

/**
 * Returns the student's name from the StudentRoster sheet, or null if not found.
 */
function getStudentName(ss, idToCheck) {
  let sheet = ss.getSheetByName('StudentRoster');
  if (!sheet) {
    sheet = ss.insertSheet('StudentRoster');
    sheet.appendRow(['Student Name', 'Student ID']);
    return null;
  }
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(idToCheck).trim()) {
      return data[i][0];
    }
  }
  return null;
}

// ─────────────────────────────────────────────
//  SCREENSAVER / TV DISPLAY
// ─────────────────────────────────────────────

function getScreensaverData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const config = getConfig(ss);
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const isAllowed = config.allowedDays.some(d => d.trim().toLowerCase() === dayName.toLowerCase());

    if (!isAllowed) {
      return { status: 'CLOSED', message: 'LAB NOT IN SESSION', students: [], openTickets: 0 };
    }

    const logSheet = getLogSheet(ss);
    if (!logSheet) {
      return { status: 'OPEN', students: [], openTickets: 0 };
    }

    const data = logSheet.getDataRange().getValues();
    data.shift(); // remove header

    const statusMap = new Map();
    data.forEach(row => {
      const time = new Date(row[0]);
      if (isNaN(time.getTime())) return;
      const diffMs = today.getTime() - time.getTime();
      // Only consider entries from the last 20 hours and not in the future
      if (diffMs < -300000 || diffMs > 72000000) return;

      const name   = row[1];
      const action = String(row[3]).trim().toUpperCase();
      if (action === 'IN') {
        statusMap.set(name, { isIn: true, time });
      } else if (action === 'OUT' && statusMap.has(name)) {
        statusMap.set(name, { isIn: false, time });
      }
    });

    const activeStudents = [];
    for (const [name, status] of statusMap) {
      if (status.isIn) {
        activeStudents.push({ name, since: status.time.toISOString() });
      }
    }
    activeStudents.sort((a, b) => a.name.localeCompare(b.name));

    // Count open tickets
    const openTickets = countOpenTickets(ss);

    return { status: 'OPEN', students: activeStudents, openTickets };

  } catch (err) {
    return { status: 'OPEN', students: [], openTickets: 0, error: err.message };
  }
}

function countOpenTickets(ss) {
  const sheet = ss.getSheetByName('Tickets');
  if (!sheet) return 0;
  const data = sheet.getDataRange().getValues();
  let count = 0;
  for (let i = 1; i < data.length; i++) {
    const status = String(data[i][7]).trim().toLowerCase();
    if (status === 'open' || status === 'in progress') count++;
  }
  return count;
}

// ─────────────────────────────────────────────
//  TICKETS
// ─────────────────────────────────────────────

/**
 * Returns the list of students currently clocked in (for the technician dropdown).
 */
function getActiveStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = getLogSheet(ss);
  if (!logSheet) return [];

  const today = new Date();
  const data  = logSheet.getDataRange().getValues();
  data.shift();

  const statusMap = new Map();
  data.forEach(row => {
    const time = new Date(row[0]);
    if (isNaN(time.getTime())) return;
    const diffMs = today.getTime() - time.getTime();
    if (diffMs < -300000 || diffMs > 72000000) return;
    const name   = row[1];
    const action = String(row[3]).trim().toUpperCase();
    if (action === 'IN') {
      statusMap.set(name, true);
    } else if (action === 'OUT') {
      statusMap.set(name, false);
    }
  });

  return Array.from(statusMap.entries())
    .filter(([, isIn]) => isIn)
    .map(([name]) => name)
    .sort();
}

/**
 * Creates a new repair ticket.
 * @param {Object} data - { technician, customerName, customerId, fixType, description }
 */
function createTicket(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Tickets');
  if (!sheet) {
    sheet = ss.insertSheet('Tickets');
    sheet.appendRow(['Ticket ID', 'Timestamp', 'Technician', 'Customer Name', 'Customer ID', 'Fix Type', 'Description', 'Status']);
    sheet.setFrozenRows(1);
  }

  const ticketId = 'TKT-' + Date.now().toString().slice(-6);
  sheet.appendRow([
    ticketId,
    new Date(),
    data.technician,
    data.customerName,
    data.customerId,
    data.fixType,
    data.description || '',
    'Open',
  ]);

  return { success: true, ticketId, message: `Ticket ${ticketId} created!` };
}

/**
 * Returns all open/in-progress tickets.
 */
function getOpenTickets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const statusIdx = headers.indexOf('Status');

  return data
    .filter(row => {
      const s = String(row[statusIdx]).toLowerCase();
      return s === 'open' || s === 'in progress';
    })
    .map(row => ({
      ticketId:     row[0],
      timestamp:    row[1] instanceof Date ? row[1].toISOString() : row[1],
      technician:   row[2],
      customerName: row[3],
      customerId:   row[4],
      fixType:      row[5],
      description:  row[6],
      status:       row[7],
    }));
}

/**
 * Updates a ticket's status.
 * @param {string} ticketId
 * @param {string} newStatus - "Open", "In Progress", "Closed"
 */
function updateTicketStatus(ticketId, newStatus) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tickets');
  if (!sheet) throw new Error('Tickets sheet not found');

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(ticketId).trim()) {
      sheet.getRange(i + 1, 8).setValue(newStatus); // column H = Status
      return { success: true, message: `Ticket ${ticketId} updated to "${newStatus}"` };
    }
  }
  throw new Error(`Ticket ${ticketId} not found`);
}

// ─────────────────────────────────────────────
//  LOANERS
// ─────────────────────────────────────────────

/**
 * Returns all loaners (both available and checked out) for the Loaners page.
 */
function getAllLoaners() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Loaners');
  if (!sheet) {
    sheet = ss.insertSheet('Loaners');
    sheet.appendRow(['Asset Tag', 'Assigned To (Name)', 'Assigned To (ID)', 'Checkout Time', 'Return Time', 'Status']);
    sheet.setFrozenRows(1);
    return [];
  }

  const data = sheet.getDataRange().getValues();
  data.shift();
  return data.map((row, i) => ({
    rowIndex:     i + 2, // 1-indexed, +1 for header
    assetTag:     row[0],
    assignedName: row[1],
    assignedId:   row[2],
    checkoutTime: row[3] instanceof Date ? row[3].toISOString() : row[3],
    returnTime:   row[4] instanceof Date ? row[4].toISOString() : row[4],
    status:       row[5],
  })).filter(r => r.assetTag); // skip blank rows
}

/**
 * Assigns a loaner to a customer. Adds a new row (multiple checkouts of same tag are tracked).
 * @param {string} assetTag
 * @param {string} customerName
 * @param {string} customerId
 */
function assignLoaner(assetTag, customerName, customerId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Loaners');
  if (!sheet) {
    sheet = ss.insertSheet('Loaners');
    sheet.appendRow(['Asset Tag', 'Assigned To (Name)', 'Assigned To (ID)', 'Checkout Time', 'Return Time', 'Status']);
    sheet.setFrozenRows(1);
  }

  // Check if already checked out
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toUpperCase() === String(assetTag).trim().toUpperCase()
        && String(data[i][5]).trim().toLowerCase() === 'checked out') {
      throw new Error(`Asset ${assetTag} is already checked out to ${data[i][1]}`);
    }
  }

  sheet.appendRow([assetTag.trim().toUpperCase(), customerName, customerId, new Date(), '', 'Checked Out']);
  return { success: true, message: `Loaner ${assetTag} assigned to ${customerName}` };
}

/**
 * Returns a loaner — finds the most recent checked-out row with this asset tag and marks it returned.
 * @param {string} assetTag
 */
function returnLoaner(assetTag) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Loaners');
  if (!sheet) throw new Error('Loaners sheet not found');

  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]).trim().toUpperCase() === String(assetTag).trim().toUpperCase()
        && String(data[i][5]).trim().toLowerCase() === 'checked out') {
      sheet.getRange(i + 1, 5).setValue(new Date());   // Return Time
      sheet.getRange(i + 1, 6).setValue('Returned');   // Status
      return { success: true, message: `Loaner ${assetTag} returned successfully` };
    }
  }
  throw new Error(`No active checkout found for ${assetTag}`);
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function getLogSheet(ss) {
  const sheets = ss.getSheets();
  for (const sheet of sheets) {
    if (sheet.getName().toLowerCase().replace(/\s/g, '') === 'hourslog') return sheet;
  }
  return null;
}

function getConfig(ss) {
  let sheet = ss.getSheetByName('Config');
  if (!sheet) {
    sheet = ss.insertSheet('Config');
    sheet.appendRow(['Setting', 'Value']);
    sheet.appendRow(['AllowedDays', 'Monday, Tuesday, Wednesday, Thursday, Friday']);
  }
  const data = sheet.getDataRange().getValues();
  const config = { allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] };
  for (const row of data) {
    if (row[0] === 'AllowedDays') {
      config.allowedDays = String(row[1]).split(',').map(d => d.trim());
    }
  }
  return config;
}
