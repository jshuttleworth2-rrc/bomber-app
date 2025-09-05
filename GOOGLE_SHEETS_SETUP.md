# Google Sheets Integration Setup Guide

This guide will walk you through setting up Google Sheets integration for the Bombers Food Survey app.

## Prerequisites
- A Google account
- Access to Google Sheets and Google Apps Script

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "Bombers Food Survey Responses"
4. Copy the Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the part between `/d/` and `/edit`

## Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code in the editor
3. Copy the entire contents of `google-apps-script.gs` from this project
4. Paste it into the Apps Script editor
5. Update the `SHEET_ID` constant with your Sheet ID from Step 1
6. Save the project (Ctrl+S or Cmd+S)
7. Name the project "Bombers Food Survey API"

## Step 3: Deploy as Web App

1. In the Apps Script editor, click **Deploy → New Deployment**
2. Click the gear icon and select **Web app**
3. Configure the deployment:
   - **Description**: "Bombers Food Survey API v1"
   - **Execute as**: "Me" (your account)
   - **Who has access**: "Anyone" (required for public access from GitHub Pages)
4. Click **Deploy**
5. **IMPORTANT**: Copy the Web App URL - you'll need this for your React app
   - It will look like: `https://script.google.com/macros/s/AKfycb.../exec`
6. Click **Done**

## Step 4: Initialize the Sheet (Optional)

1. In the Apps Script editor, select the `setupSheet` function from the dropdown
2. Click **Run** to create the sheet with proper headers and formatting
3. Grant permissions when prompted

## Step 5: Configure Your React App

### Option A: Using Environment Variables (Recommended for Development)

1. Create a `.env` file in your project root:
```
VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

2. Add `.env` to your `.gitignore` file (if not already there)

### Option B: Direct Configuration (For GitHub Pages)

Since GitHub Pages doesn't support environment variables, you'll need to:

1. Update the API URL directly in the code before building for production
2. Or use a build-time environment variable in your GitHub Actions workflow

## Step 6: Test the Integration

1. Run your React app locally: `npm run dev`
2. Complete a survey
3. Check your Google Sheet - the response should appear as a new row

## Troubleshooting

### CORS Errors
The Google Apps Script is configured to handle CORS. If you still get errors:
- Make sure you deployed the script as "Anyone" can access
- Try redeploying the script

### Data Not Appearing in Sheet
1. Check the Apps Script execution logs:
   - In Apps Script editor, go to **View → Executions**
2. Verify the Sheet ID is correct
3. Make sure the sheet name is "Survey Responses"

### Permission Errors
- Make sure the Google Sheet is not restricted
- The Apps Script needs to run as "Me" (your account) with access set to "Anyone"

## Managing Deployments

### To Update the Script
1. Make changes in the Apps Script editor
2. Save the changes
3. Click **Deploy → Manage Deployments**
4. Click the edit (pencil) icon on your deployment
5. Select **New Version** from the Version dropdown
6. Add a description of changes
7. Click **Deploy**

### To Get the API URL Again
1. In Apps Script editor, go to **Deploy → Manage Deployments**
2. The Web App URL is shown there

## Security Notes

- The script runs with your Google account permissions
- Anyone with the Web App URL can submit data
- Consider adding validation or rate limiting for production use
- For sensitive data, implement additional authentication

## Data Structure

The Google Sheet will have the following columns:
- Respondent ID
- Wings (emoji: 😍, 😐, or 🤢)
- Chicken Fingers (emoji)
- Spring Rolls (emoji)
- Sliders (emoji)
- Fruit & Veggie (emoji)
- Samosas (emoji)
- Popcorn (emoji)
- Perogies (emoji)
- Chips & Dip (emoji)
- Pizza (emoji)
- Comments (text)
- Date (survey date)
- Timestamp (submission time)