# [Alpha-25] Changes Made

Codebase: alpha-24

Focus on auto Stock Management. audit code, find bugs, and fix issues

## Stock Management Audit Complete - Bugs Fixed

I've thoroughly analyzed and fixed the auto stock management system. Here's a summary of bugs found and fixes applied:

### 🚨 Critical Bugs Found & Fixed:

**1. `saveServis()` - Stock reduced prematurely (FIXED)**
- **Issue:** Stock was reduced when servis was created (status: "menunggu")
- **Fix:** Removed stock reduction from `saveServis()`. Stock now only reduced when status changes to "selesai" (completed)

**2. `updateStatus()` - No stock adjustment on status change (FIXED)**
- **Issue:** Changing status to "selesai" didn't reduce stock; reverting from "selesai" didn't return stock
- **Fix:** Now properly:
  - Reduces stock when status changes TO "selesai"
  - Returns stock when status changes FROM "selesai" to another status

**3. `deleteServis()` - Stock not returned (FIXED)**
- **Issue:** Deleting completed servis didn't return stock
- **Fix:** Now returns stock only if the servis was "selesai" when deleted

**4. `cancelServis()` - Always returned stock (FIXED)**
- **Issue:** Canceling a non-completed servis would incorrectly return stock (that was never reduced)
- **Fix:** Now only returns stock if servis was "selesai" when canceled

**5. `saveEditServis()` - Stock manipulated regardless of status (FIXED)**
- **Issue:** Editing always manipulated stock, even when servis wasn't completed
- **Fix:** Now only adjusts stock if servis was "selesai" at time of edit

**6. Edit modal max quantity - Always added original qty (FIXED)**
- **Issue:** Edit modal always showed stock + original qty regardless of completion status
- **Fix:** Now correctly calculates max qty based on whether servis was completed

**7. No low stock warning (ADDED)**
- **Added:** Warning alert when sparepart stock falls below threshold (5 units)

### ✅ How Stock Management Works Now:

| Action | Stock Behavior |
|--------|--------------|
| Create Servis | Stock NOT reduced (available for other jobs) |
| Complete Servis ("selesai") | Stock IS reduced |
| Edit Completed Servis | Returns old stock → checks new stock → reduces new |
| Edit In-Progress Servis | No stock changes |
| Cancel Completed Servis | Stock returned |
| Cancel In-Progress Servis | No stock changes |
| Delete Completed Servis | Stock returned |
| Delete In-Progress Servis | No stock changes |
| Stock ≤ 5 units | Warning alert shown
