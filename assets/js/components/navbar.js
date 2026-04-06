export function renderNavbar() {
  document.getElementById("navbar").innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="dashboard.html">BengkelApp</a>
        <div>
          <a href="servis.html" class="btn btn-sm btn-light">Servis</a>
          <a href="pelanggan.html" class="btn btn-sm btn-light">Pelanggan</a>
          <a href="sparepart.html" class="btn btn-sm btn-light">Sparepart</a>
        </div>
      </div>
    </nav>
  `;
}
