# [Alpha-12] Changes Made

Modifikasi pada modal tambah servis:

1. **Input pencarian pelanggan** - Dipindahkan ke dalam area dropdown (di dalam div `customer-dropdown`), sehingga sekarang input pencarian berada di atas dropdown select pelanggan.

2. **Input pencarian sparepart** - Dipindahkan ke dalam area dropdown (di dalam div `part-dropdown`), sehingga sekarang input pencarian berada di atas dropdown select sparepart di setiap baris item.

3. **Pesan konfirmasi** - Teks "Stok sparepart akan dikurangi..." dihapus dari pesan konfirmasi.

Perubahan diterapkan pada file:
- servis.html (untuk customer dropdown)
- assets/js/modules/servis.js (untuk sparepart dropdown)

## Update

Input pencarian pelanggan dan sparepart diganti menggunakan style combobox:

**Perubahan yang dilakukan:**

1. **Input pencarian pelanggan** - Sekarang menggunakan `<input>` dengan `list="customerList"` dan `<datalist>`:
   - Pengguna bisa mengetik untuk mencari
   - Saat mengetik, suggestions akan muncul (seperti branch selector di GitHub)
   - Pilih dari dropdown atau ketik manual

2. **Input pencarian sparepart** - Juga menggunakan `<input>` dengan `list="partDatalist"`:
   - Sama seperti pelanggan, menggunakan combobox style GitHub
   - Tampilkan nama sparepart + info stok (Stok: X)

Sekarang saat pengguna klik pada field pelanggan atau sparepart, akan muncul dropdown dengan suggestions yang bisa difilter secara otomatis oleh browser (fitur native `<datalist>`).
