// assets/js/modules/dashboard.js

import { getData } from "../storage.js";
import { formatCurrency, sanitizeHTML } from "../utils.js";

const SERVIS_KEY = "servis";
const CUSTOMER_KEY = "customers";
const PART_KEY = "parts";

// INIT
export function initDashboardPage() {
  loadDashboardData();
}

// ======================
// GET TODAY'S DATE STRING
// ======================
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// ======================
// GET YESTERDAY'S DATE STRING
// ======================
function getYesterdayString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// ======================
// LOAD DASHBOARD DATA
// ======================
function loadDashboardData() {
  const allServisData = getData(SERVIS_KEY);
  const customerData = getData(CUSTOMER_KEY);
  const partData = getData(PART_KEY);
  
  // Filter servis data for today only
  const today = getTodayString();
  const servisData = allServisData.filter(s => s.tanggal === today);
  
  // Calculate total servis (today)
  const totalServis = servisData.length;
  
  // Calculate counts by status (today)
  const servisMenunggu = servisData.filter(s => s.status === "menunggu").length;
  const servisDiproses = servisData.filter(s => s.status === "servicing").length;
  const servisSelesai = servisData.filter(s => s.status === "selesai").length;
  const servisDibatalkan = servisData.filter(s => s.status === "dibatalkan").length;
  
  // Calculate total pendapatan (today, only from completed ones)
  const totalPendapatan = servisData
    .filter(s => s.status === "selesai")
    .reduce((sum, s) => sum + (s.total || 0), 0);
  
  // Calculate total customers created today
  const todayCustomers = customerData.filter(c => c.createdAt && c.createdAt.startsWith(today));
  const totalPelanggan = todayCustomers.length;
  
  // Calculate total sparepart
  const totalSparepart = partData.length;
  
  // Update UI - Hari Ini
  document.getElementById("totalServis").textContent = totalServis;
  document.getElementById("servisMenunggu").textContent = servisMenunggu;
  document.getElementById("servisDiproses").textContent = servisDiproses;
  document.getElementById("servisSelesai").textContent = servisSelesai;
  document.getElementById("servisDibatalkan").textContent = servisDibatalkan;
  document.getElementById("totalPelanggan").textContent = totalPelanggan;
  document.getElementById("totalSparepart").textContent = totalSparepart;
  document.getElementById("totalPendapatan").textContent = formatCurrency(totalPendapatan);
  
  // Add animation for status counts
  animateValue("totalServis", 0, totalServis, 500);
  animateValue("servisMenunggu", 0, servisMenunggu, 500);
  animateValue("servisDiproses", 0, servisDiproses, 500);
  animateValue("servisSelesai", 0, servisSelesai, 500);
  animateValue("servisDibatalkan", 0, servisDibatalkan, 500);
  animateValue("totalPelanggan", 0, totalPelanggan, 500);
  animateValue("totalSparepart", 0, totalSparepart, 500);
  
  // Render recent servis (today)
  renderRecentServis(servisData);
  
  // ======================
  // LOAD OVERALL DATA (Keseluruhan)
  // ======================
  loadOverallData(allServisData, customerData, partData);
}

// ======================
// LOAD OVERALL DATA (Keseluruhan)
// ======================
function loadOverallData(allServisData, customerData, partData) {
  // Calculate overall total servis
  const totalServisOverall = allServisData.length;
  
  // Calculate counts by status (overall)
  const servisMenungguOverall = allServisData.filter(s => s.status === "menunggu").length;
  const servisDiprosesOverall = allServisData.filter(s => s.status === "servicing").length;
  const servisSelesaiOverall = allServisData.filter(s => s.status === "selesai").length;
  const servisDibatalkanOverall = allServisData.filter(s => s.status === "dibatalkan").length;
  
  // Calculate total pendapatan (overall, only from completed ones)
  const totalPendapatanOverall = allServisData
    .filter(s => s.status === "selesai")
    .reduce((sum, s) => sum + (s.total || 0), 0);
  
  // Calculate total customers (overall)
  const totalPelangganOverall = customerData.length;
  
  // Calculate total sparepart (overall)
  const totalSparepartOverall = partData.length;
  
  // Update UI - Keseluruhan
  document.getElementById("totalServisOverall").textContent = totalServisOverall;
  document.getElementById("servisMenungguOverall").textContent = servisMenungguOverall;
  document.getElementById("servisDiprosesOverall").textContent = servisDiprosesOverall;
  document.getElementById("servisSelesaiOverall").textContent = servisSelesaiOverall;
  document.getElementById("servisDibatalkanOverall").textContent = servisDibatalkanOverall;
  document.getElementById("totalPelangganOverall").textContent = totalPelangganOverall;
  document.getElementById("totalSparepartOverall").textContent = totalSparepartOverall;
  document.getElementById("totalPendapatanOverall").textContent = formatCurrency(totalPendapatanOverall);
  
  // Add animation for overall status counts
  animateValue("totalServisOverall", 0, totalServisOverall, 500);
  animateValue("servisMenungguOverall", 0, servisMenungguOverall, 500);
  animateValue("servisDiprosesOverall", 0, servisDiprosesOverall, 500);
  animateValue("servisSelesaiOverall", 0, servisSelesaiOverall, 500);
  animateValue("servisDibatalkanOverall", 0, servisDibatalkanOverall, 500);
  animateValue("totalPelangganOverall", 0, totalPelangganOverall, 500);
  animateValue("totalSparepartOverall", 0, totalSparepartOverall, 500);
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
    const customerName = customer ? sanitizeHTML(customer.name) : "-";
    const policeNumber = customer ? sanitizeHTML(customer.policeNumber || "-") : "-";
    
    // Status mapping synced with servis.js
    const statusMap = {
      "menunggu": { class: "secondary", text: "Menunggu" },
      "servicing": { class: "warning", text: "Diproses" },
      "selesai": { class: "success", text: "Selesai" },
      "dibatalkan": { class: "danger", text: "Dibatalkan" }
    };
    const statusInfo = statusMap[item.status] || statusMap.menunggu;
    
    return `
      <div class="card mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${customerName}</strong>
              <br>
              <small class="text-muted">${policeNumber} • ${sanitizeHTML(item.tanggal)}</small>
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
