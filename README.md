# [Beta-15] Changes Made

Codebase: beta-14

## Pada Modal Tambah Servis:

1. **Nama Pelanggan dan Nomor Polisi:**
   - Setelah pengguna memilih pelanggan dari datalist, input menjadi read-only (tidak dapat diedit)
   - Menambahkan tombol clear (✕) untuk menghapus pilihan pelanggan
   - Menampilkan informasi pelanggan yang dipilih (Nama dan No. Polisi) dalam box read-only
   - Menampilkan pesan validasi "Nama pelanggan tidak ditemukan dalam database" jika input tidak sesuai dengan data yang ada

2. **Nama dan Harga Sparepart:**
   - Setelah memilih sparepart dari datalist, nama dan harga menjadi read-only
   - Menambahkan pesan validasi "Sparepart tidak ditemukan" jika sparepart yang diinput tidak ada dalam database
   - Harga sparepart tidak dapat diedit manual

3. **Tambah Jasa (Pekerjaan):**
   - Menghapus input "Nama Manual" dan menggantinya dengan fitur "Tambah Jasa"
   - Admin dapat menambahkan pekerjaan/jasa manual dengan nama dan harga
   - Jasa terpisah dari sparepart dalam perhitungan total

4. **Keluhan Kendaraan:**
   - Menambahkan textarea "Keluhan Kendaraan" untuk mencatat keluhan pelanggan
   - Keluhan ini akan ditampilkan di detail servis dan preview untuk diberikan kepada mekanik

## Pada Halaman Servis:

1. **Filter Status:**
   - Menambahkan dropdown filter untuk menyortir tabel berdasarkan status (Semua Status, Menunggu, Diproses, Selesai)
   - Filter dapat digabungkan dengan pencarian

2. **Edit Item pada Modal Detail:**
   - Tombol "Edit Item" hanya muncul jika status belum "Selesai"
   - Admin dapat mengedit item servo selama status belum selesai
   - Setelah diedit, total akan dihitung ulang secara otomatis
