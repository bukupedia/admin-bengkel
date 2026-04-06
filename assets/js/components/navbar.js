// assets/js/components/navbar.js

export function renderNavbar() {
  const navbar = document.getElementById("navbar");

  if (!navbar) return;

  navbar.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        
        <a class="navbar-brand fw-bold" href="dashboard.html">
          BengkelApp
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav ms-auto">

            <li class="nav-item">
              <a class="nav-link" href="dashboard.html">Dashboard</a>
            </li>

            <li class="nav-item">
              <a class="nav-link" href="servis.html">Servis</a>
            </li>

            <li class="nav-item">
              <a class="nav-link" href="pelanggan.html">Pelanggan</a>
            </li>

            <li class="nav-item">
              <a class="nav-link" href="sparepart.html">Sparepart</a>
            </li>

          </ul>
        </div>

      </div>
    </nav>
  `;
}
