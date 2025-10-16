# Bomber Food Survey - Implementation Plan
## Features 1 & 2.1 Implementation

**Branch:** `new-features`
**Created:** October 14, 2025
**Status:** Planning Complete - Ready for Implementation

---

## Table of Contents
1. [Overview](#overview)
2. [Technical Architecture](#technical-architecture)
3. [Data Structures](#data-structures)
4. [Screen Specifications](#screen-specifications)
5. [Component Specifications](#component-specifications)
6. [Google Apps Script](#google-apps-script)
7. [Implementation Checklist](#implementation-checklist)
8. [Testing Plan](#testing-plan)

---

## Overview

### Feature 1: User Names (Optional)
Add optional name input field to the survey flow, allowing respondents to identify themselves or remain anonymous.

**Changes Required:**
- Modify Comments screen to include name input field
- Update data submission to include name field
- Update Google Sheets to capture name column

### Feature 2.1: Admin Controller
Implement configuration-first workflow allowing admins to customize survey food items before each game.

**Changes Required:**
- New Configuration screen (landing page)
- New Load Survey screen
- New Create/Edit Survey screen
- Admin edit panel (full-screen overlay)
- Password protection system
- LocalStorage-based configuration management
- Google Sheets tracking of configurations
- Dynamic food list system
- "Game Over" session management

---

## Technical Architecture

### State Management Strategy

**App-Level State (App.jsx):**
```javascript
const [responses, setResponses] = useState({})
const [currentFoodIndex, setCurrentFoodIndex] = useState(0)
const [respondentId, setRespondentId] = useState(() => {
  const saved = localStorage.getItem('lastRespondentId')
  return saved ? parseInt(saved) + 1 : 1
})
const [activeConfig, setActiveConfig] = useState(null) // NEW
const [sessionActive, setSessionActive] = useState(false) // NEW
const [activeFoods, setActiveFoods] = useState([]) // NEW - foods for current survey
```

**LocalStorage Schema:**
```javascript
// Configuration Storage
localStorage.setItem('savedConfigurations', JSON.stringify([
  {
    id: 'default',
    name: 'Default Survey',
    foods: ['wings', 'chicken_fingers', ...], // array of food IDs
    customFoods: [], // empty for default
    createdDate: '2025-10-14',
    lastUsed: '2025-10-14',
    timesUsed: 5,
    isDefault: true
  },
  {
    id: 'config-1729000000000', // timestamp-based ID
    name: 'Survey 1',
    foods: ['wings', 'chicken_fingers'],
    customFoods: [
      { id: 'custom-1729000000001', name: 'Caesar Salad' },
      { id: 'custom-1729000000002', name: 'Nachos' }
    ],
    createdDate: '2025-10-14',
    lastUsed: '2025-10-14',
    timesUsed: 3,
    isDefault: false
  }
]))

// Active Session
localStorage.setItem('activeSession', JSON.stringify({
  configId: 'config-1729000000000',
  startedAt: '2025-10-14T14:30:00Z'
}))

// Previously Used Custom Foods (for suggestions)
localStorage.setItem('customFoodHistory', JSON.stringify([
  { id: 'custom-1729000000001', name: 'Caesar Salad' },
  { id: 'custom-1729000000002', name: 'Nachos' },
  { id: 'custom-1729000000003', name: 'Loaded Fries' }
]))

// Respondent Counter
localStorage.setItem('lastRespondentId', '42')
```

### Routing Structure

**New Routes:**
```javascript
<Routes>
  <Route path="/" element={<Navigate to="/configure" replace />} />
  <Route path="/configure" element={<ConfigureScreen />} />
  <Route path="/load-survey" element={<LoadSurveyScreen />} />
  <Route path="/create-survey" element={<CreateSurveyScreen mode="create" />} />
  <Route path="/edit-survey/:configId" element={<CreateSurveyScreen mode="edit" />} />
  <Route path="/welcome" element={<Welcome />} />
  {activeFoods.map((food, index) => (
    <Route
      key={food.id}
      path={`/food/${index}`}
      element={<FoodRating food={food} foodIndex={index} ... />}
    />
  ))}
  <Route path="/comments" element={<Comments responses={responses} />} />
  <Route path="/thank-you" element={<ThankYou ... />} />
</Routes>
```

### Food Data Structure

**Default Foods Array:**
```javascript
const DEFAULT_FOODS = [
  { id: 'wings', name: 'Wings', displayName: 'Wings', isDefault: true },
  { id: 'chicken_fingers', name: 'Chicken Fingers', displayName: 'Chicken Fingers', isDefault: true },
  { id: 'spring_rolls', name: 'Spring Rolls', displayName: 'Spring Rolls', isDefault: true },
  { id: 'sliders', name: 'Sliders', displayName: 'Sliders', isDefault: true },
  { id: 'fruit_veggie', name: 'Fruit & Veggie Trays', displayName: 'Fruit & Veggie Trays', isDefault: true },
  { id: 'samosas', name: 'Samosas', displayName: 'Samosas', isDefault: true },
  { id: 'popcorn', name: 'Popcorn', displayName: 'Popcorn', isDefault: true },
  { id: 'perogies', name: 'Perogies', displayName: 'Perogies', isDefault: true },
  { id: 'chips_dip', name: 'Chips & Dips', displayName: 'Chips & Dips', isDefault: true },
  { id: 'pizza', name: 'Pizza', displayName: 'Pizza', isDefault: true }
]
```

**Custom Food Format:**
```javascript
{
  id: 'custom-1729000000001', // timestamp-based unique ID
  name: 'Caesar Salad',
  displayName: 'Caesar Salad',
  isDefault: false,
  isCustom: true
}
```

---

## Data Structures

### Configuration Object
```typescript
interface Configuration {
  id: string                    // 'default' or 'config-{timestamp}'
  name: string                  // User-provided or auto-generated
  foods: string[]               // Array of food IDs (default foods)
  customFoods: CustomFood[]     // Array of custom food objects
  createdDate: string           // ISO date string
  lastUsed: string              // ISO date string
  timesUsed: number             // Usage counter
  isDefault: boolean            // True only for default config
}

interface CustomFood {
  id: string                    // 'custom-{timestamp}'
  name: string                  // Display name
}
```

### Survey Response Object
```typescript
interface SurveyResponse {
  respondent_id: number
  survey_id: string             // Config ID
  survey_name: string           // Config name
  respondent_name: string       // Optional user name
  // Food ratings (dynamic based on active config)
  [foodId: string]: string      // e.g., 'wings': '😍'
  comments: string
  date: string
  timestamp: string
}
```

---

## Screen Specifications

### 1. Configuration Screen (`/configure`)

**File:** `src/screens/Configure.jsx`

**Purpose:** Landing page when app loads or after "Game Over". Allows quick start or navigation to survey management.

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│      It's Game Time! 🏈             │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Use Default Survey          │ │ (Large primary button)
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Load Survey                 │ │ (Large primary button)
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   New Survey                  │ │ (Large primary button)
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**UI Elements:**
- **Title:** "It's Game Time! 🏈" (centered, large, top of screen)
- **Button 1:** "Use Default Survey" → Starts session with default 10 foods
- **Button 2:** "Load Survey" → Navigate to `/load-survey`
- **Button 3:** "New Survey" → Navigate to `/create-survey`

**Behavior:**
- On mount: Check if `activeSession` exists in localStorage
  - If yes: Navigate to `/welcome` (resume session)
  - If no: Stay on this screen
- "Use Default Survey" click:
  1. Load default configuration
  2. Set as activeConfig
  3. Update `timesUsed` and `lastUsed` in localStorage
  4. Log to Google Sheets (Survey Configurations tab)
  5. Set `sessionActive = true`
  6. Navigate to `/welcome`

**Styling:**
- Clean, minimal design
- Large buttons (easy to tap on tablet)
- Bomber blue color scheme
- Tan/beige background (consistent with current design)

---

### 2. Load Survey Screen (`/load-survey`)

**File:** `src/screens/LoadSurvey.jsx`

**Purpose:** Display all saved configurations with metadata, allowing admin to select, edit, or delete surveys.

**Layout:**
```
┌─────────────────────────────────────┐
│ Select a survey...  [+ New Survey]  │ (header row)
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Default Survey                │ │ (Green background)
│  │ Last Used: Oct 14, 2025       │ │
│  │ Times used: 5                 │ │
│  │         [More details ▼]      │ │
│  │                               │ │
│  │ [Edit]        [Use]           │ │ (No Delete for default)
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Survey 1                      │ │ (Green background)
│  │ Last Used: Oct 13, 2025       │ │
│  │ Times used: 3                 │ │
│  │         [More details ▼]      │ │
│  │                               │ │
│  │ [Edit]  [Delete]  [Use]       │ │
│  └───────────────────────────────┘ │
│                                     │
│  No custom surveys saved yet.       │ (If no custom surveys)
│  Create one using "New Survey"!     │
│                                     │
│       [+ New Survey]                │ (Centered button)
│                                     │
└─────────────────────────────────────┘
```

**UI Elements:**

**Header Row:**
- Left: "Select a survey..." (gray text)
- Right: "[+ New Survey]" button (blue, small)

**Survey Card (for each saved config):**
- **Background:** Light green (#d4edda or similar)
- **Border:** Subtle border, rounded corners
- **Padding:** Comfortable spacing

**Card Contents:**
- **Name:** Bold, large font (e.g., "Default Survey")
- **Metadata:**
  - "Last Used: {date}" (smaller gray text)
  - "Times used: {number}" (smaller gray text)
- **More Details Button:** "[More details ▼]" (expandable)
  - When clicked: Expands to show food list
  - Changes to "[Close details ▲]"
- **Action Buttons:**
  - **Edit:** Opens edit mode for this config
  - **Delete:** Shows confirmation dialog (not shown for Default)
  - **Use:** Shows "Use {survey name}?" dialog

**Expanded "More Details" View:**
```
┌───────────────────────────────┐
│ Survey 1                      │
│ Last Used: Oct 13, 2025       │
│ Times used: 3                 │
│         [More details ▼]      │
│                               │
│ Foods in this survey:         │
│ • Wings                       │
│ • Chicken Fingers             │
│ • Caesar Salad (custom)       │
│ • Nachos (custom)             │
│         [Close details ▲]     │
│                               │
│ [Edit]  [Delete]  [Use]       │
└───────────────────────────────┘
```

**Empty State (no custom surveys):**
- Message: "No custom surveys saved yet. Create one using 'New Survey'!"
- Centered "[+ New Survey]" button below message

**Behavior:**

**On Mount:**
- Load all configurations from localStorage
- Sort: Default first, then by lastUsed (most recent first)
- Display each as a card

**Edit Button Click:**
- Navigate to `/edit-survey/{configId}`
- Pre-populate Create/Edit screen with existing config

**Delete Button Click:**
- Show confirmation dialog: "Delete {survey name}? This cannot be undone."
- If confirmed:
  - Remove from localStorage `savedConfigurations`
  - Refresh screen
  - Show success message (optional)

**Use Button Click:**
- Show confirmation dialog: "Use {survey name}?"
- If confirmed:
  1. Load selected configuration
  2. Set as activeConfig
  3. Update `timesUsed` and `lastUsed`
  4. Log to Google Sheets
  5. Set `sessionActive = true`
  6. Navigate to `/welcome`

**More Details Click:**
- Toggle expansion of food list
- Smooth animation (CSS transition)
- Button text changes to "Close details ▲"

**+ New Survey Click (both buttons):**
- Navigate to `/create-survey`

---

### 3. Create/Edit Survey Screen (`/create-survey` or `/edit-survey/:configId`)

**File:** `src/screens/CreateSurvey.jsx`

**Purpose:** Allow admin to create new survey configuration or edit existing one.

**Props:**
- `mode`: 'create' or 'edit'
- `configId`: (if mode is 'edit') ID of config to edit

**Layout:**
```
┌─────────────────────────────────────┐
│ Please enter a survey name:         │
│ [Survey name?_________________]     │
│                                     │
│ Select food for your survey:        │
│                                     │
│ Default Foods:                      │
│ ☑ Wings [X]                         │
│ ☑ Chicken Fingers [X]               │
│ ☐ Spring Rolls                      │
│ ☐ Sliders                           │
│ ☐ Fruit & Veggie Trays              │
│ ☐ Samosas                           │
│ ☐ Popcorn                           │
│ ☐ Perogies                          │
│ ☐ Chips & Dips                      │
│ ☐ Pizza                             │
│                                     │
│ Previously Used Custom Foods:       │
│ ☑ Caesar Salad [X]                  │
│ ☐ Nachos                            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   + Add Food                  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Save and Start Survey       │ │ (Primary button)
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │ (Only in edit mode)
│  │   Save and Close              │ │ (Secondary button)
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**UI Elements:**

**Survey Name Input:**
- Label: "Please enter a survey name:"
- Text input field
- Placeholder: "Survey name?"
- Optional: If left blank, auto-generate "Survey 1", "Survey 2", etc.

**Food Selection:**

**Section 1: Default Foods**
- Header: "Default Foods:" (bold)
- Checkboxes for all 10 default foods
- Each row: `☐ Food Name [X]`
  - Checkbox: Toggle selection
  - [X]: Only visible when checked, clicking unchecks the item

**Section 2: Previously Used Custom Foods**
- Header: "Previously Used Custom Foods:" (bold)
- Only shown if custom foods exist in history
- Same checkbox format as defaults
- Foods loaded from `customFoodHistory` in localStorage

**Add Food Button:**
- Text: "+ Add Food"
- Click: Opens inline input or modal for adding brand new custom food

**Action Buttons:**

**Create Mode:**
- "Save and Start Survey" (primary blue button)
  - Validates: At least 1 food selected
  - Saves configuration to localStorage
  - Starts session
  - Navigates to `/welcome`

**Edit Mode:**
- "Save and Start Survey" (primary blue button)
  - Updates existing config
  - Starts session
  - Navigates to `/welcome`
- "Save and Close" (secondary gray button)
  - Updates existing config
  - Navigates back to `/load-survey`

**Behavior:**

**On Mount (Create Mode):**
- Clear all form fields
- Load default foods list (all unchecked)
- Load custom food history (all unchecked)

**On Mount (Edit Mode):**
- Load configuration by `configId`
- Pre-populate survey name
- Pre-check selected default foods
- Pre-check selected custom foods

**Food Selection:**
- Click checkbox OR click [X] → Toggle selection
- Track selected foods in component state

**+ Add Food Click:**
- Show inline input field below the button OR modal dialog
- Input field: "Food name"
- "Add" button
- On Add:
  1. Validate: Not empty, not duplicate
  2. Generate unique ID: `custom-{timestamp}`
  3. Add to selected foods for this survey
  4. Add to `customFoodHistory` in localStorage (if new)
  5. Display in "Previously Used Custom Foods" section
  6. Clear input field

**Save and Start Survey:**
1. Validate form:
   - At least 1 food selected (show error if none)
2. Generate or update configuration object
3. Save to localStorage `savedConfigurations`
4. If new custom foods added, update `customFoodHistory`
5. Set as activeConfig
6. Update metadata (lastUsed, timesUsed)
7. Log to Google Sheets (Configuration tab)
8. Set `sessionActive = true`
9. Navigate to `/welcome`

**Save and Close (Edit Mode Only):**
1. Same validation as above
2. Save/update configuration
3. Navigate to `/load-survey`

**Auto-naming Logic:**
- If name field is blank on save:
  - Check existing custom config names
  - Generate "Survey 1", "Survey 2", etc. (next available number)

---

### 4. Welcome Screen (Modified)

**File:** `src/screens/Welcome.jsx`

**Current State:** Existing screen with title, subtitle, and "Start Survey" button.

**Modifications Required:**

**Add UI Elements:**

**Top-Left Corner:**
- **Admin Button:** Small gray button with text "Admin"
  - Background: Light gray (#e0e0e0)
  - Text: Dark gray (#424242)
  - Padding: 8px 12px
  - Border-radius: 4px
  - Position: Absolute, top-left, aligned with blue header box

**Bottom-Left Corner:**
- **Game Over Button:** Small gray button with text "Game Over 🏁"
  - Same styling as Admin button
  - Position: Absolute, bottom-left, aligned with blue header box

**Updated Layout:**
```
┌─────────────────────────────────────┐
│ [Admin]                             │
│                                     │
│  ┌───────────────────────────────┐ │
│  │     🏈                        │ │
│  │  Welcome!                     │ │
│  │  Help us improve your         │ │
│  │  game day experience          │ │
│  └───────────────────────────────┘ │
│                                     │
│  Please provide feedback on the     │
│  food at our games by selecting     │
│  an emoji. Your input helps us      │
│  serve you better!                  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Start Survey                │ │
│  └───────────────────────────────┘ │
│                                     │
│ [Game Over 🏁]                      │
└─────────────────────────────────────┘
```

**Behavior:**

**Admin Button Click:**
1. Show password prompt modal
2. If correct password entered (`Game-time1`):
   - Open Admin Edit Panel (full-screen overlay)
3. If incorrect:
   - Show error message
   - Clear password field

**Game Over Button Click:**
1. Show confirmation dialog: "Is the game really over? :("
2. Buttons: "Yes" and "No"
3. If "Yes":
   - Clear `activeSession` from localStorage
   - Set `sessionActive = false`
   - Navigate to `/configure`
4. If "No":
   - Close dialog, stay on Welcome

**Start Survey Click:**
- Existing behavior: Navigate to `/food/0`

---

### 5. Thank You Screen (Modified)

**File:** `src/screens/ThankYou.jsx`

**Current State:** Displays thank you message, submits data to Google Sheets, "Submit Another Response" button.

**Modifications Required:**

**Add UI Elements:**
- Same as Welcome screen: Admin button (top-left), Game Over button (bottom-left)

**Updated Layout:**
```
┌─────────────────────────────────────┐
│ [Admin]                             │
│                                     │
│  ┌───────────────────────────────┐ │
│  │     🏈                        │ │
│  │  Thank you!                   │ │
│  │  Your feedback helps us make  │ │
│  │  game day even better!        │ │
│  └───────────────────────────────┘ │
│                                     │
│  GO BOMBERS! 🏈🎊                   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Submit Another Response     │ │
│  └───────────────────────────────┘ │
│                                     │
│ [Game Over 🏁]                      │
└─────────────────────────────────────┘
```

**Behavior:**
- Admin button: Same as Welcome screen
- Game Over button: Same as Welcome screen
- Submit Another Response: Existing behavior (reset survey, navigate to `/welcome`)

**Data Submission Changes:**
- Include new fields in POST to Google Sheets:
  - `survey_id`: Active config ID
  - `survey_name`: Active config name
  - `respondent_name`: User's optional name from Comments screen
  - Dynamic food ratings based on activeConfig

---

### 6. Comments Screen (Modified)

**File:** `src/screens/Comments.jsx`

**Current State:** Single textarea for "Any additional food ideas? (Optional)", Submit Survey button.

**Modifications Required:**

**Add Name Input Field:**

**Updated Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│  Any additional food ideas?         │
│  (Optional)                         │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Type here...                  │ │ (Textarea - half height)
│  │                               │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  Your name? (Optional)              │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Type here...                  │ │ (Text input - same half height)
│  └───────────────────────────────┘ │
│                                     │
│       🏈                            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   SUBMIT SURVEY               │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   BACK                        │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**UI Elements:**

**Comments Textarea:**
- Current textarea, but reduce height to ~50% of current
- Keep same width
- Placeholder: "Type here..."

**Name Input Field:**
- Label: "Your name? (Optional)"
- Single-line text input
- Same width as comments textarea
- Same height as comments textarea (for visual consistency)
- Placeholder: "Type here..."

**Behavior:**

**State Management:**
```javascript
const [comment, setComment] = useState('')
const [userName, setUserName] = useState('') // NEW
```

**Submit Button Click:**
```javascript
const handleSubmit = () => {
  responses.comments = comment
  responses.respondent_name = userName // NEW
  navigate('/thank-you')
}
```

---

## Component Specifications

### 1. Admin Edit Panel (Overlay Component)

**File:** `src/components/AdminEditPanel.jsx`

**Purpose:** Full-screen overlay that appears when admin clicks gear icon and enters password. Allows mid-session configuration editing.

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  currentConfig: Configuration,
  onSave: (updatedConfig: Configuration) => void
}
```

**Layout:**
- Full-screen overlay (covers entire viewport)
- Semi-transparent dark background behind content
- Content area: Same as Create/Edit Survey screen
- "Save Changes" button (instead of "Save and Start Survey")
- "Cancel" button

**Behavior:**

**On Mount:**
- Pre-populate with currentConfig data
- Load default foods
- Load custom food history
- Check selected foods based on currentConfig

**Save Changes Click:**
1. Validate: At least 1 food selected
2. Update configuration in localStorage
3. Update activeConfig in parent state
4. Call `onSave(updatedConfig)`
5. Close overlay
6. Changes apply immediately to active session

**Cancel Click:**
- Close overlay without saving
- No changes applied

**Implementation Notes:**
- Use React Portal for overlay rendering (render outside normal DOM hierarchy)
- Handle Escape key to close
- Prevent body scroll when open

---

### 2. Password Prompt Modal

**File:** `src/components/PasswordPrompt.jsx`

**Purpose:** Prompt admin for password before opening Admin Edit Panel.

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onSuccess: () => void
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │  Enter Admin Password         │ │
│  │                               │ │
│  │  [_____________________]      │ │
│  │                               │ │
│  │  [Submit]    [Cancel]         │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**UI Elements:**
- Centered modal (not full-screen)
- Dark semi-transparent background
- White content box with padding
- Password input field (type="password")
- Submit and Cancel buttons

**Behavior:**

**State:**
```javascript
const [password, setPassword] = useState('')
const [error, setError] = useState('')
```

**Submit Click:**
1. Check if password === 'Game-time1'
2. If correct:
   - Call `onSuccess()`
   - Close modal
3. If incorrect:
   - Show error message: "Incorrect password"
   - Clear password field
   - Keep modal open

**Cancel Click:**
- Close modal
- Clear password field and error

**Enter Key:**
- Trigger Submit behavior

---

### 3. Confirmation Dialog

**File:** `src/components/ConfirmDialog.jsx`

**Purpose:** Reusable confirmation dialog for various actions (Game Over, Delete Survey, Use Survey, etc.)

**Props:**
```javascript
{
  isOpen: boolean,
  title: string,
  message: string,
  confirmText: string,
  cancelText: string,
  onConfirm: () => void,
  onCancel: () => void
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │  {message}                    │ │
│  │                               │ │
│  │  [{confirmText}]  [{cancelText}]│
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Usage Examples:**

**Game Over Confirmation:**
```javascript
<ConfirmDialog
  isOpen={showGameOver}
  message="Is the game really over? :("
  confirmText="Yes"
  cancelText="No"
  onConfirm={handleEndSession}
  onCancel={() => setShowGameOver(false)}
/>
```

**Delete Survey Confirmation:**
```javascript
<ConfirmDialog
  isOpen={showDeleteConfirm}
  message={`Delete ${surveyName}? This cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={handleDeleteSurvey}
  onCancel={() => setShowDeleteConfirm(false)}
/>
```

---

### 4. Add Custom Food Input

**File:** `src/components/AddCustomFood.jsx`

**Purpose:** Inline input or modal for adding brand new custom food item.

**Props:**
```javascript
{
  onAdd: (foodName: string) => void,
  existingFoods: string[] // For duplicate checking
}
```

**Layout (Inline Version):**
```
[+ Add Food] (button)

(When clicked, shows input below:)

┌─────────────────────────────────────┐
│ Food name: [________________] [Add] │
└─────────────────────────────────────┘
```

**State:**
```javascript
const [isAdding, setIsAdding] = useState(false)
const [foodName, setFoodName] = useState('')
const [error, setError] = useState('')
```

**Behavior:**

**+ Add Food Click:**
- Toggle `isAdding = true`
- Show input field

**Add Button Click:**
1. Validate:
   - Not empty
   - Not duplicate (check against existingFoods)
2. If valid:
   - Call `onAdd(foodName)`
   - Clear input
   - Set `isAdding = false`
3. If invalid:
   - Show error message

**Escape Key / Click Outside:**
- Cancel adding
- Clear input
- Set `isAdding = false`

---

## Google Apps Script

### New Google Sheet Setup

**Sheet Name:** "Bomber Food Survey V2" (or similar)

**Create 2 Tabs:**

#### Tab 1: "Survey Responses V2"

**Purpose:** Store all survey responses with dynamic columns for custom foods.

**Initial Columns:**
1. Respondent ID (number)
2. Survey ID (text)
3. Survey Name (text)
4. Respondent Name (text, optional)
5. Wings (emoji)
6. Chicken Fingers (emoji)
7. Spring Rolls (emoji)
8. Sliders (emoji)
9. Fruit & Veggie (emoji)
10. Samosas (emoji)
11. Popcorn (emoji)
12. Perogies (emoji)
13. Chips & Dips (emoji)
14. Pizza (emoji)
15. Comments (text)
16. Date (date string)
17. Timestamp (auto-generated)

**Dynamic Columns:**
- Custom food columns added as needed (e.g., "Caesar Salad", "Nachos")

**Header Formatting:**
- Background: Bomber blue (#003B7C)
- Font color: White
- Font weight: Bold
- Frozen row: 1

#### Tab 2: "Survey Configurations"

**Purpose:** Track all survey configurations created and used.

**Columns:**
1. Survey ID (text)
2. Survey Name (text)
3. Default Foods (comma-separated list)
4. Custom Foods (comma-separated list)
5. Created Date (date string)
6. Last Used (date string)
7. Times Used (number)

**Header Formatting:**
- Same as Tab 1

---

### Google Apps Script Code

**File:** `google-apps-script-v2.gs` (new file)

**Configuration:**
```javascript
const SHEET_ID = 'YOUR_NEW_GOOGLE_SHEET_ID_HERE'
const RESPONSES_SHEET_NAME = 'Survey Responses V2'
const CONFIGS_SHEET_NAME = 'Survey Configurations'
```

**Main Functions:**

#### 1. `doPost(e)` - Handle POST requests from React app

**Responsibilities:**
- Parse incoming JSON data
- Determine request type (survey response vs. config update)
- Route to appropriate handler

**Request Types:**

**Survey Response:**
```javascript
{
  type: 'survey_response',
  data: {
    respondent_id: 42,
    survey_id: 'config-1729000000000',
    survey_name: 'Survey 1',
    respondent_name: 'John Doe',
    wings: '😍',
    chicken_fingers: '😐',
    caesar_salad: '🤢', // custom food
    comments: 'Great!',
    date: '2025-10-14'
  }
}
```

**Configuration Update:**
```javascript
{
  type: 'config_update',
  data: {
    survey_id: 'config-1729000000000',
    survey_name: 'Survey 1',
    default_foods: 'Wings,Chicken Fingers',
    custom_foods: 'Caesar Salad,Nachos',
    created_date: '2025-10-14',
    last_used: '2025-10-14',
    times_used: 1
  }
}
```

#### 2. `handleSurveyResponse(data)` - Process survey response

**Logic:**
1. Open Responses sheet
2. Check if headers exist, create if not
3. For each food in the data:
   - Check if column exists
   - If not, add new column (dynamic column creation)
4. Map data to row array
5. Append row to sheet
6. Return success response

**Dynamic Column Creation:**
```javascript
function addColumnIfNeeded(sheet, columnName) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const columnIndex = headers.indexOf(columnName)

  if (columnIndex === -1) {
    // Column doesn't exist, add it before Comments column
    const commentsIndex = headers.indexOf('Comments')
    sheet.insertColumnBefore(commentsIndex)
    sheet.getRange(1, commentsIndex).setValue(columnName)

    // Apply header formatting
    const newHeader = sheet.getRange(1, commentsIndex)
    newHeader.setBackground('#003B7C')
    newHeader.setFontColor('#FFFFFF')
    newHeader.setFontWeight('bold')

    return commentsIndex
  }

  return columnIndex + 1 // Return 1-based index
}
```

#### 3. `handleConfigUpdate(data)` - Update configuration tracking

**Logic:**
1. Open Configs sheet
2. Check if config ID exists
3. If exists: Update row (lastUsed, timesUsed)
4. If not: Add new row
5. Return success response

**Example Implementation:**
```javascript
function handleConfigUpdate(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CONFIGS_SHEET_NAME)

  // Find existing config by ID
  const configIds = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues()
  const rowIndex = configIds.findIndex(row => row[0] === data.survey_id)

  if (rowIndex !== -1) {
    // Update existing config
    const actualRow = rowIndex + 2 // Account for header and 0-based index
    sheet.getRange(actualRow, 6).setValue(data.last_used) // Last Used
    sheet.getRange(actualRow, 7).setValue(data.times_used) // Times Used
  } else {
    // Add new config
    sheet.appendRow([
      data.survey_id,
      data.survey_name,
      data.default_foods,
      data.custom_foods,
      data.created_date,
      data.last_used,
      data.times_used
    ])
  }
}
```

#### 4. `setupSheets()` - Initialize sheets with headers

**Purpose:** Manually run function to create initial sheet structure.

**Implementation:**
```javascript
function setupSheets() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID)

  // Setup Responses Sheet
  let responsesSheet = spreadsheet.getSheetByName(RESPONSES_SHEET_NAME)
  if (!responsesSheet) {
    responsesSheet = spreadsheet.insertSheet(RESPONSES_SHEET_NAME)
  }

  const responseHeaders = [
    'Respondent ID', 'Survey ID', 'Survey Name', 'Respondent Name',
    'Wings', 'Chicken Fingers', 'Spring Rolls', 'Sliders',
    'Fruit & Veggie', 'Samosas', 'Popcorn', 'Perogies',
    'Chips & Dips', 'Pizza', 'Comments', 'Date', 'Timestamp'
  ]
  responsesSheet.getRange(1, 1, 1, responseHeaders.length).setValues([responseHeaders])
  formatHeaders(responsesSheet, responseHeaders.length)

  // Setup Configs Sheet
  let configsSheet = spreadsheet.getSheetByName(CONFIGS_SHEET_NAME)
  if (!configsSheet) {
    configsSheet = spreadsheet.insertSheet(CONFIGS_SHEET_NAME)
  }

  const configHeaders = [
    'Survey ID', 'Survey Name', 'Default Foods', 'Custom Foods',
    'Created Date', 'Last Used', 'Times Used'
  ]
  configsSheet.getRange(1, 1, 1, configHeaders.length).setValues([configHeaders])
  formatHeaders(configsSheet, configHeaders.length)
}

function formatHeaders(sheet, numColumns) {
  const headerRange = sheet.getRange(1, 1, 1, numColumns)
  headerRange.setBackground('#003B7C')
  headerRange.setFontColor('#FFFFFF')
  headerRange.setFontWeight('bold')
  sheet.setFrozenRows(1)
}
```

---

### Deploy Google Apps Script

**Steps:**
1. Create new Google Sheet: "Bomber Food Survey V2"
2. Copy Sheet ID from URL
3. Open Apps Script editor (Extensions > Apps Script)
4. Paste script code
5. Update `SHEET_ID` constant
6. Run `setupSheets()` function (authorize if needed)
7. Deploy as web app:
   - Click "Deploy" > "New deployment"
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Click "Deploy"
8. Copy web app URL
9. Update React app environment variable:
   - Create `.env` file in project root
   - Add: `VITE_GOOGLE_SHEETS_API_URL_V2=<your-web-app-url>`

---

## Implementation Checklist

### Phase 1: Setup & Foundation
- [x] Create `new-features` branch from `main`
- [ ] Create new Google Sheet "Bomber Food Survey V2"
- [ ] Deploy Google Apps Script v2
- [x] Update `.env` with new API URL (placeholder added)
- [x] Create data structure constants file (`src/constants/foods.js`)
- [x] Create utility functions file (`src/utils/configManager.js`)

### Phase 2: Core Components
- [x] Create `PasswordPrompt.jsx` component
- [x] Create `ConfirmDialog.jsx` component
- [x] Create `AddCustomFood.jsx` component
- [x] Create `AdminEditPanel.jsx` component

### Phase 3: New Screens
- [x] Create `Configure.jsx` screen
- [x] Create `LoadSurvey.jsx` screen
- [x] Create `CreateSurvey.jsx` screen

### Phase 4: Modify Existing Screens
- [x] Modify `Welcome.jsx` - Add Admin and Game Over buttons
- [x] Modify `ThankYou.jsx` - Add Admin and Game Over buttons
- [x] Modify `Comments.jsx` - Add name input field
- [x] Modify `FoodRating.jsx` - Support dynamic food list

### Phase 5: State Management & Routing
- [ ] Update `App.jsx` - Add new state variables
- [ ] Update `App.jsx` - Add new routes
- [ ] Update `App.jsx` - Add configuration management logic
- [x] Create localStorage manager utility (configManager.js)

### Phase 6: Google Sheets Integration
- [x] Update `ThankYou.jsx` - Submit to new Google Sheets API
- [x] Add config update API calls (googleSheets.js utility)
- [ ] Test dynamic column creation

### Phase 7: Testing
- [ ] Test Feature 1: Name input flow
- [ ] Test Feature 2.1: Configuration creation
- [ ] Test Feature 2.1: Configuration editing
- [ ] Test Feature 2.1: Configuration deletion
- [ ] Test Feature 2.1: Session management
- [ ] Test Feature 2.1: Admin edit panel
- [ ] Test Feature 2.1: Game Over flow
- [ ] Test Google Sheets data submission
- [ ] Test localStorage persistence
- [ ] Test on actual tablet device
- [ ] Test refresh/screen lock behavior

### Phase 8: Polish & Deployment
- [ ] Style all new components to match existing design
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success messages
- [ ] Update README with new features
- [ ] Create user guide for admins
- [ ] Merge to `main` after testing complete
- [ ] Deploy to GitHub Pages

---

## Testing Plan

### Feature 1: User Names

**Test Cases:**
1. User enters name → Verify appears in Google Sheets
2. User leaves name blank → Verify empty/blank in Google Sheets
3. User enters very long name → Verify truncation or full capture
4. Special characters in name → Verify proper encoding

**Expected Results:**
- Name field optional, no validation errors if blank
- Data properly stored in "Respondent Name" column

---

### Feature 2.1: Admin Controller

#### Configuration Management

**Test Cases:**

**TC1: Create New Survey**
1. Click "New Survey" from Configure screen
2. Leave name blank, select 2 default foods
3. Save and Start
4. Verify auto-generated name ("Survey 1")
5. Verify config saved in localStorage
6. Verify config logged to Google Sheets

**TC2: Edit Existing Survey**
1. Load saved survey
2. Click Edit
3. Change name, add 1 custom food
4. Save and Close
5. Verify changes reflected in Load Survey screen
6. Verify localStorage updated

**TC3: Delete Survey**
1. Load saved custom survey
2. Click Delete
3. Confirm deletion
4. Verify removed from Load Survey screen
5. Verify removed from localStorage

**TC4: Use Survey**
1. Click Use on saved survey
2. Verify navigates to Welcome
3. Take survey with only selected foods
4. Verify data submitted correctly

**TC5: Default Survey Protection**
1. Verify Default Survey cannot be deleted
2. Verify Default Survey can be edited
3. Verify edits to Default persist

**TC6: Maximum Saved Configs**
1. Create 2 custom surveys
2. Attempt to create 3rd custom survey
3. Verify error or disabled state

#### Custom Foods

**Test Cases:**

**TC7: Add Custom Food**
1. Create new survey
2. Click "+ Add Food"
3. Enter "Caesar Salad"
4. Verify appears in food list (checked)
5. Verify [X] appears next to it

**TC8: Custom Food Persistence**
1. Add custom food "Nachos" to Survey 1
2. Save and complete session
3. Create new Survey 2
4. Verify "Nachos" appears in "Previously Used Custom Foods"

**TC9: Custom Food in Google Sheets**
1. Create survey with custom food "Loaded Fries"
2. Take survey, rate custom food
3. Verify new column created in Google Sheets
4. Verify rating appears in correct column

**TC10: Multiple Custom Foods Same Name**
1. Attempt to add duplicate custom food
2. Verify error or prevented

#### Session Management

**Test Cases:**

**TC11: Start Session**
1. Select survey and start session
2. Verify sessionActive = true
3. Verify activeConfig set correctly
4. Verify can take multiple surveys in loop

**TC12: Game Over**
1. During active session, click "Game Over"
2. Confirm dialog
3. Verify session ends
4. Verify navigates to Configure screen
5. Verify can start new session

**TC13: Refresh During Session**
1. Start session
2. Refresh browser (or lock tablet)
3. Verify returns to Welcome
4. Verify session still active
5. Verify can continue taking surveys

**TC14: Refresh Between Sessions**
1. No active session
2. Refresh browser
3. Verify stays on Configure screen

#### Admin Panel

**Test Cases:**

**TC15: Password Protection**
1. Click "Admin" button
2. Enter incorrect password
3. Verify error message
4. Enter correct password ("Game-time1")
5. Verify opens Admin Edit Panel

**TC16: Mid-Session Edit**
1. Active session in progress
2. Open Admin panel
3. Add 1 food item
4. Save changes
5. Verify next respondent sees updated food list
6. Verify current partial survey not affected

**TC17: Admin Panel Cancel**
1. Open Admin panel
2. Make changes
3. Click Cancel
4. Verify changes not saved

#### Google Sheets Integration

**Test Cases:**

**TC18: Survey Response Submission**
1. Complete survey with custom foods
2. Verify row added to "Survey Responses V2" tab
3. Verify all fields correct:
   - Respondent ID
   - Survey ID
   - Survey Name
   - Respondent Name
   - Food ratings (defaults and customs)
   - Comments
   - Date
   - Timestamp

**TC19: Configuration Logging**
1. Create new survey
2. Start session
3. Verify row added to "Survey Configurations" tab
4. Verify fields:
   - Survey ID
   - Survey Name
   - Default Foods list
   - Custom Foods list
   - Created Date
   - Last Used
   - Times Used

**TC20: Configuration Update**
1. Use existing survey again
2. Verify "Times Used" increments
3. Verify "Last Used" updates

**TC21: Dynamic Column Creation**
1. First survey with custom food "Caesar Salad"
2. Verify column created in Responses sheet
3. Second survey with custom food "Nachos"
4. Verify new column created
5. Verify previous responses show "-" for new column

#### Edge Cases

**Test Cases:**

**TC22: Empty Survey Prevention**
1. Create survey with 0 foods selected
2. Attempt to save
3. Verify error message
4. Verify cannot save

**TC23: Very Long Custom Food Name**
1. Add custom food with 100+ characters
2. Verify handling (truncation or scrolling)

**TC24: Special Characters in Survey Name**
1. Create survey with name "Test & Survey #1"
2. Verify saves correctly
3. Verify displays correctly

**TC25: localStorage Full**
1. Create many surveys (stress test)
2. Verify graceful handling if localStorage limit reached

**TC26: Network Failure**
1. Submit survey with network disconnected
2. Verify error handling
3. Verify user feedback

---

## File Structure

```
bomber-app/
├── src/
│   ├── components/
│   │   ├── PasswordPrompt.jsx          (NEW)
│   │   ├── ConfirmDialog.jsx           (NEW)
│   │   ├── AddCustomFood.jsx           (NEW)
│   │   └── AdminEditPanel.jsx          (NEW)
│   ├── screens/
│   │   ├── Configure.jsx               (NEW)
│   │   ├── LoadSurvey.jsx              (NEW)
│   │   ├── CreateSurvey.jsx            (NEW)
│   │   ├── Welcome.jsx                 (MODIFIED)
│   │   ├── ThankYou.jsx                (MODIFIED)
│   │   ├── Comments.jsx                (MODIFIED)
│   │   └── FoodRating.jsx              (MODIFIED)
│   ├── constants/
│   │   └── foods.js                    (NEW - default foods array)
│   ├── utils/
│   │   ├── configManager.js            (NEW - localStorage operations)
│   │   └── googleSheets.js             (NEW - API calls)
│   ├── App.jsx                         (MODIFIED)
│   ├── App.css                         (MODIFIED)
│   └── main.jsx
├── google-apps-script-v2.gs            (NEW)
├── .env                                (MODIFIED - add new API URL)
├── IMPLEMENTATION_PLAN.md              (THIS FILE)
├── NEW_FEATURES_DISCUSSION.md
└── README.md                           (UPDATE after implementation)
```

---

## Key Implementation Notes

### 1. Food ID Consistency
- Use kebab-case IDs for default foods (e.g., `chicken_fingers`)
- Use timestamp-based IDs for custom foods (e.g., `custom-1729000000001`)
- Never change default food IDs (breaks Google Sheets columns)

### 2. Configuration ID Generation
```javascript
function generateConfigId() {
  return `config-${Date.now()}`
}

function generateCustomFoodId() {
  return `custom-${Date.now()}`
}
```

### 3. Auto-naming Logic
```javascript
function generateAutoName(existingConfigs) {
  const customConfigs = existingConfigs.filter(c => !c.isDefault)
  const existingNumbers = customConfigs
    .map(c => c.name.match(/Survey (\d+)/))
    .filter(Boolean)
    .map(match => parseInt(match[1]))

  const nextNumber = existingNumbers.length > 0
    ? Math.max(...existingNumbers) + 1
    : 1

  return `Survey ${nextNumber}`
}
```

### 4. LocalStorage Size Management
- Monitor localStorage usage
- Implement cleanup for very old configurations if needed
- Warn user if approaching limits

### 5. Password Security Note
- Password is hardcoded (`Game-time1`) for simplicity
- Stored in plain text in code (acceptable for internal use)
- For production with higher security needs, consider backend authentication

### 6. Google Sheets API Error Handling
- Always use `no-cors` mode (required for Google Apps Script)
- Cannot read response status
- Assume success if no error thrown
- Log errors to console for debugging

---

## Design Consistency Guidelines

### Colors
- **Primary Blue:** #003B7C (Bombers blue - headers, primary buttons)
- **Background:** Tan/beige (#d4b896 or similar)
- **Success Green:** #d4edda (survey cards background)
- **Gray Buttons:** #e0e0e0 background, #424242 text (Admin, Game Over)
- **Error Red:** #d32f2f (error messages)

### Typography
- **Headers:** Bold, large (e.g., 24px)
- **Body Text:** Regular, medium (e.g., 16px)
- **Button Text:** Bold, medium (e.g., 16px)
- **Small Text:** Regular, small (e.g., 14px) - metadata

### Spacing
- **Card Padding:** 20px
- **Button Padding:** 12px 24px
- **Section Spacing:** 16px margin between sections
- **Input Padding:** 10px

### Buttons
- **Primary:** Blue background (#003B7C), white text, rounded corners (8px)
- **Secondary:** Gray background (#e0e0e0), dark gray text, rounded corners (8px)
- **Small:** Smaller padding (8px 12px), smaller font (14px)

### Animations
- **Modal Fade:** 200ms ease-in-out
- **Expand/Collapse:** 300ms ease
- **Button Hover:** Slight darkening, no transition delay

---

## Success Criteria

### Feature 1: User Names
- [ ] Name input field appears on Comments screen
- [ ] Name is optional (no validation errors if blank)
- [ ] Name appears in Google Sheets "Respondent Name" column
- [ ] Name properly handles special characters and long text

### Feature 2.1: Admin Controller
- [ ] Configuration screen appears on app load
- [ ] Can create, edit, delete, and use survey configurations
- [ ] Configurations persist in localStorage
- [ ] Configurations track metadata (lastUsed, timesUsed)
- [ ] Default survey always available and cannot be deleted
- [ ] Up to 2 custom surveys can be saved (3 total including default)
- [ ] Custom foods can be added and are remembered
- [ ] Survey session loops correctly (Welcome → Foods → Comments → Thank You → Welcome)
- [ ] "Game Over" ends session and returns to Configuration screen
- [ ] Admin panel accessible mid-session with password
- [ ] Google Sheets logs all configurations and responses
- [ ] Dynamic columns created for custom foods
- [ ] Tablet refresh/screen lock preserves session state
- [ ] All UI elements match existing design style

---

## Post-Implementation Tasks

### Documentation
- [ ] Update README with new features
- [ ] Create admin user guide (how to use configuration features)
- [ ] Document Google Sheets structure
- [ ] Document localStorage schema

### User Training
- [ ] Create quick reference guide for admins
- [ ] Test with actual admin users
- [ ] Gather feedback

### Performance Optimization
- [ ] Test with many custom foods (50+)
- [ ] Test with large localStorage data
- [ ] Optimize re-renders in food selection

### Future Enhancements (Post-2.1)
- [ ] Export/import configurations (backup/restore)
- [ ] Bulk delete old configurations
- [ ] Analytics dashboard (view usage stats)
- [ ] Photo recognition (Feature 2.2 - separate branch)

---

**End of Implementation Plan**

This plan should be referenced throughout the implementation process. Update status as tasks are completed. Any deviations from this plan should be documented with reasoning.

**Ready for implementation on `new-features` branch!**
