# [Beta-24] Changes Made

Codebase: beta-23

## Halaman Servis (servis.html & servis.js):

1. **Tombol Cancel**:
   - Tombol 'Hapus' (🗑) diganti dengan tombol 'Cancel'
   - Tombol Cancel hanya aktif jika status 'Menunggu'
   - Tombol Cancel disabled jika status 'Diproses' atau 'Selesai'

2. **Fitur Batalkan Servis**:
   - Stok sparepart dikembalikan saat servis dibatalkan
   - Status diubah menjadi 'Dibatalkan'

3. **Filter Status**:
   - Ditambahkan opsi "Dibatalkan" pada dropdown filter

4. **Detail Modal**:
   - Status "Ditampilkan"status "Dibatalkan" akan ditampilkan dengan badge merah

## Halaman Dashboard (dashboard.html & dashboard.js):

1. **Ringkasan Servis Dibatalkan**:
   - Ditambahkan card "Dibatalkan" yang menampilkan jumlah servis yang dibatalkan

2. **Ringkasan Total Sparepart**:
   - Ditambahkan card "Total Sparepart" yang menampilkan jumlah sparepart

3. **Recent Servis**:
   - Status "Dibatalkan" ditampilkan dengan badge merah di daftar servis terbaru

Perbaikan tombol edit servis.

**logika Tombol file_editor:**
- Aktif (dapat diklik) untuk status 'Menunggu' dan 'Diproses'
- Disabled untuk status 'Selesai' dan 'Dibatalkan'

Sekarang semua tombol sudah bekerja dengan benar:
- 👁 (View): selalu aktif untuk semua status
- ✏ (file_editor): aktif untuk 'Menunggu' dan 'Diproses'
- ▶ (Mulai Servis): aktif untuk 'Menunggu' saja
- ✓ (Tandai Selesai): aktif untuk 'Diproses' saja
- Cancel: aktif untuk 'Menunggu' saja
