# [Alpha-27] Changes Made

Codebase: alpha-26

## Dashboard - Ringkasan "Hari Ini"

1. **dashboard.html**: Judul diubah menjadi "📊 Dashboard - Hari Ini"

2. **dashboard.js** (`assets/js/modules/dashboard.js`):
   - Menambahkan fungsi `getTodayString()` untuk mendapatkan tanggal hari ini
   - Menambahkan fungsi `getYesterdayString()` untuk mendapatkan tanggal kemarin
   - `loadDashboardData()` sekarang memfilter data servis berdasarkan tanggal hari ini saja
   - Total Servis, Servis Menunggu, Servis Diproses, Servis Selesai, Servis Dibatalkan - semua berdasarkan data hari ini saja
   - Total Pendapatan - hanya dari servis yang berstatus "selesai" hari ini
   - Total Pelanggan - pelanggan yang dibuat hari ini saja
   - Recent Servis juga hanya menampilkan servis hari ini

## Servis - Filter Tanggal

1. **servis.html**: Menambahkan filter tanggal dengan 3 opsi:
   - **Hari ini** (default): Untuk melihat data servis hari ini
   - **Kemarin**: Untuk melihat data servis kemarin
   - **Pilih Tanggal**: Untuk mencari data servis berdasarkan tanggal tertentu (input date muncul ketika opsi ini dipilih)

2. **servis.js** (`assets/js/modules/servis.js`):
   - Menambahkan state `dateFilter` dan `customDate`
   - Menambahkan fungsi `getTodayString()`, `getYesterdayString()`, dan `getDateFilterRange()`
   - Menambahkan fungsi `setupDateFilter()` untuk menangani perubahan filter tanggal
   - `renderTable()` sekarang memfilter data servis berdasarkan rentang tanggal yang dipilih
   - Default filter adalah "Hari ini"

Kedua fitur tersebut sekarang bekerja dengan benar dan data akan selalu difilter berdasarkan tanggal yang dipilih.

Menambahkan ringkasan "Keseluruhan" di halaman Dashboard:

## Perubahan yang dilakukan:

### 1. dashboard.html
- Menambahkan section baru "📊 Dashboard - Keseluruhan" dengan statistik lengkap:
  - Total Servis (Overall)
  - Menunggu (Overall)
  - Diproses (Overall)
  - Selesai (Overall)
  - Dibatalkan (Overall)
  - Total Pelanggan (Overall)
  - Total Sparepart (Overall)
  - Total Pendapatan (Overall)

### 2. dashboard.js (`assets/js/modules/dashboard.js`)
- Menambahkan fungsi `loadOverallData()` yang menghitung dan menampilkan:
  - Total servis dari semua tanggal (sejak aplikasi digunakan)
  - Servis berdasarkan status (menunggu, diproses, selesai, dibatalkan)
  - Total pelanggan keseluruhan
  - Total sparepart keseluruhan
  - Total pendapatan dari servis yang berstatus "selesai"

Sekarang halaman Dashboard menampilkan dua ringkasan:
1. **📊 Dashboard - Hari Ini** - Data servis hari ini saja
2. **📊 Dashboard - Keseluruhan** - Data keseluruhan sejak aplikasi digunakan
