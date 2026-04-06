// assets/js/app.js

import { initPelangganPage } from "./modules/pelanggan.js";

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "pelanggan") {
    initPelangganPage();
  }
});
