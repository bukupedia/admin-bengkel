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
  
  // Calculate counts by status
  const servisMenunggu = servisData.filter(s => s.status === "menunggu").length;
  const servisDiproses = servisData.filter(s => s.status === "servicing").length;
  const servisSelesai = servisData.filter(s => s.status === "selesai").length;
  
  // Calculate total pendapatan (only from completed ones)
  const totalPendapatan = servisData
    .filter(s => s.status === "selesai")
    .reduce((sum, s) => sum + (s.total || 0), 0);
  
  // Calculate total customers
  const totalPelanggan = customerData.length;
  
  // Update UI
  document.getElementById("totalServis").textContent = totalServis;
  document.getElementById("servisMenunggu").textContent = servisMenunggu;
  document.getElementById("servisDiproses").textContent = servisDiproses;
  document.getElementById("servisSelesai").textContent = servisSelesai;
  document.getElementById("totalPelanggan").textContent = totalPelanggan;
  document.getElementById("totalPendapatan").textContent = formatCurrency(totalPendapatan);
  
  // Add animation for status counts
  animateValue("totalServis", 0, totalServis, 500);
  animateValue("servisMenunggu", 0, servisMenunggu, 500);
  animateValue("servisDiproses", 0, servisDiproses, 500);
  animateValue("servisSelesai", 0, servisSelesai, 500);
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
    const policeNumber = customer ? (customer.policeNumber || "-") : "-";
    
    // Status mapping synced with servis.js
    const statusMap = {
      "menunggu": { class: "secondary", text: "Menunggu" },
      "servicing": { class: "warning", text: "Diproses" },
      "selesai": { class: "success", text: "Selesai" }
    };
    const statusInfo = statusMap[item.status] || statusMap.menunggu;
    
    return `
      <div class="card mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${customerName}</strong>
              <br>
              <small class="text-muted">${policeNumber} • ${item.tanggal}</small>
            </div>
            <div class="text-end">
              <div class="fw-bold">${formatCurrency(item.total)}</div>
              <span class="badge bg-${statusInfo.class}">${statusInfo.text}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
