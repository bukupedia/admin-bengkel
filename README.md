# [Beta-6] Changes Made

1. **servis.html** - Mengubah placeholder input pencarian menjadi lebih informatif:
   ```html
   <input type="text" id="searchServis" class="form-control mt-3" placeholder="Cari berdasarkan nama pelanggan atau nomor polisi...">
   ```

2. **servis.js** - Memperbarui logika pencarian di fungsi `renderTable()` agar dapat mencari berdasarkan:
   - Nama pelanggan
   - Nomor polisi
   
   Logika pencarian menggunakan OR, sehingga data akan ditampilkan jika salah satu kata kunci cocok.
