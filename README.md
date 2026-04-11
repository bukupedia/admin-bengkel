# [Beta-19] Changes Made

Codebase: beta-18

Fix issues in servis.html and servis.js:

1. **servis.html** (line 7-8): Fixed the `<link>` tags by adding the missing `rel="stylesheet"` attribute. The original code had `href` as the first attribute which is incorrect - CSS links should have `rel="stylesheet"` first.

2. **servis.js** (line 289): Fixed wrong class selector `.item-name` to `.part-input`. The `calculateTotal()` function was trying to access `.item-name` but this class doesn't exist in the HTML template - the correct class is `.part-input`.

Both files should now work correctly.
