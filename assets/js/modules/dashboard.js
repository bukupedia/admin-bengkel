// assets/js/modules/dashboard.js

import { getData } from "../storage.js";
import { formatCurrency } from "../utils.js";

const SERVIS_KEY = "servis";
const CUSTOMER_KEY = "customers";
const PART_KEY = "parts";

// INIT
export function initDashboardPage() {
  loadDashboardData();
}

// ======================
// LOAD DASHBOARD DATA
// ======================
function loadDashboardData() {
  const servisData = getData(SERVIS_KEY);
  const customerData = getData(CUSTOMER_KEY);
  const partData = getData(PART_KEY);
  
  // Calculate total servis
  const totalServis = servisData.length;
  
  // Calculate total pendapatan (only from completed ones)
  const totalPendapatan = servisData
    .filter(s => s.status === "selesai")
    .reduce((sum, s) => sum + (s.total || 0), 0);
  
  // Calculate total customers
  const totalPelanggan = customerData.length;
  
  // Update UI
  document.getElementById("totalServis").textContent = totalServis;
  document.getElementById("totalPendapatan").textContent = formatCurrency(totalPendapatan);
  document.getElementById("totalPelanggan").textContent = totalPelanggan;
  
  // Add animation
  animateValue("totalServis", 0, totalServis, 500);
  animateValue("totalPelanggan", 0, totalPelanggan, 500);
  
  // Render recent servis
  renderRecentServis(servisData);
}

// ======================
// ANIMATE COUNTER
// ======================
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;
  
  // Don't animate for currency values, just set directly
  if (obj.textContent.includes("Rp")) {
    obj.textContent = formatCurrency(end);
    return;
  }
  
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// ======================
// RENDER RECENT SERVIS
// ======================
function renderRecentServis(data) {
  const container = document.getElementById("recentServis");
  if (!container) return;
  
  // Sort by date (newest first) and take last 5
  const recentData = [...data]
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .slice(0, 5);
  
  if (recentData.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-4">
        <p class="mb-1">📋</p>
        <p>Belum ada data servis</p>
        <small>Mulai menambahkan servis di halaman Servis</small>
      </div>
    `;
    return;
  }
  
  const customers = getData(CUSTOMER_KEY);
  
  container.innerHTML = recentData.map(item => {
    const customer = customers.find(c => c.id == item.customerId);
    const customerName = customer ? customer.name : "-";
    const statusClass = item.status === "selesai" ? "success" : "warning";
    const statusText = item.status === "selesai" ? "Selesai" : "Proses";
    
    return `
      <div class="card mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${customerName}</strong>
              <br>
              <small class="text-muted">${item.tanggal}</small>
            </div>
            <div class="text-end">
              <div class="fw-bold">${formatCurrency(item.total)}</div>
              <span class="badge bg-${statusClass}">${statusText}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
