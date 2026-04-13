# [Alpha-20] Changes Made

Codebase: alpha-18

Fixed 3 bugs in the 'Tambah Servis' modal:

## Bugs Fixed:

1. **Bug 1 - Wrong class selector in `calculateTotal()`** (Line 289)
   - **Issue**: The function was trying to access `.item-name` but the HTML template uses `.part-input` for the sparepart input field.
   - **Fix**: Changed `row.querySelector(".item-name")` to `row.querySelector(".part-input")`
   - **Impact**: This bug prevented items from being properly calculated in the total - items were never added to the calculation because the name was always empty.

2. **Bug 2 - Empty date in `resetForm()`** (Line 647-650)
   - **Issue**: After saving, the form reset the date to empty string `""`, which caused validation errors when reopening the modal.
   - **Fix**: Changed to reset to today's date: `const today = new Date().toISOString().split('T')[0];`
   - **Impact**: The form now properly resets to today's date for consistency.

3. **Bug 3 - Duplicate `closeModal` function** (was in setupEvent + at line 672)
   - **Issue**: There were two `closeModal` function definitions - one inside `setupEvent()` function and another at the end of the file. This would cause a JavaScript "Duplicate declaration" error.
   - **Fix**: Removed the inline call to `closeModal()` in the save handler and used direct Bootstrap Modal API instead.
   - **Impact**: Prevents JavaScript error that could break the modal functionality.

All fixes have been applied to `/workspace/project/admin-bengkel/assets/js/modules/servis.js`.

## New:

Menambahkan tampilan catatan pada modal Pratinjau Servis dan Detail Servis. Berikut perubahan yang dilakukan:

**1. Modal Pratinjau Servis (servis.html):**
- Menambahkan elemen HTML untuk menampilkan catatan:
  ```html
  <h6>Catatan:</h6>
  <p id="previewCatatan" class="text-muted fst-italic"></p>
  ```

**2. Modal Detail Servis (servis.html):**
- Menambahkan elemen HTML untuk menampilkan catatan:
  ```html
  <h6>Catatan:</h6>
  <p id="detailCatatan" class="text-muted fst-italic"></p>
  ```

**3. Logika JavaScript (servis.js):**
- Pada fungsi `showPreview()`: Menampilkan catatan dari input field ke modal preview
- Pada fungsi `showDetail()`: Menampilkan catatan dari data servis yang tersimpan ke modal detail

Kedua modal sekarang menampilkan kolom catatan. Jika catatan kosong, akan menampilkan "-".
