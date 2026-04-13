# [Alpha-16] Changes Made

Codebase: alpha-14

## Pada Modal Tambah Servis:
1. **Nama Pelanggan dan Nomor Polisi** - Sekarang readonly dan dipilih dari dropdown. Jika tidak ditemukan, akan muncul pesan error "Nama pelanggan tidak ditemukan dalam daftar"
2. **Nama dan Harga Sparepart** - Sekarang readonly (auto-fill dari pilihan sparepart). Jika tidak ditemukan, akan muncul pesan error "Nama sparepart tidak ditemukan dalam daftar"  
3. **Catatan** - Ditambahkan textarea untuk Catatan

## Pada Halaman Servis:
1. **Filter Status** - Ditambahkan dropdown filter untuk menyortir tabel berdasarkan status (Menunggu/Diproses/Selesai)
2. **Tombol Edit** - Ditambahkan tombol edit (✏️) pada kolom Aksi
3. **Kondisi Edit** - Data servis hanya bisa diedit jika status belum 'Selesai'. Tombol Edit akan disabled (tidak aktif) jika status sudah 'Selesai'

## File yang diubah:
- `servis.html` - Modal dan table structure
- `assets/js/modules/servis.js` - Logic untuk semua fitur

Catatan juga ditampilkan di modal Detail Servis.
