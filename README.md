# [Alpha-28] Changes Made

Codebase: alpha-27

## Halaman Dashboard:

1. **Mengubah susunan halaman** menjadi:
   - 📊 Dashboard (judul utama)
   - 📊 Overall (data statistik keseluruhan)
   - 📊 Hari Ini (data statistik hari ini)
   - 📋 Servis Terbaru (daftar servis terbaru)
   - 🔩 Sparepart Kosong / Sedikit (stok < 5)

2. **Menambahkan tampilan sparepart kosong/sedikit**:
   - Menampilkan daftar sparepart dengan stok kurang dari 5
   - Jumlah stok ditampilkan
   - Diurutkan dari stok paling sedikit

## Halaman Servis (Filter Tanggal):

1. **Mengganti opsi**:
   - "Kemarin" → "Semua" (sebagai default)

2. **Menambahkan opsi baru**:
   - "Seminggu Terakhir": melihat data servis seminggu terakhir
   - "Sebulan Terakhir": melihat data servis sebulan terakhir

3. **Opsi full sekarang**:
   - Semua (default - menampilkan semua data servis)
   - Hari ini
   - Seminggu Terakhir
   - Sebulan Terakhir
   - Pilih Tanggal (custom)

File yang diedit:
- dashboard.html: Mengubah struktur dan menambahkan section sparepart kosong
- assets/js/modules/dashboard.js: Menambahkan fungsi renderLowStockParts()
- servis.html: Mengubah opsi filter tanggal
- assets/js/modules/servis.js: Menambahkan logika filter tanggal baru
