/**
 * Code.gs - Backend Logic
 * Update: Added Dynamic Column Mapping & Performance Optimizations (Batch Writes)
 */

function doGet(e) {
  // Default to Checkout, but allow ?page=reconditioning
  let page = e.parameter.page || 'checkout';
  let file = 'Checkout';
  let title = 'Checkout Station';

  if (page === 'reconditioning') {
    file = 'Reconditioning';
    title = 'Reconditioning Management';
  }

  return HtmlService.createHtmlOutputFromFile(file)
    .setTitle(title)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Equipment Tracker')
    .addItem('Open Sidebar', 'showSidebar')
    .addItem('Open Checkout Mode', 'openCheckoutModal')
    .addItem('Open Reconditioning Mode', 'openReconditioningModal')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Equipment Tracker')
    .setWidth(450);
  SpreadsheetApp.getUi().showSidebar(html);
}

function openCheckoutModal() {
  const html = HtmlService.createHtmlOutputFromFile('Checkout')
    .setWidth(900)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Checkout Station');
}

function openReconditioningModal() {
  const html = HtmlService.createHtmlOutputFromFile('Reconditioning')
    .setWidth(800)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Reconditioning Management');
}

/* =========================================
   HELPER UTILS
   ========================================= */

function getColumnMap(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};
  headers.forEach((h, i) => {
    map[String(h).trim().toLowerCase()] = i;
  });
  return map;
}

function getColIndex(map, possibleNames, defaultIndex = -1) {
  if (!Array.isArray(possibleNames)) possibleNames = [possibleNames];
  for (const name of possibleNames) {
    const key = name.toLowerCase();
    if (map.hasOwnProperty(key)) return map[key];
  }
  return defaultIndex;
}

/* =========================================
   PLAYER API
   ========================================= */

function getPlayers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Players');
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  const map = getColumnMap(sheet);
  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  // Dynamic Column Mapping (No Defaults - Fail Gracefully if not found)
  // "Name	ID	Grade	Number	PhotoURL	ShirtsSize	ShortsSize	Postion	Status"
  const colId = getColIndex(map, ['ID', 'Student ID', 'Player ID']);
  const colName = getColIndex(map, ['Name', 'Player Name', 'Full Name']);
  const colNum = getColIndex(map, ['Number', 'Jersey Number', '#']); 
  const colPhoto = getColIndex(map, ['Photo', 'Photo URL', 'Image', 'PhotoURL']);
  const colShirt = getColIndex(map, ['Shirt Size', 'Jersey Size', 'ShirtsSize']);
  const colShort = getColIndex(map, ['Short Size', 'Pant Size', 'ShortsSize']);
  const colStatus = getColIndex(map, ['Status', 'Active']);
  const colPos = getColIndex(map, ['Position', 'Postion', 'Pos']); 
  const colHelmet = getColIndex(map, ['HelmetSize', 'Helmet Size']);
  const colShoulder = getColIndex(map, ['Shoulderpadsize', 'Shoulder Pad Size']);

  return data.map(row => ({
    id: colId >= 0 ? row[colId] : '',
    name: colName >= 0 ? row[colName] : '',
    number: colNum >= 0 ? row[colNum] : '',
    photoUrl: colPhoto >= 0 ? row[colPhoto] : '',
    shirtSize: colShirt >= 0 ? row[colShirt] : '',
    shortSize: colShort >= 0 ? row[colShort] : '',
    status: colStatus >= 0 ? row[colStatus] : '',
    position: colPos >= 0 ? row[colPos] : '',
    helmetSize: colHelmet >= 0 ? row[colHelmet] : '',
    shoulderpadSize: colShoulder >= 0 ? row[colShoulder] : ''
  }));
}

function apiAddPlayer(player) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Players');
  const id = player.id || Math.random().toString(36).substring(2, 9);
  // Just append standard order now that logic is dynamic, strictly appending might be misaligned if cols moved?
  // appendRow always appends to A, B, C...
  // If the sheet changed order, appendRow is risky!
  // Better to use map to find where to write.
  
  const map = getColumnMap(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const lastRow = sheet.getLastRow();
  const newRow = new Array(headers.length).fill('');
  
  // Helper to set by name
  const set = (keys, val) => {
    const idx = getColIndex(map, keys);
    if (idx >= 0) newRow[idx] = val;
  };

  set(['ID', 'Student ID'], id);
  set(['Name'], player.name);
  set(['Number'], player.number);
  set(['Photo', 'PhotoURL'], player.photoUrl);
  set(['Shirt', 'ShirtsSize'], player.shirtSize);
  set(['Short', 'ShortsSize'], player.shortSize);
  set(['Status'], 'Active');
  set(['Position', 'Postion'], player.position || '');
  
  sheet.getRange(lastRow + 1, 1, 1, newRow.length).setValues([newRow]);
  return true;
}

