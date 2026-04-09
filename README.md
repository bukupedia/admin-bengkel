# [Beta-11] Changes Made

Modifikasi pada modal tambah servis:

## 1. Pencarian Pelanggan
- Ditambahkan input pencarian di atas dropdown pelanggan
- Pencarian berdasarkan nama atau nomor polisi
- Hasil pencarian langsung difilter di dropdown

## 2. Pencarian Sparepart
- Setiap baris item sekarang memiliki input pencarian sparepart
- Menampilkan informasi stok: ✓ (Stok: X) atau ✗ (Stok: 0)
- Sparepart dengan stok 0 akan disabled (tidak bisa dipilih)
- Filter langsung saat mengetik

## 3. Management Quantity
- Ditambahkan field quantity untuk setiap sparepart
- Quantity default adalah 1
- Max quantity dibatasi sesuai stok yang tersedia
- Stok sparepart akan dikurangi secara otomatis saat menyimpan servis
- Detail servis menampilkan quantity dan subtotal per item

## 4. Perbaikan Perhitungan
- Total sekarang dihitung dengan formula: Harga × Quantity
- Ditampilkan jumlah item dan total quantity
- sebelum menyimpan, muncul konfirmasi preview yang menampilkan:
  - Tanggal
  - Nama pelanggan
  - Jumlah item
  - Total quantity
  - Total biaya
  - Pesan bahwa stok sparepart akan dikurangi

Semua perubahan disimpan di:
- `servis.html` - Struktur modal
- `assets/js/modules/servis.js` - Logika aplikasi
