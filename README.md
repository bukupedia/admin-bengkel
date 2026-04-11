# [Beta-21] Changes Made

Codebase: beta-20

Menambahkan functionality reset form pada semua modal:

**1. Pelanggan (pelanggan.js)**
- Modal: `#modalPelanggan`
- Fungsi reset: `clearForm()`
- Menambahkan event listener `hidden.bs.modal` di `setupEvent()`

**2. Sparepart (sparepart.js)**
- Modal: `#modalPart`
- Fungsi reset: `clearForm()`
- Menambahkan event listener `hidden.bs.modal` di `setupEvent()`

**3. Servis (servis.js)**
- Modal: `#modalServis`
- Fungsi reset: `resetForm()`

**Hasil:**
Sekarang ketika user menutup modal dengan cara apapun (menekan tombol X, tombol Cancel, klik di luar modal/backdrop), semua form akan otomatis di-reset:
- Input fields dikosongkan
- Judul modal dikembalikan ke state default (Tambah)
- Validasi error dihapus
- Edit ID dihapus (jika ada)
