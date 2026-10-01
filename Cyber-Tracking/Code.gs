/**
 * Cyber-Tracking Backend
 * distinct from the main inventory Code.gs
 */

function doGet(e) {
  let page = e.parameter.page;
  
  if (!page || page === 'clock') {
    return HtmlService.createTemplateFromFile('Clock')
      .evaluate()
      .setTitle('Cyber Clock')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } else if (page === 'screensaver') {
    return HtmlService.createTemplateFromFile('Screensaver')
      .evaluate()
      .setTitle('Cyber Monitor')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Logs a student's action (Clock In / Clock Out)
 * @param {string} studentId
 * @param {string} actionType - "IN" or "OUT"
 */
function logAction(studentId, actionType) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Look up student name
  const studentName = getStudentName(ss, studentId);
  if (!studentName) {
    throw new Error('ID Not Found in Roster');
  }

  // 2. Log Action
  let sheet = ss.getSheetByName('HoursLog');
  if (!sheet) {
    sheet = ss.insertSheet('HoursLog');
    sheet.appendRow(['Timestamp', 'Student Name', 'Student ID', 'Action']);
  }
  
  const timestamp = new Date();
  sheet.appendRow([timestamp, studentName, studentId, actionType]);
  
  return { success: true, message: `Successfully clocked ${actionType} for ${studentName}` };
}

/**
 * Returns student name from 'StudentRoster' sheet or null
 */
function getStudentName(ss, idToCheck) {
  let sheet = ss.getSheetByName('StudentRoster');
  if (!sheet) {
    sheet = ss.insertSheet('StudentRoster');
    sheet.appendRow(['Student Name', 'Student ID']);
    sheet.appendRow(['John Doe', '12345']); // Example
    return idToCheck === '12345' ? 'John Doe' : null;
  }
  
  const data = sheet.getDataRange().getValues();
  // Skip Header
  for (let i = 1; i < data.length; i++) {
    // Assuming Column B (index 1) is ID, Column A (index 0) is Name
    // Check both as string to be safe
    if (String(data[i][1]).trim() === String(idToCheck).trim()) {
      return data[i][0];
    }
  }
  return null;
}

/**
 * Gets the dashboard data checking for open days and active students
 */
function getScreensaverData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Wrap in try-catch to ensure logs are ALWAYS returned even if it crashes
  try {
    // 1. Check Configuration
    const config = getConfig(ss);
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if today is allowed (case insensitive check)
    const isAllowed = config.allowedDays.some(d => d.trim().toLowerCase() === dayName.toLowerCase());
    
    if (!isAllowed) {
      return {
        status: 'CLOSED',
        message: 'CLASS NOT IN SESSION',
        students: []
      };
    }
    
    // 2. Get Students (Today Only)
    // Use helper to find sheet even if case is wrong (e.g. "hours log" vs "HoursLog")
    const sheet = getLogSheet(ss);
    const logs = [];
    logs.push(`Server Time: ${today.toString()}`);
    logs.push(`Checking vs Window: -5min to +20hours`);
    
    if (!sheet) {
      logs.push("Error: 'HoursLog' sheet not found (checked case-insensitive)");
      return { status: 'OPEN', students: [], logs: logs };
    }
    
    const data = sheet.getDataRange().getValues();
    logs.push(`Total Rows Found: ${data.length}`);
    data.shift(); // Remove headers
    
    const statusMap = new Map();
    
    data.forEach((row, index) => {
      // Wrap row processing in try catch too just in case
      try {
        let timeRaw = row[0];
        const name = row[1];
        let action = String(row[3]).trim().toUpperCase(); 
        
        // DEBUG: Check for column misalignment
        if (index < 5) { 
           logs.push(`Row ${index+2} Raw: Name='${name}', Col3='${row[2]}', Col4='${row[3]}'`);
        }
    
        // Ensure time is a Date object
        let time = new Date(timeRaw);
        if (isNaN(time.getTime())) {
          logs.push(`Row ${index+2}: Invalid Date '${timeRaw}'`);
          return; 
        }
        
        // Calculate hours diff
        const diffMs = today.getTime() - time.getTime();
        const diffHours = (diffMs / 3600000).toFixed(2);
        
        // Check window
        if (diffMs < -300000 || diffMs > 72000000) { 
          // logs.push(...) 
          return;
        }
        
        logs.push(`Row ${index+2} [Window OK]: Action='${action}', Diff=${diffHours}h`);
        
        if (action === 'IN') {
          statusMap.set(name, { isIn: true, time: time });
        } else if (action === 'OUT') {
          if (statusMap.has(name)) {
            statusMap.set(name, { isIn: false, time: time });
          }
        }
      } catch (rowErr) {
         logs.push(`Error Row ${index+2}: ${rowErr.message}`);
      }
    });
    
    const activeStudents = [];
    const sortedNames = Array.from(statusMap.keys()).sort();
    
    for (const name of sortedNames) {
      const status = statusMap.get(name);
      if (status.isIn) {
        activeStudents.push({
          name: name,
          since: status.time.toISOString() // Explicit string for JSON safety
        });
      }
    }
    
    logs.push(`Final Active Count: ${activeStudents.length}`);
    
    return {
      status: 'OPEN',
      students: activeStudents,
      logs: logs
    };

  } catch (e) {
    return {
      status: 'OPEN',
      students: [],
      logs: [`CRITICAL SERVER ERROR: ${e.message}`, e.stack]
    };
  }
}

/**
 * Robust sheet finder
 */
function getLogSheet(ss) {
  const sheets = ss.getSheets();
  for (const sheet of sheets) {
    const name = sheet.getName().toLowerCase().replace(/\s/g, '');
    if (name === 'hourslog') {
      return sheet;
    }
  }
  return null;
}

/**
 * Reads config from 'Config' sheet, creates it if missing.
 */
function getConfig(ss) {
  let sheet = ss.getSheetByName('Config');
  
  if (!sheet) {
    sheet = ss.insertSheet('Config');
    sheet.appendRow(['Setting', 'Value']);
    sheet.appendRow(['AllowedDays', 'Monday, Tuesday, Wednesday, Thursday, Friday']);
    return { allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] };
  }
  
  const data = sheet.getDataRange().getValues();
  const config = {};
  
  // Default
  config.allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  for (const row of data) {
    if (row[0] === 'AllowedDays') {
      config.allowedDays = row[1].toString().split(',');
    }
  }
  
  return config;
}