function apiUpdatePlayer(playerData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Players');
  const map = getColumnMap(sheet);
  const data = sheet.getDataRange().getValues();
  
  const colId = getColIndex(map, ['ID', 'Student ID']);
  if (colId === -1) return false;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colId]) == String(playerData.id)) {
      const rowNum = i + 1;
      
      const set = (keys, val) => {
         const idx = getColIndex(map, keys);
         if (idx >= 0) sheet.getRange(rowNum, idx + 1).setValue(val);
      };
      
      set(['Name'], playerData.name);
      set(['Number'], playerData.number);
      set(['Photo', 'PhotoURL'], playerData.photoUrl);
      set(['Shirt', 'ShirtsSize'], playerData.shirtSize);
      set(['Short', 'ShortsSize'], playerData.shortSize);
      // set(['Position', 'Postion'], playerData.position); // Not editing position yet in UI, but safe to add if we did
      
      return true;
    }
  }
  return false;
}

/* =========================================
   INVENTORY API - MULTI-SHEET SUPPORT
   ========================================= */

function getInventorySheets() {
  return ['HelmetInventory', 'ShoulderpadInventory'];
}

function getInventory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = getInventorySheets();
  let allItems = [];

  sheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    
    // "TagID	ItemName	Year	Status	AssignedTo	ReconditioningDate"
    // Note: User mentioned new columns. We'll map dynamically.
    const map = getColumnMap(sheet);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;
    
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

    const colTag = getColIndex(map, ['TagID', 'Tag ID', 'Tag'], 0);
    const colItem = getColIndex(map, ['ItemName', 'Item Name', 'Name'], 1);
    const colYear = getColIndex(map, ['Year'], 2);
    const colStatus = getColIndex(map, ['Status'], 3);
    const colAssigned = getColIndex(map, ['AssignedTo', 'Assigned To'], 4);
    // Extra cols like Brand/Size might be gone or renamed? 
    // User mentioned: "TagID ItemName Year Status AssignedTo ReconditioningDate"
    // I'll try to extract "Brand/Size" from ItemName if possible, or just look for them if they exist?
    // User didn't explicitly delete them, just listed the new ones. I'll check.
    const colBrand = getColIndex(map, ['Brand'], -1);
    const colSize = getColIndex(map, ['Size'], -1);

    data.forEach(row => {
      // Create a "composite" name if Brand/Size missing
      let name = row[colItem] || 'Unknown Item';
      let brand = colBrand >= 0 ? row[colBrand] : '';
      let size = colSize >= 0 ? row[colSize] : '';
      
      allItems.push({
        tagId: row[colTag], 
        itemName: name,
        brand: brand,
        size: size,
        year: colYear >= 0 ? row[colYear] : '', 
        status: row[colStatus], 
        assignedTo: row[colAssigned],
        type: sheetName // Track source
      });
    });
  });
  
  return allItems;
}

function findItemInSheets(tagId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = getInventorySheets();
  tagId = String(tagId).trim();

  for (const sheetName of sheets) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;
    
    const map = getColumnMap(sheet);
    const data = sheet.getDataRange().getValues();
    const colTag = getColIndex(map, ['TagID', 'Tag ID', 'Tag'], 0);
    
    for (let i = 1; i < data.length; i++) {
       if (String(data[i][colTag]) === tagId) {
          return { sheet, rowNum: i + 1, data: data[i], map, sheetName };
       }
    }
  }
  return null;
}

