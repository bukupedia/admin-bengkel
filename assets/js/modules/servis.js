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
  setupCustomerSearch();
}

// ======================
// SEARCH FUNCTIONALITY
// ======================
function setupSearch() {
  const searchInput = document.getElementById("searchServis");
  const clearSearch = document.getElementById("clearSearchServis");
  
  // Search functionality with debounce
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value;
    // Show/hide clear button
    if (clearSearch) {
      clearSearch.style.display = value ? "block" : "none";
    }
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = value.toLowerCase();
      renderTable(query);
    }, 300);
  });

  // Clear search button
  if (clearSearch) {
    clearSearch.addEventListener("click", () => {
      searchInput.value = "";
      clearSearch.style.display = "none";
      renderTable("");
      searchInput.focus();
    });
  }
}

// ======================
// CUSTOMER SEARCH FUNCTIONALITY (combobox style GitHub)
// ======================
function setupCustomerSearch() {
  const searchInput = document.getElementById("customerSearch");
  
  searchInput.addEventListener("input", () => {
    // Trigger filter for datalist - input is already bound via list attribute
    // But we can also auto-select if exact match
  });
  
  // Handle selection from datalist
  searchInput.addEventListener("change", () => {
    // Input value can be matched to customer name
  });
}

// ======================
// RENDER CUSTOMER DATALIST
// ======================
function renderCustomerDropdown(customers = null) {
  const custData = customers || getData(CUSTOMER_KEY);
  const dataList = document.getElementById("customerList");

  dataList.innerHTML = "";
  custData.forEach(c => {
    const safeName = sanitizeHTML(c.name);
    const policeNum = c.policeNumber ? ` (${sanitizeHTML(c.policeNumber)})` : "";
    dataList.innerHTML += `<option value="${safeName}${policeNum}" data-id="${c.id}" data-police="${c.policeNumber || ""}">`;
  });
}

// ======================
// FIND CUSTOMER ID BY INPUT VALUE
// ======================
function findCustomerIdByInput(inputValue) {
  if (!inputValue) return null;
  
  const dataList = document.getElementById("customerList");
  const options = dataList.querySelectorAll("option");
  
  for (const option of options) {
    if (option.value === inputValue) {
      return option.dataset.id;
    }
  }
  
  // Also try to match by partial input (if user typed but didn't select from dropdown)
  const lowerInput = inputValue.toLowerCase();
  for (const option of options) {
    if (option.value.toLowerCase().includes(lowerInput)) {
      return option.dataset.id;
    }
  }
  
  return null;
}

// ======================
// PART DATALIST (combobox style GitHub)
// ======================
function renderPartDatalist() {
  const allParts = getData(PART_KEY);
  const dataList = document.getElementById("partDatalist");
  if (!dataList) return;
  
  dataList.innerHTML = "";
  allParts.forEach(p => {
    const safeName = sanitizeHTML(p.name);
    const stockInfo = p.qty > 0 ? ` (Stok: ${p.qty})` : ` (Stok: 0)`;
    dataList.innerHTML += `<option value="${safeName}${stockInfo}" data-id="${p.id}" data-price="${p.price}" data-qty="${p.qty || 0}">`;
  });
}

