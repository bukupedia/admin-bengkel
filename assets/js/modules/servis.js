// assets/js/modules/servis.js

import { getData, saveData } from "../storage.js";
import { generateId, sanitizeHTML, formatCurrency, formatDate } from "../utils.js";

const KEY = "servis";
const CUSTOMER_KEY = "customers";
const PART_KEY = "parts";

// ======================
// INIT
// ======================
export function initServisPage() {
  // Set today's date as default and minimum date
  const today = new Date().toISOString().split('T')[0];
  const tanggalInput = document.getElementById("tanggal");
  tanggalInput.value = today;
  tanggalInput.min = today;
  
  renderCustomerDropdown();
  const searchInput = document.getElementById("searchServis");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "");
  setupEvent();
  addItemRow(); // default 1 row
  setupSearch();
}

// ======================
// SEARCH FUNCTIONALITY
// ======================
function setupSearch() {
  const searchInput = document.getElementById("searchServis");
  
  // Search functionality with debounce
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = e.target.value.toLowerCase();
      renderTable(query);
    }, 300);
  });
}

// ======================
// DROPDOWN CUSTOMER
// ======================
function renderCustomerDropdown(customers = null) {
  const custData = customers || getData(CUSTOMER_KEY);
  const select = document.getElementById("customerSelect");

  select.innerHTML = `<option value="">-- Pilih Pelanggan --</option>`;
  custData.forEach(c => {
    const safeName = sanitizeHTML(c.name);
    select.innerHTML += `<option value="${c.id}">${safeName}</option>`;
  });
}

// ======================
// ITEM HANDLING
// ======================
function addItemRow() {
  const container = document.getElementById("itemContainer");
  const parts = getData(PART_KEY).filter(p => (p.qty || 0) > 0);

  const row = document.createElement("div");
  row.className = "row g-2 mb-2 item-row";

  // dropdown options
  let options = `<option value="">-- Pilih Sparepart --</option>`;
  parts.forEach(p => {
    const safeName = sanitizeHTML(p.name);
    options += `<option value="${p.id}" data-price="${p.price}">${safeName}</option>`;
  });

  row.innerHTML = `
    <div class="col-md-4">
      <select class="form-control part-select">
        ${options}
      </select>
    </div>

    <div class="col-md-3">
      <input type="text" class="form-control item-name" placeholder="Atau nama manual">
    </div>

    <div class="col-md-3">
      <input type="number" class="form-control item-price" placeholder="Harga" min="0">
    </div>

    <div class="col-md-2">
      <button class="btn btn-danger w-100 btn-remove">✕</button>
    </div>
  `;

  container.appendChild(row);

  const select = row.querySelector(".part-select");
  const nameInput = row.querySelector(".item-name");
  const priceInput = row.querySelector(".item-price");

  // pilih sparepart → auto isi
  select.addEventListener("change", () => {
    const selected = select.options[select.selectedIndex];
    const price = selected.dataset.price;
    const name = selected.text;

    if (price) {
      priceInput.value = price;
      nameInput.value = name;
    }

    calculateTotal();
  });

  // manual input → tetap dihitung
  priceInput.addEventListener("input", calculateTotal);

  // remove row
  row.querySelector(".btn-remove").addEventListener("click", () => {
    row.remove();
    calculateTotal();
  });
}

// ======================
// HITUNG TOTAL
// ======================
function calculateTotal() {
  const prices = document.querySelectorAll(".item-price");
  let total = 0;

  prices.forEach(input => {
    total += parseInt(input.value) || 0;
  });

  document.getElementById("totalDisplay").innerText =
    formatCurrency(total);

  return total;
}

