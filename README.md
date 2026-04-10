# [Beta-14] Changes Made

Codebase: beta-9

## Fitur yang Ditambahkan:

### 1. Datalist untuk Pelanggan
- Menggunakan `<input>` dengan `<datalist>` untuk fitur pencarian
- Menampilkan nama pelanggan + nomor polisi di opsi
- Filter langsung hasil pencarian saat mengetik
- Validasi jika pelanggan yang dipilih tidak valid

### 2. Datalist untuk Sparepart
- Setiap baris item memiliki datalist unik
- Menampilkan informasi stok di setiap opsi
- Sparepart dengan stok 0 otomatis disabled (tidak bisa dipilih)
- Filter langsung saat mengetik

### 3. Tombol Plus/Minus untuk Quantity
- Desain seperti keranjang belanja e-commerce
- Tombol `-` untuk mengurangi, `+` untuk menambah
- Batas minimum: 1
- Batas maksimum: sesuai stok tersedia

### 4. Informasi Stok
- Tampil di bawah input sparepart setelah dipilih
- warna hijau untuk stok tersedia, merah untuk stok rendah
- Validasi real-time saat jumlah diubah

### 5. Pengurangan Stok Saat Simpan
- Stok sparepart dikurangi sesuai quantity yang digunakan
- Hanya sparepart yang dipilih dari datalist yang stoknya berkurang
- Item manual tidak mengurangi stok

### 6. Audit dan Validasi
- Validasi lengkap: tanggal, pelanggan, minimal 1 item
- Tombol "Pratinjau" untuk melihat detail sebelum simpan
- Dialog konfirmasi dengan detail perhitungan sebelum menyimpan:
  - Nama item, harga, quantity, subtotal per item
  - Total keseluruhan
  - Informasi bahwa stok akan dikurangi

## File yang Dimodifikasi:
- `servis.html` - Template modal dengan datalist dan preview
- `assets/js/modules/servis.js` - Logika lengkap dengan semua fitur