// ======================
// ITEM HANDLING
// ======================
function addItemRow() {
  const container = document.getElementById("itemContainer");
  const allParts = getData(PART_KEY);

  const row = document.createElement("div");
  row.className = "row g-2 mb-2 item-row";

  // Build options for the hidden select
  let selectOptions = `<option value="">-- Pilih Sparepart --</option>`;
  allParts.forEach(p => {
    const safeName = sanitizeHTML(p.name);
    const stockInfo = p.qty > 0 ? `✓ (Stok: ${p.qty})` : `✗ (Stok: 0)`;
    const disabled = p.qty <= 0 ? "disabled" : "";
    selectOptions += `<option value="${p.id}" data-price="${p.price}" data-qty="${p.qty || 0}" ${disabled}>${safeName} - ${stockInfo}</option>`;
  });

  row.innerHTML = `
    <div class="col-md-4">
      <input type="text" class="form-control part-search" placeholder="Cari sparepart..." list="partDatalistRow-${container.children.length}" autocomplete="off">
      <select class="part-select d-none">
        ${selectOptions}
      </select>
    </div>

    <div class="col-md-2">
      <input type="text" class="form-control item-name" placeholder="Nama item">
    </div>

    <div class="col-md-1">
      <input type="number" class="form-control item-qty" placeholder="Qty" min="1" value="1">
    </div>

    <div class="col-md-2">
      <input type="number" class="form-control item-price" placeholder="Harga" min="0">
    </div>

    <div class="col-md-1">
      <button class="btn btn-danger w-100 btn-remove">✕</button>
    </div>
  `;

  container.appendChild(row);

  const searchInput = row.querySelector(".part-search");
  const select = row.querySelector(".part-select");
  const nameInput = row.querySelector(".item-name");
  const qtyInput = row.querySelector(".item-qty");
  const priceInput = row.querySelector(".item-price");

  // Search/filter sparepart - filter the select options based on query
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const currentValue = select.value;
    
    let filteredParts = allParts;
    if (query) {
      filteredParts = allParts.filter(p => p.name.toLowerCase().includes(query));
    }
    
    let options = `<option value="">-- Pilih Sparepart --</option>`;
    filteredParts.forEach(p => {
      const safeName = sanitizeHTML(p.name);
      const stockInfo = p.qty > 0 ? `✓ (Stok: ${p.qty})` : `✗ (Stok: 0)`;
      const disabled = p.qty <= 0 ? "disabled" : "";
      const selected = p.id === currentValue ? "selected" : "";
      options += `<option value="${p.id}" data-price="${p.price}" data-qty="${p.qty || 0}" ${disabled} ${selected}>${safeName} - ${stockInfo}</option>`;
    });
    
    select.innerHTML = options;
  });

  // Select sparepart from dropdown → auto fill
  select.addEventListener("change", () => {
    const selectedOption = select.options[select.selectedIndex];
    const price = selectedOption.dataset.price;
    const qty = parseInt(selectedOption.dataset.qty) || 0;
    const name = selectedOption.text.split(" - ")[0];

    if (price) {
      priceInput.value = price;
      nameInput.value = name;
      qtyInput.max = qty;
      qtyInput.value = 1;
      // Also update search input to show selected
      searchInput.value = name;
    }

    calculateTotal();
  });

  // quantity change → recalculate
  qtyInput.addEventListener("input", calculateTotal);
  
  // manual price change → recalculate
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
  const rows = document.querySelectorAll(".item-row");
  let total = 0;
  let itemCount = 0;
  let qtyCount = 0;

  rows.forEach(row => {
    const priceInput = row.querySelector(".item-price");
    const qtyInput = row.querySelector(".item-qty");
    const nameInput = row.querySelector(".item-name");
    
    const price = parseInt(priceInput?.value) || 0;
    const qty = parseInt(qtyInput?.value) || 0;
    const name = nameInput?.value.trim() || "";

    if (name && price > 0) {
      total += price * qty;
      itemCount++;
      qtyCount += qty;
    }
  });

  document.getElementById("totalDisplay").innerText = formatCurrency(total);
  document.getElementById("itemCountDisplay").innerText = itemCount;
  document.getElementById("qtyCountDisplay").innerText = qtyCount;

  return { total, itemCount, qtyCount };
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
    const customerSearch = document.getElementById("customerSearch");
    const customerDatalist = document.getElementById("customerList");
    
    const tanggal = tanggalInput.value;
    // Find customer by matching input value to datalist option
    const customerId = findCustomerIdByInput(customerSearch.value);

    const items = [];
    const partsToUpdate = {}; // partId -> qty to deduct

    document.querySelectorAll(".item-row").forEach(row => {
      const select = row.querySelector(".part-select");
      const name = row.querySelector(".item-name").value.trim();
      const price = parseInt(row.querySelector(".item-price").value);
      const qty = parseInt(row.querySelector(".item-qty").value) || 1;
      const partId = select.value || null;

      if (name && price) {
        items.push({ name, price, qty, partId });
        
        // Track parts to update stock
        if (partId) {
          if (!partsToUpdate[partId]) {
            partsToUpdate[partId] = 0;
          }
          partsToUpdate[partId] += qty;
        }
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
      customerSearch.classList.add("is-invalid");
      return;
    }
    customerSearch.classList.remove("is-invalid");
    
    if (items.length === 0) {
      alert("Tambahkan minimal satu item servis");
      return;
    }

    const { total, itemCount, qtyCount } = calculateTotal();

    // Show preview confirmation
    const previewText = `Konfirmasi Simpan Servis:\n\n` +
      `• Tanggal: ${formatDate(tanggal)}\n` +
      `• Pelanggan: ${customerSearch.value}\n` +
      `• Jumlah Item: ${itemCount}\n` +
      `• Total Quantity: ${qtyCount}\n` +
      `• Total Biaya: ${formatCurrency(total)}\n\n` +
      `Lanjutkan?`;

    if (!confirm(previewText)) {
      return;
    }

    // Deduct stock from spareparts
    const allParts = getData(PART_KEY);
    for (const [partId, usedQty] of Object.entries(partsToUpdate)) {
      const partIndex = allParts.findIndex(p => p.id === partId);
      if (partIndex !== -1) {
        allParts[partIndex].qty = (allParts[partIndex].qty || 0) - usedQty;
        if (allParts[partIndex].qty < 0) allParts[partIndex].qty = 0;
      }
    }
    saveData(PART_KEY, allParts);

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
  itemsList.innerHTML = servis.items.map(item => {
    const qtyDisplay = item.qty ? ` × ${item.qty}` : "";
    const subtotal = item.price * (item.qty || 1);
    return `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      ${sanitizeHTML(item.name)}${qtyDisplay}
      <span class="badge bg-primary rounded-pill">${formatCurrency(subtotal)}</span>
    </li>
  `;
  }).join('');
  
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
  document.getElementById("customerSearch").value = "";
  document.getElementById("itemContainer").innerHTML = "";
  document.getElementById("totalDisplay").innerText = formatCurrency(0);
  document.getElementById("itemCountDisplay").innerText = "0";
  document.getElementById("qtyCountDisplay").innerText = "0";
  
  // Remove validation classes
  document.getElementById("tanggal").classList.remove("is-invalid");
  document.getElementById("customerSearch").classList.remove("is-invalid");

  // Refresh customer dropdown
  renderCustomerDropdown();
  
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