// ======================
// RENDER TABLE
// ======================
function renderTable(searchQuery = "") {
  const data = getData(KEY);
  const customers = getData(CUSTOMER_KEY);
  const table = document.getElementById("servisTable");

  table.innerHTML = "";

  // Filter by search query
  let filteredData = data;
  if (searchQuery) {
    filteredData = data.filter(item => {
      const customer = customers.find(c => c.id == item.customerId);
      const customerName = customer ? customer.name.toLowerCase() : "";
      const policeNumber = customer ? (customer.policeNumber || "").toLowerCase() : "";
      return customerName.includes(searchQuery) || policeNumber.includes(searchQuery);
    });
  }

  if (filteredData.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="text-center py-4">
      <div class="text-muted">
        <p class="mb-1">🔧</p>
        <p>${searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data servis"}</p>
        <small>${searchQuery ? "Coba kata kunci lain" : "Klik tombol 'Tambah Servis' untuk menambah data"}</small>
      </div>
    </td></tr>`;
    return;
  }

  filteredData.forEach(item => {
    const customer = customers.find(c => c.id == item.customerId);
    const customerName = customer ? sanitizeHTML(customer.name) : "-";
    const customerPoliceNumber = customer ? sanitizeHTML(customer.policeNumber || "-") : "-";
    const safeTanggal = sanitizeHTML(item.tanggal);

    // Status badges
    const statusMap = {
      "menunggu": { class: "secondary", text: "Menunggu" },
      "servicing": { class: "warning", text: "Diproses" },
      "selesai": { class: "success", text: "Selesai" }
    };
    const statusInfo = statusMap[item.status] || statusMap.menunggu;
    
    table.innerHTML += `
      <tr>
        <td>${formatDate(safeTanggal)}</td>
        <td>${customerName}</td>
        <td>${customerPoliceNumber}</td>
        <td>${formatCurrency(item.total)}</td>
        <td>
          <span class="badge bg-${statusInfo.class}">${statusInfo.text}</span>
        </td>
        <td>
          <button class="btn btn-info btn-sm btn-view" data-id="${item.id}" title="Lihat Detail">👁</button>
          ${item.status === "menunggu" ? `<button class="btn btn-primary btn-sm btn-start" data-id="${item.id}" title="Mulai Servis">▶</button>` : ''}
          ${item.status === "servicing" ? `<button class="btn btn-success btn-sm btn-selesai" data-id="${item.id}" title="Tandai Selesai">✓</button>` : ''}
          <button class="btn btn-danger btn-sm btn-delete" data-id="${item.id}" title="Hapus">🗑</button>
        </td>
      </tr>
    `;
  });
}

// ======================
// EVENT
// ======================
function setupEvent() {
  const btnSave = document.getElementById("saveServis");
  const btnAddItem = document.getElementById("addItem");
  const table = document.getElementById("servisTable");

  // tambah item
  btnAddItem.addEventListener("click", addItemRow);

  // save
  btnSave.addEventListener("click", () => {
    const tanggalInput = document.getElementById("tanggal");
    const customerSelect = document.getElementById("customerSelect");
    
    const tanggal = tanggalInput.value;
    const customerId = customerSelect.value;

    const items = [];

    document.querySelectorAll(".item-row").forEach(row => {
      const name = row.querySelector(".item-name").value.trim();
      const price = parseInt(row.querySelector(".item-price").value);

      if (name && price) {
        items.push({ name, price });
      }
    });

    // Validation
    if (!tanggal) {
      tanggalInput.classList.add("is-invalid");
      return;
    }
    tanggalInput.classList.remove("is-invalid");
    
    // Validate: cannot select past date
    const today = new Date().toISOString().split('T')[0];
    if (tanggal < today) {
      alert("Tidak dapat memilih tanggal yang sudah lewat");
      tanggalInput.classList.add("is-invalid");
      return;
    }
    tanggalInput.classList.remove("is-invalid");
    
    if (!customerId) {
      customerSelect.classList.add("is-invalid");
      return;
    }
    customerSelect.classList.remove("is-invalid");
    
    if (items.length === 0) {
      alert("Tambahkan minimal satu item servis");
      return;
    }

    const total = calculateTotal();

    const newServis = {
      id: generateId(),
      tanggal,
      customerId,
      items,
      total,
      status: "menunggu"
    };

    const data = getData(KEY);
    data.push(newServis);
    saveData(KEY, data);

    resetForm();
    renderTable();
    closeModal();
  });

  // table action
  table.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("btn-delete")) {
      deleteServis(id);
    }

    if (e.target.classList.contains("btn-selesai")) {
      updateStatus(id, "selesai");
    }
    
    if (e.target.classList.contains("btn-start")) {
      updateStatus(id, "servicing");
    }
    
    if (e.target.classList.contains("btn-view")) {
      showDetail(id);
    }
  });
}

// ======================
// SHOW DETAIL
// ======================
function showDetail(id) {
  const data = getData(KEY);
  const customers = getData(CUSTOMER_KEY);
  
  const servis = data.find(s => s.id == id);
  if (!servis) return;
  
  const customer = customers.find(c => c.id == servis.customerId);
  
  document.getElementById("detailCustomer").textContent = customer ? customer.name : "-";
  document.getElementById("detailPoliceNumber").textContent = customer ? (customer.policeNumber || "-") : "-";
  document.getElementById("detailTanggal").textContent = formatDate(servis.tanggal);
  const statusText = servis.status === "selesai" ? "Selesai" : (servis.status === "servicing" ? "Diproses" : "Menunggu");
  document.getElementById("detailStatus").textContent = statusText;
  document.getElementById("detailTotal").textContent = formatCurrency(servis.total);
  
  const itemsList = document.getElementById("detailItems");
  itemsList.innerHTML = servis.items.map(item => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      ${sanitizeHTML(item.name)}
      <span class="badge bg-primary rounded-pill">${formatCurrency(item.price)}</span>
    </li>
  `).join('');
  
  const modal = new bootstrap.Modal(document.getElementById("modalDetail"));
  modal.show();
}

// ======================
// DELETE
// ======================
function deleteServis(id) {
  if (!confirm("Yakin ingin menghapus data servis ini?")) return;

  let data = getData(KEY);
  data = data.filter(item => item.id != id);

  saveData(KEY, data);
  const searchInput = document.getElementById("searchServis");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "");
}

// ======================
// UPDATE STATUS
// ======================
function updateStatus(id, newStatus) {
  let data = getData(KEY);

  data = data.map(item => {
    if (item.id == id) item.status = newStatus;
    return item;
  });

  saveData(KEY, data);
  const searchInput = document.getElementById("searchServis");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "");
}

// ======================
// RESET FORM
// ======================
function resetForm() {
  document.getElementById("tanggal").value = "";
  document.getElementById("customerSelect").value = "";
  document.getElementById("itemContainer").innerHTML = "";
  document.getElementById("totalDisplay").innerText = formatCurrency(0);
  
  // Remove validation classes
  document.getElementById("tanggal").classList.remove("is-invalid");
  document.getElementById("customerSelect").classList.remove("is-invalid");

  addItemRow();
}

// ======================
// CLOSE MODAL
// ======================
function closeModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalServis")
  );
  if (modal) {
    modal.hide();
  }
}
