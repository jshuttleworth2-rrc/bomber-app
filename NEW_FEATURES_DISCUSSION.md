# New Features Discussion

## Meeting Date: 2025-10-09

---

## Overview
The Bomber Food Survey app needs new features to be implemented on a separate branch (`new-features`) to allow testing before deployment. The main branch will remain untouched as a fallback option.

---

## Features to Implement (In Order)

### **Feature 1: User Names (Optional)**
**Status:** Ready to implement - all details confirmed

**Implementation Details:**
- Add a name input field at the end of the survey (after comments page)
- Label: "Your name (Optional, remaining anonymous is ok)"
- Single text input field
- Data stored in Google Sheets alongside other survey responses
- Users can skip/leave blank to remain anonymous

---

### **Feature 2.1: Admin Controller**
**Status:** Most details confirmed - needs discussion on naming convention

#### **Admin Access:**
- Settings gear icon on Welcome page and Thank You page
- Clicking icon prompts for password entry
- Password: `Game-time1`
- No user login or 2FA - keeping it simple
- Access to dedicated admin page/panel

#### **Admin Capabilities:**
- Select which food items appear in the survey (from default list of 10)
- Add custom food items not in the default list (e.g., "Caesar Salad")
- Custom food items: name only, no image (blank image area)
- Ability to reset to default 10-item survey
- Can create and reuse configurations for different games

#### **Configuration Storage Strategy:**
- **Primary:** localStorage on the tablet (fast, works offline, immediate)
- **Secondary:** Google Sheets backup/logging (historical record)

**Workflow:**
1. Admin brings single tablet to game
2. Opens admin settings (gear icon → password)
3. Either loads previous configuration OR creates new one OR uses default
4. Configuration saves to localStorage (active on tablet)
5. Configuration logs to Google Sheets with timestamp
6. Admin passes tablet to survey takers
7. All responses reference the active configuration

#### **Google Sheets Structure:**

**Tab 1: "Survey Responses"** (existing, modified)
- Each row = one person's survey response
- New columns: `Config ID` (or name TBD), `Name` (optional user name)
- Food items not in active config show as "-" or blank
- Example columns: Respondent ID | Config ID | Name | Wings | Chicken Fingers | ... | Custom Items | Comments | Date | Timestamp

**Tab 2: "Survey Configurations"** (new)
- Each row = one saved configuration
- Columns: Config ID | Config Name | Food Items (list) | Created Date | Last Used | Times Used
- Tracks configuration history for reporting/reuse

**Example Scenario:**
- 3 games played
- Game 1 uses "Wings + Fingers + Caesar" config
- Game 2 uses "Game Day Special" config
- Game 3 reuses "Wings + Fingers + Caesar" config
- Result: 2 rows in Survey Configurations tab, all responses in Survey Responses tab with their respective Config ID

---

### **Feature 2.2: Photo Recognition for Food Items**
**Status:** Future feature - separate branch after 2.1 is complete

**Implementation Details:**
- Admin can take photos of food at the game
- System recognizes what type of food it is
- Automatically adds identified food to survey
- **Branch name:** TBD (separate from `new-features`)
- **Priority:** Not critical, implement after 2.1 is fully tested

---

## Items Still Needing Discussion

### **1. Configuration ID/Name Convention**
**Issue:** "CONFIG-001" is not memorable or human-friendly

**Questions to resolve:**
- What naming convention should we use?
- Options could include:
  - Date-based: "Oct-9-2025-Game" or "2025-10-09"
  - Descriptive: Admin enters custom name like "Home Opener" or "Playoff Game"
  - Food-based: Auto-generate from items like "Wings-Fingers-Caesar"
  - Combination: Date + custom name
- Should the admin be required to name each configuration?
- Should configurations auto-generate names with option to customize?

### **2. Admin Screen Design**
**Status:** Design mockup to be provided later

**Pending:**
- Visual layout of admin panel
- How food selection interface looks
- How configuration saving/loading interface looks

### **3. Configuration Management Details**
**Questions to potentially discuss:**
- Should there be a limit on how many saved configurations can exist?
- Should admins be able to delete old configurations?
- How should the "load previous configuration" interface work?
- Should configurations show preview of food items before loading?

### **4. Google Apps Script Updates**
**To be determined during implementation:**
- How to handle dynamic columns for custom food items
- Schema for Survey Configurations tab
- How to track which configuration was used for each response

---

## Branch Strategy

### **Main Branch:**
- Remains unchanged
- Current production-ready version
- Fallback if new features aren't ready

### **New-Features Branch:**
- Implement Feature 1 first
- Test Feature 1
- Implement Feature 2.1
- Test Feature 2.1
- Merge to main only when fully tested and approved

### **Future Branch (for Feature 2.2):**
- Created after Feature 2.1 is complete
- Photo recognition feature
- Separate testing cycle

---

## Next Steps
1. Discuss and decide on Configuration ID/naming convention
2. Review admin screen design mockup (when ready)
3. Create `new-features` branch
4. Implement Feature 1 (user names)
5. Test Feature 1
6. Implement Feature 2.1 (admin controller)
7. Test Feature 2.1

---

## Notes
- Single tablet workflow: one device per game, admin configures on-site
- Offline-first approach: localStorage primary, Google Sheets backup
- Maintain simplicity: no complex authentication, straightforward UI
- Historical tracking: keep record of configurations used at each game for reporting
