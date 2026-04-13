# [Alpha-18] Changes Made

Codebase: alpha-14

**Pada Modal Tambah Servis (servis.html & servis.js):**

1. **Nama Pelanggan tidak dapat diedit** - Input pelanggan sekarang `readonly` dengan tombol clear (✕) untuk menghapus pilihan
2. **Keterangan jika pelanggan tidak ditemukan** - Ditambahkan elemen `<div id="customerNote">` yang menampilkan "Pelanggan tidak ditemukan" jika input tidak cocok dengan opsi
3. **Nama & Harga Sparepart tidak dapat diedit** - Input sparepart dan harga sekarang `readonly`
4. **Keterangan jika sparepart tidak ditemukan** - Ditambahkan elemen note yang menampilkan "Sparepart tidak ditemukan" jika input tidak cocok
5. **Tombol clear (✕) untuk sparepart** - Ditambahkan tombol clear pada setiap baris item sparepart
6. **Hapus input nama manual** - Kolom "Nama Manual" telah dihapus dari baris item
7. **Tambah textbox Catatan** - Ditambahkan textarea untuk input Catatan yang akan disimpan bersama data servis
8. **Hapus informasi stok dari pesan konfirmasi** - Pesan "Stok sparepart akan dikurangi..." telah dihapus dari konfirmasi penyimpanan

**Pada Halaman Servis (servis.html & servis.js):**

9. **Tambah filter status** - Ditambahkan dropdown filter status (Semua, Menunggu, Diproses, Selesai) untuk menyortir tabel Data Servis
