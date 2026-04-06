// assets/js/app.js

import { renderNavbar } from "./components/navbar.js";
import { initPelangganPage } from "./modules/pelanggan.js";
import { initServisPage } from "./modules/servis.js";
// nanti tambah: servis, dashboard, dll

document.addEventListener("DOMContentLoaded", () => {
  // ✅ render navbar di semua halaman
  renderNavbar();

  const page = document.body.dataset.page;

  if (page === "pelanggan") {
    initPelangganPage();
  }
  if (page === "servis") {
    initServisPage();
  }

  // nanti:
  // if (page === "servis") initServisPage();
  // if (page === "dashboard") initDashboard();
});
