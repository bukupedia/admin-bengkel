# [Alpha-22] Changes Made

Codebase: alpha-21

Menambahkan fitur Edit Servis

**Perubahan di servis.html:**
- Menambahkan modal baru "modalEditServis" dengan:
  - Kolom Tanggal dan Pelanggan (hanya baca)
  - Container item sparepart yang dapat diedit
  - Tombol "+ Tambah Item"
  - Kolom Catatan yang dapat diedit
  - Total otomatis terhitung

**Perubahan di assets/js/modules/servis.js:**

1. **Tombol file_editor di tabel:**
   - Servis dengan status "Menunggu" dan "Diproses" dapat diedit (tombol warna kuning ✏)
   - Servis dengan status "Selesai" tidak dapat diedit (tombol abu-abu disabled)

2. **Bagian yang dapat diedit:**
   - Tambah item sparepart baru (+ Tambah Item)
   - Hapus item sparepart (tombol ✕)
   - Ganti item sparepart (pilih dari dropdown)
   - Tambah/kurangi jumlah sparepart (+/-)
   - Edit Catatan

3. **Manajemen Stok Otomatis:**
   - Saat edit disimpan, stok lama dikembalikan
   - Stok baru dikurangi sesuai perubahan

Untuk menggunakan fitur ini, klik tombol ✏ pada baris servisdan edit sesuai kebutuhan.
