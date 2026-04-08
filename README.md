# [Beta-8] Changes Made

**sparepart.html:**
- Menambahkan kolom "Quantity" pada tabel header
- Menambahkan input field "Quantity" pada form modal tambah/edit sparepart

**assets/js/modules/sparepart.js:**
- Menampilkan quantity pada setiap baris tabel
- Menyimpan quantity saat menambah sparepart baru
- Memuat quantity saat edit sparepart
- Mengosongkan field quantity saat form dibersihkan

Sekarang halaman Sparepart memiliki kolom Quantity yang berfungsi penuh.

## Update

Sparepart dengan quantity '0' tidak akan muncul di dropdown "Pilih Sparepart" pada modal 'Tambah Servis'.

Perubahan yang dilakukan di `assets/js/modules/servis.js`:
-Pada fungsi `addItemRow()`, sparepart difilter terlebih dahulu sehingga hanya sparepart dengan quantity > 0 yang ditampilkan di dropdown.

Sekarang pengguna hanya dapat memilih sparepart yang memiliki stok (quantity lebih dari 0).
