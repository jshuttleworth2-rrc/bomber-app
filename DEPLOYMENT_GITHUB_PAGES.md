# Deploying to GitHub Pages with Google Sheets Integration

This guide covers deploying your Bombers Food Survey app to GitHub Pages with Google Sheets integration.

## Prerequisites
- Completed Google Sheets setup (see GOOGLE_SHEETS_SETUP.md)
- GitHub repository for your project
- Node.js and npm installed locally

## Option 1: Manual Deployment with Hard-coded API URL

### Step 1: Update the API URL
Since GitHub Pages doesn't support runtime environment variables, you need to hard-code the API URL for production:

1. Open `src/screens/ThankYou.jsx`
2. Replace the placeholder URL:
```javascript
// Change this line:
const apiUrl = import.meta.env.VITE_GOOGLE_SHEETS_API_URL || 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'

// To this (with your actual URL):
const apiUrl = import.meta.env.VITE_GOOGLE_SHEETS_API_URL || 'https://script.google.com/macros/s/YOUR_ACTUAL_DEPLOYMENT_ID/exec'
```

### Step 2: Build for Production
```bash
npm run build
```

### Step 3: Deploy to GitHub Pages
```bash
# Install gh-pages if you haven't already
npm install --save-dev gh-pages

# Add deploy script to package.json (if not already there)
# "scripts": {
#   ...
#   "deploy": "gh-pages -d dist"
# }

# Deploy
npm run deploy
```

### Step 4: Configure GitHub Pages
1. Go to your repository on GitHub
2. Navigate to Settings → Pages
3. Source should be set to "Deploy from a branch"
4. Branch should be "gh-pages" and folder should be "/ (root)"
5. Your app will be available at: `https://[username].github.io/bomber-app/`

## Option 2: GitHub Actions Deployment

### Step 1: Create GitHub Secret
1. Go to your repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `VITE_GOOGLE_SHEETS_API_URL`
4. Value: Your Google Apps Script URL
5. Click "Add secret"

### Step 2: Create GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build with API URL
        env:
          VITE_GOOGLE_SHEETS_API_URL: ${{ secrets.VITE_GOOGLE_SHEETS_API_URL }}
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### Step 3: Update Vite Config
Ensure your `vite.config.js` has the correct base path:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/bomber-app/', // Replace with your repository name
})
```

### Step 4: Push to GitHub
```bash
git add .
git commit -m "Add Google Sheets integration and GitHub Pages deployment"
git push origin main
```

The GitHub Action will automatically build and deploy your app.

## Option 3: Using Netlify or Vercel (Alternative)

These platforms support environment variables natively:

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_GOOGLE_SHEETS_API_URL`
5. Deploy

### Vercel
1. Import your GitHub repository to Vercel
2. Add environment variable: `VITE_GOOGLE_SHEETS_API_URL`
3. Deploy

## Testing Your Deployment

1. Visit your deployed app URL
2. Complete a survey
3. Check your Google Sheet for the new entry
4. Monitor the browser console for any errors

## Troubleshooting

### CORS Issues
- Google Apps Script handles CORS automatically when deployed as "Anyone can access"
- The `mode: 'no-cors'` in fetch is required

### Data Not Appearing
1. Check browser console for errors
2. Verify the API URL is correct
3. Check Google Apps Script logs:
   - Go to Apps Script editor → View → Executions

### 404 Errors on Refresh
Add a `404.html` file that redirects to your app:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Bombers Food Survey</title>
    <script>
      sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/'">
  </head>
</html>
```

## Security Considerations

1. **API URL Exposure**: The Google Apps Script URL will be visible in your deployed code
2. **Rate Limiting**: Consider implementing rate limiting in your Google Apps Script
3. **Data Validation**: Add validation in both React and Google Apps Script
4. **Access Control**: For production, consider adding authentication

## Updating the Deployment

To update your deployed app:

1. Make your changes locally
2. Update the API URL if needed
3. Build: `npm run build`
4. Deploy: `npm run deploy` (or push to main for GitHub Actions)

## Monitoring

- Check Google Sheets regularly for new responses
- Monitor Google Apps Script executions for errors
- Use browser DevTools to debug client-side issues