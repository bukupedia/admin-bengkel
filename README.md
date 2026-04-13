# [Alpha-26] Changes Made

Codebase: alpha-25

Audit seluruh kode pada aplikasi. hapus kode duplikat dan kode yang sudah tidak digunakan dalam aplikasi saat ini

### 1. Kode yang Dihapus (Tidak Digunakan)

**`assets/js/modules/auth.js`:**
- ❌ Menghapus fungsi `getLockoutTimeRemaining()` yang tidak pernah dipanggil dari luar file
- Fungsi ini hanya digunakan secara internal untuk menghitung waktu lockout, yang kemudian di-refactor ke dalam fungsi `login()` secara langsung

### 2. Kode Duplikat yang Di-refactor

**`assets/js/modules/servis.js` (1213 baris → 1187 baris):**
- ❌ Menghapus ~26 baris kode duplikat untuk manajemen stock

**Refaktor yang dilakukan:**
- Menambahkan 2 fungsi helper baru:
  - `returnStock(items)` - Mengembalikan stock sparepart
  - `reduceStock(items)` - Mengurangi stock sparepart

- Menerapkan helper functions ini di 4 lokasi:
  1. `deleteServis()` - hapus servis
  2. `cancelServis()` - Batalkan servis
  3. `updateStatus()` - Update status servis
  4. `saveEditServis()` - Simpan perubahan edit servis

### 3. Hasil Audit Tambahan

**Kode yang tetap digunakan tapi tidak dihapus:**
- `getSearchQuery()` di `sparepart.js` - digunakan di 3 tempat (init, delete, render)
- `getPartStock()` di `servis.js` - digunakan di 2 tempat (validasi qty input)

**Tidak ada yang perlu dihapus:**
- Tidak ada `console.log`, `TODO`, atau `FIXME` yang tersisa
- Tidak ada CSS yang tidak digunakan
- Semua kode sudah bersih

### File yang Diubah:
1. `assets/js/modules/auth.js` - Hapus fungsi tidak digunakan
2. `assets/js/modules/servis.js` - Refactor kode duplikat stock management

Semua perubahan sudah diverifikasi syntactically correct dan tidak mempengaruhi fungsionalitas aplikasi.
