// Google Apps Script - Deploy this as a Web App
// This script will handle POST requests from your React app and append data to Google Sheets

// CONFIGURATION - Update these values
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Get this from the Google Sheet URL
const SHEET_NAME = 'Survey Responses'; // Name of the sheet tab

function doPost(e) {
  try {
    // Parse the incoming request
    const data = JSON.parse(e.postData.contents);
    
    // Open the spreadsheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      const newSheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // Add headers
      const headers = [
        'Respondent ID',
        'Wings',
        'Chicken Fingers',
        'Spring Rolls',
        'Sliders',
        'Fruit & Veggie',
        'Samosas',
        'Popcorn',
        'Perogies',
        'Chips & Dip',
        'Pizza',
        'Comments',
        'Date',
        'Timestamp'
      ];
      newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header row
      const headerRange = newSheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#003B7C'); // Bombers blue
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      
      sheet = newSheet;
    }
    
    // Check if headers exist, if not add them
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      const headers = [
        'Respondent ID',
        'Wings',
        'Chicken Fingers',
        'Spring Rolls',
        'Sliders',
        'Fruit & Veggie',
        'Samosas',
        'Popcorn',
        'Perogies',
        'Chips & Dip',
        'Pizza',
        'Comments',
        'Date',
        'Timestamp'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#003B7C');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
    }
    
    // Prepare the row data
    const row = [
      data.respondent_id || '',
      data.wings || '',
      data.chicken_fingers || '',
      data.spring_rolls || '',
      data.sliders || '',
      data.fruit_veggie || '',
      data.samosas || '',
      data.popcorn || '',
      data.perogies || '',
      data.chips_dip || '',
      data.pizza || '',
      data.comments || '',
      data.date || '',
      new Date().toLocaleString() // Add timestamp
    ];
    
    // Append the data to the sheet
    sheet.appendRow(row);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data added successfully',
        respondent_id: data.respondent_id
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET request handler (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'active',
      message: 'Bombers Food Survey API is running!'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Function to manually create/reset the sheet with proper formatting
function setupSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  
  // Check if sheet exists, if not create it
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  
  // Add headers
  const headers = [
    'Respondent ID',
    'Wings',
    'Chicken Fingers',
    'Spring Rolls',
    'Sliders',
    'Fruit & Veggie',
    'Samosas',
    'Popcorn',
    'Perogies',
    'Chips & Dip',
    'Pizza',
    'Comments',
    'Date',
    'Timestamp'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#003B7C'); // Bombers blue
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  
  // Set column widths
  sheet.setColumnWidth(1, 100); // Respondent ID
  for (let i = 2; i <= 11; i++) {
    sheet.setColumnWidth(i, 120); // Food columns
  }
  sheet.setColumnWidth(12, 300); // Comments
  sheet.setColumnWidth(13, 100); // Date
  sheet.setColumnWidth(14, 150); // Timestamp
  
  // Freeze the header row
  sheet.setFrozenRows(1);
}