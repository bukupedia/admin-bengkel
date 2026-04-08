# [Beta-5] Changes Made

1. **Kolom No. Polisi di tabel servis** (servis.html)
   - Menambahkan kolom "No. Polisi" pada tabel data servis

2. **Tampilan No. Polisi di tabel dan detail** (servis.js)
   - Menampilkan nomor polisi pelanggan di tabel servis
   - Menambahkan menampilkan nomor polisi di modal detail servis

3. **Non-aktifkan tanggal sebelumnya** (servis.js)
   - Menambahkan atribut `min` pada input tanggal agar tidak bisa memilih tanggal yang sudah lewat melalui date picker
   - Menambahkan validasi saat menyimpan servis - jika tanggal yang dipilih sudah lewat, akan muncul pesan error dan data tidak disimpan

Admin sekarang tidak dapat memilih tanggal yang sudah lewat saat menambahkan servis baru.