function apiCheckoutItem(tagId, playerId) {
  const item = findItemInSheets(tagId);
  if (!item) throw new Error('Item not found: ' + tagId);
  
  // 1. Get Player Name & Row
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const playerSheet = ss.getSheetByName('Players');
  const playerMap = getColumnMap(playerSheet);
  const playerData = playerSheet.getDataRange().getValues();
  
  const pColId = getColIndex(playerMap, ['ID', 'Student ID']);
  let playerName = '';
  let playerRowIndex = -1;
  
  for (let i = 1; i < playerData.length; i++) {
    if (String(playerData[i][pColId]) === String(playerId)) {
      const pColName = getColIndex(playerMap, ['Name', 'Player Name']);
      playerName = playerData[i][pColName];
      playerRowIndex = i + 1;
      break;
    }
  }
  
  if (!playerName) throw new Error('Player not found');

  // 2. Update Inventory (AssignedTo = Name)
  const iColStatus = getColIndex(item.map, ['Status']);
  const iColAssigned = getColIndex(item.map, ['AssignedTo', 'Assigned To']);
  
  item.sheet.getRange(item.rowNum, iColStatus + 1).setValue('Checked Out');
  item.sheet.getRange(item.rowNum, iColAssigned + 1).setValue(playerName);
  
  // 3. Update Players Sheet (Size/Model)
  // "HelmetSize" or "Shoulderpadsize"
  let targetColName = '';
  if (item.sheetName.toLowerCase().includes('helmet')) targetColName = 'HelmetSize';
  if (item.sheetName.toLowerCase().includes('shoulder')) targetColName = 'Shoulderpadsize';
  
  if (targetColName) {
    const pColTarget = getColIndex(playerMap, [targetColName]);
    if (pColTarget >= 0) {
       // Write Item Name
       const iColItem = getColIndex(item.map, ['ItemName', 'Item Name']);
       const itemName = item.data[iColItem];
       playerSheet.getRange(playerRowIndex, pColTarget + 1).setValue(itemName);
    }
  }
  
  const iColItem = getColIndex(item.map, ['ItemName', 'Item Name']);
  return { 
    name: item.data[iColItem], 
    brand: '', 
    size: '' 
  };
}


function apiCheckinItem(tagId) {
  const item = findItemInSheets(tagId);
  if (!item) throw new Error('Item not found: ' + tagId);
  
  const iColStatus = getColIndex(item.map, ['Status']);
  const iColAssigned = getColIndex(item.map, ['AssignedTo', 'Assigned To']);
  
  item.sheet.getRange(item.rowNum, iColStatus + 1).setValue('Available');
  item.sheet.getRange(item.rowNum, iColAssigned + 1).setValue('');
  
  // Note: We deliberately do NOT clear the player's size/model record in Players sheet.
  
  const iColItem = getColIndex(item.map, ['ItemName', 'Item Name']);
  return { name: item.data[iColItem], brand: '', size: '' };
}

function apiSetReconditioning(tagId, mode) {
  const item = findItemInSheets(tagId);
  if (!item) throw new Error('Item not found: ' + tagId);
  
  const iColStatus = getColIndex(item.map, ['Status']);
  const iColAssigned = getColIndex(item.map, ['AssignedTo', 'Assigned To']);
  const iColDate = getColIndex(item.map, ['ReconditioningDate', 'Reconditioning Date']);

  if (mode === 'send') {
      item.sheet.getRange(item.rowNum, iColStatus + 1).setValue('In Reconditioning'); 
      item.sheet.getRange(item.rowNum, iColAssigned + 1).setValue('Vendor');
  } else {
      item.sheet.getRange(item.rowNum, iColStatus + 1).setValue('Available'); 
      item.sheet.getRange(item.rowNum, iColAssigned + 1).setValue('');
      
      const dateStr = new Date().toLocaleDateString();
      if (iColDate >= 0) item.sheet.getRange(item.rowNum, iColDate + 1).setValue(dateStr);
  }
  
  const iColItem = getColIndex(item.map, ['ItemName', 'Item Name']);
  return { name: item.data[iColItem], brand: '', size: '' };
}

function getPlayerItems(playerId) {
  // Need to resolve ID to Name first to search Inventory
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const playerSheet = ss.getSheetByName('Players');
  const playerMap = getColumnMap(playerSheet);
  const data = playerSheet.getDataRange().getValues();
  const pColId = getColIndex(playerMap, ['ID', 'Student ID']);
  const pColName = getColIndex(playerMap, ['Name']);
  
  let playerName = '';
  // Simple check
  for(let i=1; i<data.length; i++) {
    if(String(data[i][pColId]) === String(playerId)) {
      playerName = data[i][pColName];
      break;
    }
  }
  
  if (!playerName) return [];

  // Search All Sheets for AssignedTo == playerName
  const sheets = getInventorySheets();
  const items = [];
  
  sheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const map = getColumnMap(sheet);
    const iData = sheet.getDataRange().getValues();
    
    const colAssigned = getColIndex(map, ['AssignedTo', 'Assigned To']);
    const colTag = getColIndex(map, ['TagID'], 0);
    const colItem = getColIndex(map, ['ItemName'], 1);
    
    for (let i = 1; i < iData.length; i++) {
       if (String(iData[i][colAssigned]) === playerName) { // Matching Name now!
           items.push({
               tagId: iData[i][colTag],
               name: iData[i][colItem],
               brand: '', // Simplified as likely not in new cols
               size: ''
           });
       }
    }
  });

  return items;
}
