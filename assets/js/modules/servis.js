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
  
  renderCustomerDatalist();
  const searchInput = document.getElementById("searchServis");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "");
  setupEvent();
  addItemRow(); // default 1 row
  setupSearch();
  setupStatusFilter();
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
// STATUS FILTER
// ======================
function setupStatusFilter() {
  const statusFilter = document.getElementById("statusFilter");
  
  statusFilter.addEventListener("change", () => {
    const searchInput = document.getElementById("searchServis");
    const query = searchInput ? searchInput.value.toLowerCase() : "";
    renderTable(query);
  });
}

// ======================
// DATALIST CUSTOMER
// ======================
function renderCustomerDatalist(customers = null) {
  const custData = customers || getData(CUSTOMER_KEY);
  const input = document.getElementById("customerInput");
  const datalist = document.getElementById("customerDatalist");
  
  datalist.innerHTML = "";
  custData.forEach(c => {
    const safeName = sanitizeHTML(c.name);
    const police = c.policeNumber ? ` (${sanitizeHTML(c.policeNumber)})` : "";
    datalist.innerHTML += `<option value="${safeName}${police}" data-id="${c.id}" data-police="${c.policeNumber || ''}">`;
  });
  
  // Handle selection
  input.addEventListener("input", () => {
    const hiddenSelect = document.getElementById("customerSelect");
    const policeInput = document.getElementById("policeNumberInput");
    const customerError = document.getElementById("customerError");
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === input.value);
    if (selectedOption) {
      hiddenSelect.value = selectedOption.dataset.id;
      policeInput.value = selectedOption.dataset.police || "";
      input.classList.remove("is-invalid");
      customerError.style.display = "none";
    } else {
      hiddenSelect.value = "";
      policeInput.value = "";
    }
  });
  
  input.addEventListener("change", () => {
    const hiddenSelect = document.getElementById("customerSelect");
    const policeInput = document.getElementById("policeNumberInput");
    const customerError = document.getElementById("customerError");
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === input.value);
    if (selectedOption) {
      hiddenSelect.value = selectedOption.dataset.id;
      policeInput.value = selectedOption.dataset.police || "";
      input.classList.remove("is-invalid");
      customerError.style.display = "none";
    } else if (input.value) {
      // User typed something that doesn't match exactly
      input.classList.add("is-invalid");
      customerError.textContent = "Nama pelanggan tidak ditemukan dalam daftar";
      customerError.style.display = "block";
      policeInput.value = "";
    }
  });
}

// ======================
// GET AVAILABLE PARTS (stock > 0)
// ======================
function getAvailableParts() {
  return getData(PART_KEY).filter(p => (p.qty || 0) > 0);
}

// ======================
// ITEM HANDLING
// ======================
function addItemRow() {
  const container = document.getElementById("itemContainer");
  const parts = getAvailableParts();
  
  const rowId = "row-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  
  const row = document.createElement("div");
  row.className = "row g-2 mb-2 item-row";
  row.id = rowId;
  row.dataset.rowId = rowId;
  
  // Build datalist options
  let options = ``;
  const allParts = getData(PART_KEY);
  allParts.forEach(p => {
    const safeName = sanitizeHTML(p.name);
    const stock = p.qty || 0;
    const disabled = stock === 0 ? 'disabled' : '';
    const stockInfo = stock === 0 ? ' (Stok: Habis)' : ` (Stok: ${stock})`;
    options += `<option value="${safeName}" data-id="${p.id}" data-price="${p.price}" data-stock="${stock}" ${disabled}>${safeName}${stockInfo}</option>`;
  });
  
  row.innerHTML = `
    <div class="col-md-3">
      <label class="form-label small">Sparepart</label>
      <input type="text" class="form-control part-input" placeholder="Cari sparepart..." list="partDatalist-${rowId}">
      <datalist id="partDatalist-${rowId}">${options}</datalist>
      <input type="hidden" class="part-id">
      <div class="stock-info small text-muted mt-1"></div>
      <div class="part-error small text-danger mt-1" style="display: none;"></div>
    </div>

    <div class="col-md-2">
      <label class="form-label small">Nama Manual</label>
      <input type="text" class="form-control item-name" placeholder="Nama item" readonly>
    </div>

    <div class="col-md-2">
      <label class="form-label small">Harga</label>
      <input type="number" class="form-control item-price" placeholder="Harga" min="0" readonly>
    </div>

    <div class="col-md-3">
      <label class="form-label small">Jumlah</label>
      <div class="input-group">
        <button class="btn btn-outline-secondary btn-minus" type="button">-</button>
        <input type="number" class="form-control text-center item-qty" value="1" min="1">
        <button class="btn btn-outline-secondary btn-plus" type="button">+</button>
      </div>
    </div>

    <div class="col-md-2 d-flex align-items-end">
      <button class="btn btn-danger w-100 btn-remove">✕</button>
    </div>
  `;
  
  container.appendChild(row);
  
  // References
  const partInput = row.querySelector(".part-input");
  const partIdInput = row.querySelector(".part-id");
  const nameInput = row.querySelector(".item-name");
  const priceInput = row.querySelector(".item-price");
  const qtyInput = row.querySelector(".item-qty");
  const stockInfo = row.querySelector(".stock-info");
  const btnPlus = row.querySelector(".btn-plus");
  const btnMinus = row.querySelector(".btn-minus");
  
  // Handle part selection from datalist
  const partError = row.querySelector(".part-error");
  partInput.addEventListener("input", () => {
    const datalist = row.querySelector(`#partDatalist-${rowId}`);
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === partInput.value);
    
    if (selectedOption && !selectedOption.disabled) {
      partIdInput.value = selectedOption.dataset.id;
      priceInput.value = selectedOption.dataset.price;
      nameInput.value = selectedOption.value.split(' (')[0]; // Remove stock info
      
      const stock = parseInt(selectedOption.dataset.stock);
      stockInfo.textContent = `Stok tersedia: ${stock}`;
      stockInfo.className = stock > 0 ? "stock-info small text-success mt-1" : "stock-info small text-danger mt-1";
      partError.style.display = "none";
      
      // Set max quantity based on stock
      qtyInput.max = stock;
      if (parseInt(qtyInput.value) > stock) {
        qtyInput.value = stock;
      }
    } else {
      partIdInput.value = "";
      stockInfo.textContent = "";
    }
    
    calculateTotal();
  });
  
  partInput.addEventListener("change", () => {
    const datalist = row.querySelector(`#partDatalist-${rowId}`);
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === partInput.value);
    
    if (!selectedOption && partInput.value) {
      partError.textContent = "Nama sparepart tidak ditemukan dalam daftar";
      partError.style.display = "block";
    } else {
      partError.style.display = "none";
    }
  });
  
  // Plus button
  btnPlus.addEventListener("click", () => {
    const currentStock = partIdInput.value ? getPartStock(partIdInput.value) : Infinity;
    const currentQty = parseInt(qtyInput.value) || 0;
    const maxQty = partIdInput.value ? Math.min(currentStock, 99) : 99;
    
    if (currentQty < maxQty) {
      qtyInput.value = currentQty + 1;
      calculateTotal();
    }
  });
  
  // Minus button
  btnMinus.addEventListener("click", () => {
    const currentQty = parseInt(qtyInput.value) || 0;
    if (currentQty > 1) {
      qtyInput.value = currentQty - 1;
      calculateTotal();
    }
  });
  
  // Manual price input
  priceInput.addEventListener("input", calculateTotal);
  
  // Quantity change
  qtyInput.addEventListener("change", () => {
    // Validate quantity
    const stock = partIdInput.value ? getPartStock(partIdInput.value) : 999;
    let qty = parseInt(qtyInput.value) || 1;
    if (qty < 1) qty = 1;
    if (qty > stock) qty = stock;
    qtyInput.value = qty;
    calculateTotal();
  });
  
  // Remove row
  row.querySelector(".btn-remove").addEventListener("click", () => {
    row.remove();
    calculateTotal();
  });
}

// Get part stock
function getPartStock(partId) {
  const parts = getData(PART_KEY);
  const part = parts.find(p => p.id == partId);
  return part ? (part.qty || 0) : 0;
}

// ======================
// HITUNG TOTAL
// ======================
function calculateTotal() {
  const rows = document.querySelectorAll(".item-row");
  let total = 0;
  const items = [];
  
  rows.forEach(row => {
    const name = row.querySelector(".item-name").value.trim();
    const price = parseInt(row.querySelector(".item-price").value) || 0;
    const qty = parseInt(row.querySelector(".item-qty").value) || 0;
    const partId = row.querySelector(".part-id").value;
    
    if (name && price > 0 && qty > 0) {
      total += price * qty;
      items.push({
        partId: partId || null,
        name,
        price,
        qty
      });
    }
  });
  
  document.getElementById("totalDisplay").innerText = formatCurrency(total);
  
  return { total, items };
}

// ======================
// RENDER TABLE
// ======================
function renderTable(searchQuery = "") {
  const data = getData(KEY);
  const customers = getData(CUSTOMER_KEY);
  const table = document.getElementById("servisTable");
  const statusFilter = document.getElementById("statusFilter");
  const selectedStatus = statusFilter ? statusFilter.value : "";
  
  table.innerHTML = "";
  
  // Filter by search query
  let filteredData = data;
  if (searchQuery) {
    filteredData = filteredData.filter(item => {
      const customer = customers.find(c => c.id == item.customerId);
      const customerName = customer ? customer.name.toLowerCase() : "";
      const policeNumber = customer ? (customer.policeNumber || "").toLowerCase() : "";
      return customerName.includes(searchQuery) || policeNumber.includes(searchQuery);
    });
  }
  
  // Filter by status
  if (selectedStatus) {
    filteredData = filteredData.filter(item => item.status === selectedStatus);
  }
  
  if (filteredData.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="text-center py-4">
      <div class="text-muted">
        <p class="mb-1">🔧</p>
        <p>${searchQuery || selectedStatus ? "Tidak ada hasil pencarian" : "Belum ada data servis"}</p>
        <small>${searchQuery || selectedStatus ? "Coba kata kunci lain" : "Klik tombol 'Tambah Servis' untuk menambah data"}</small>
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
    const isEditable = item.status !== "selesai";
    const editBtnDisabled = isEditable ? "" : "disabled";
    
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
          <button class="btn btn-warning btn-sm btn-edit" data-id="${item.id}" title="Edit" ${editBtnDisabled}>✏️</button>
          ${item.status === "menunggu" ? `<button class="btn btn-primary btn-sm btn-start" data-id="${item.id}" title="Mulai Servis">▶</button>` : ''}
          ${item.status === "servicing" ? `<button class="btn btn-success btn-sm btn-selesai" data-id="${item.id}" title="Tandai Selesai">✓</button>` : ''}
          <button class="btn btn-danger btn-sm btn-delete" data-id="${item.id}" title="Hapus">🗑</button>
        </td>
      </tr>
    `;
  });
}

// ======================
// PREVIEW SERVIS
// ======================
function showPreview() {
  const { total, items } = calculateTotal();
  const customerInput = document.getElementById("customerInput");
  const customerId = document.getElementById("customerSelect").value;
  const tanggal = document.getElementById("tanggal").value;
  
  // Validation
  let errors = [];
  
  if (!tanggal) errors.push("• Tanggal belum dipilih");
  const today = new Date().toISOString().split('T')[0];
  if (tanggal < today) errors.push("• Tidak dapat memilih tanggal yang sudah lewat");
  if (!customerId) errors.push("• Pelanggan belum dipilih");
  if (items.length === 0) errors.push("• Minimal satu item servis harus ditambahkan");
  
  if (errors.length > 0) {
    alert("Validasi Gagal:\n" + errors.join("\n"));
    return false;
  }
  
  // Show preview
  const customers = getData(CUSTOMER_KEY);
  const customer = customers.find(c => c.id == customerId);
  
  const previewModal = new bootstrap.Modal(document.getElementById("modalPreview"));
  document.getElementById("previewCustomer").textContent = customer ? customer.name : "-";
  document.getElementById("previewPolice").textContent = customer ? (customer.policeNumber || "-") : "-";
  document.getElementById("previewDate").textContent = formatDate(tanggal);
  
  const previewItems = document.getElementById("previewItems");
  previewItems.innerHTML = items.map(item => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <strong>${sanitizeHTML(item.name)}</strong>
        <small class="d-block text-muted">${formatCurrency(item.price)} x ${item.qty}</small>
      </div>
      <span class="badge bg-primary rounded-pill">${formatCurrency(item.price * item.qty)}</span>
    </li>
  `).join('');
  
  document.getElementById("previewTotal").textContent = formatCurrency(total);
  
  previewModal.show();
  return true;
}

// ======================
// EVENT
// ======================
function setupEvent() {
  const btnSave = document.getElementById("saveServis");
  const btnAddItem = document.getElementById("addItem");
  const btnPreview = document.getElementById("previewServis");
  const table = document.getElementById("servisTable");
  const modalServis = document.getElementById("modalServis");
  
  // Reset form when modal is opened for new service
  modalServis.addEventListener("shown.bs.modal", () => {
    const editId = modalServis.dataset.editId;
    if (!editId || editId === "") {
      // New service - reset form
      resetForm();
    }
  });
  
  // Add item
  btnAddItem.addEventListener("click", addItemRow);
  
  // Preview
  btnPreview.addEventListener("click", showPreview);
  
  // Save with preview confirmation
  btnSave.addEventListener("click", () => {
    // Check if we're in edit mode
    const modalServis = document.getElementById("modalServis");
    const editId = modalServis.dataset.editId;
    const isEditMode = editId && editId !== "";
    
    // First show preview for confirmation
    const { total, items } = calculateTotal();
    const customerInput = document.getElementById("customerInput");
    const customerId = document.getElementById("customerSelect").value;
    const tanggal = document.getElementById("tanggal").value;
    
    // Validation
    let errors = [];
    
    if (!tanggal) {
      document.getElementById("tanggal").classList.add("is-invalid");
      errors.push("• Tanggal belum dipilih");
    } else {
      document.getElementById("tanggal").classList.remove("is-invalid");
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (tanggal < today) {
      document.getElementById("tanggal").classList.add("is-invalid");
      errors.push("• Tidak dapat memilih tanggal yang sudah lewat");
    }
    
    if (!customerId) {
      customerInput.classList.add("is-invalid");
      errors.push("• Pelanggan belum dipilih");
    } else {
      customerInput.classList.remove("is-invalid");
    }
    
    if (items.length === 0) {
      errors.push("• Minimal satu item servis harus ditambahkan");
    }
    
    if (errors.length > 0) {
      alert("Validasi Gagal:\n" + errors.join("\n"));
      return;
    }
    
    // Show confirmation with calculation details
    const customers = getData(CUSTOMER_KEY);
    const customer = customers.find(c => c.id == customerId);
    const parts = getData(PART_KEY);
    
    let confirmationMsg = isEditMode 
      ? `Konfirmasi Update Servis:\n\n`
      : `Konfirmasi Penyimpanan Servis:\n\n`;
    confirmationMsg += `Pelanggan: ${customer ? customer.name : '-'}\n`;
    confirmationMsg += `Tanggal: ${formatDate(tanggal)}\n\n`;
    confirmationMsg += `Item Servis:\n`;
    
    items.forEach(item => {
      const partName = item.partId ? item.name : `${item.name} (Manual)`;
      confirmationMsg += `• ${partName}: ${formatCurrency(item.price)} x ${item.qty} = ${formatCurrency(item.price * item.qty)}\n`;
    });
    
    confirmationMsg += `\nTotal: ${formatCurrency(total)}\n\n`;
    
    if (!isEditMode) {
      confirmationMsg += `Stok sparepart akan dikurangi sesuai quantity yang digunakan.\n`;
    }
    confirmationMsg += `Lanjutkan menyimpan?`;
    
    if (!confirm(confirmationMsg)) {
      return;
    }
    
    if (isEditMode) {
      // Edit mode - update existing servis
      const data = getData(KEY);
      const servisIndex = data.findIndex(s => s.id == editId);
      
      if (servisIndex !== -1) {
        data[servisIndex].tanggal = tanggal;
        data[servisIndex].customerId = customerId;
        data[servisIndex].items = items;
        data[servisIndex].total = total;
        data[servisIndex].catatan = document.getElementById("catatanInput").value || "";
        
        saveData(KEY, data);
      }
      
      resetForm();
      renderTable();
      closeModal();
    } else {
      // Add mode - create new servis
      // Reduce stock for parts used
      const partData = getData(PART_KEY);
      items.forEach(item => {
        if (item.partId) {
          const partIndex = partData.findIndex(p => p.id == item.partId);
          if (partIndex !== -1) {
            partData[partIndex].qty = (partData[partIndex].qty || 0) - item.qty;
          }
        }
      });
      saveData(PART_KEY, partData);
      
      const newServis = {
        id: generateId(),
        tanggal,
        customerId,
        items,
        total,
        status: "menunggu",
        catatan: document.getElementById("catatanInput").value || ""
      };
      
      const data = getData(KEY);
      data.push(newServis);
      saveData(KEY, data);
      
      resetForm();
      renderTable();
      closeModal();
    }
  });
  
  // Table action
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
    
    if (e.target.classList.contains("btn-edit")) {
      editServis(id);
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
  document.getElementById("detailCatatan").textContent = servis.catatan || "-";
  document.getElementById("detailTotal").textContent = formatCurrency(servis.total);
  
  const itemsList = document.getElementById("detailItems");
  itemsList.innerHTML = servis.items.map(item => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        ${sanitizeHTML(item.name)}
        <small class="d-block text-muted">${formatCurrency(item.price)} x ${item.qty}</small>
      </div>
      <span class="badge bg-primary rounded-pill">${formatCurrency(item.price * item.qty)}</span>
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
  
  // Note: Tidak mengembalikan stok karena servis sudah dihapus
  let data = getData(KEY);
  data = data.filter(item => item.id != id);
  
  saveData(KEY, data);
  const searchInput = document.getElementById("searchServis");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "");
}

// ======================
// EDIT SERVIS
// ======================
function editServis(id) {
  const data = getData(KEY);
  const customers = getData(CUSTOMER_KEY);
  
  const servis = data.find(s => s.id == id);
  if (!servis) return;
  
  // Check if status is 'selesai'
  if (servis.status === "selesai") {
    alert("Data servis yang sudah selesai tidak dapat diedit.");
    return;
  }
  
  const customer = customers.find(c => c.id == servis.customerId);
  
  // Set modal title
  document.querySelector("#modalServis .modal-header h5").textContent = "Edit Servis";
  
  // Set edit mode
  document.getElementById("modalServis").dataset.editId = id;
  
  // Fill form
  document.getElementById("tanggal").value = servis.tanggal;
  document.getElementById("customerInput").value = customer ? customer.name : "";
  document.getElementById("customerSelect").value = servis.customerId;
  document.getElementById("policeNumberInput").value = customer ? (customer.policeNumber || "") : "";
  document.getElementById("catatanInput").value = servis.catatan || "";
  
  // Clear and populate items
  const itemContainer = document.getElementById("itemContainer");
  itemContainer.innerHTML = "";
  
  servis.items.forEach(item => {
    addItemRowForEdit(item);
  });
  
  calculateTotal();
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("modalServis"));
  modal.show();
}

// ======================
// ADD ITEM ROW FOR EDIT
// ======================
function addItemRowForEdit(item) {
  const container = document.getElementById("itemContainer");
  const parts = getData(PART_KEY);
  
  const rowId = "row-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  
  const row = document.createElement("div");
  row.className = "row g-2 mb-2 item-row";
  row.id = rowId;
  row.dataset.rowId = rowId;
  
  // Build datalist options
  let options = ``;
  const allParts = getData(PART_KEY);
  allParts.forEach(p => {
    const safeName = sanitizeHTML(p.name);
    const stock = p.qty || 0;
    const disabled = stock === 0 ? 'disabled' : '';
    const stockInfo = stock === 0 ? ' (Stok: Habis)' : ` (Stok: ${stock})`;
    options += `<option value="${safeName}" data-id="${p.id}" data-price="${p.price}" data-stock="${stock}" ${disabled}>${safeName}${stockInfo}</option>`;
  });
  
  // Find matching part if exists
  let partFound = false;
  if (item.partId) {
    const selectedPart = allParts.find(p => p.id == item.partId);
    if (selectedPart) {
      partFound = true;
    }
  }
  
  row.innerHTML = `
    <div class="col-md-3">
      <label class="form-label small">Sparepart</label>
      <input type="text" class="form-control part-input" placeholder="Cari sparepart..." list="partDatalist-${rowId}">
      <datalist id="partDatalist-${rowId}">${options}</datalist>
      <input type="hidden" class="part-id">
      <div class="stock-info small text-muted mt-1"></div>
      <div class="part-error small text-danger mt-1" style="display: none;"></div>
    </div>

    <div class="col-md-2">
      <label class="form-label small">Nama Manual</label>
      <input type="text" class="form-control item-name" placeholder="Nama item" readonly>
    </div>

    <div class="col-md-2">
      <label class="form-label small">Harga</label>
      <input type="number" class="form-control item-price" placeholder="Harga" min="0" readonly>
    </div>

    <div class="col-md-3">
      <label class="form-label small">Jumlah</label>
      <div class="input-group">
        <button class="btn btn-outline-secondary btn-minus" type="button">-</button>
        <input type="number" class="form-control text-center item-qty" value="1" min="1">
        <button class="btn btn-outline-secondary btn-plus" type="button">+</button>
      </div>
    </div>

    <div class="col-md-2 d-flex align-items-end">
      <button class="btn btn-danger w-100 btn-remove">✕</button>
    </div>
  `;
  
  container.appendChild(row);
  
  // References
  const partInput = row.querySelector(".part-input");
  const partIdInput = row.querySelector(".part-id");
  const nameInput = row.querySelector(".item-name");
  const priceInput = row.querySelector(".item-price");
  const qtyInput = row.querySelector(".item-qty");
  const stockInfo = row.querySelector(".stock-info");
  const partError = row.querySelector(".part-error");
  const btnPlus = row.querySelector(".btn-plus");
  const btnMinus = row.querySelector(".btn-minus");
  
  // Set values
  if (item.partId) {
    const selectedPart = allParts.find(p => p.id == item.partId);
    if (selectedPart) {
      partInput.value = selectedPart.name;
      partIdInput.value = item.partId;
      priceInput.value = item.price;
      nameInput.value = item.name;
      
      const stock = selectedPart.qty || 0;
      stockInfo.textContent = `Stok tersedia: ${stock}`;
      stockInfo.className = stock > 0 ? "stock-info small text-success mt-1" : "stock-info small text-danger mt-1";
      
      qtyInput.max = stock;
    }
  } else {
    // Manual entry
    partInput.value = item.name;
    partIdInput.value = "";
    priceInput.value = item.price;
    nameInput.value = item.name;
  }
  
  qtyInput.value = item.qty;
  
  // Handle part selection from datalist
  partInput.addEventListener("input", () => {
    const datalist = row.querySelector(`#partDatalist-${rowId}`);
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === partInput.value);
    
    if (selectedOption && !selectedOption.disabled) {
      partIdInput.value = selectedOption.dataset.id;
      priceInput.value = selectedOption.dataset.price;
      nameInput.value = selectedOption.value.split(' (')[0];
      
      const stock = parseInt(selectedOption.dataset.stock);
      stockInfo.textContent = `Stok tersedia: ${stock}`;
      stockInfo.className = stock > 0 ? "stock-info small text-success mt-1" : "stock-info small text-danger mt-1";
      partError.style.display = "none";
      
      qtyInput.max = stock;
      if (parseInt(qtyInput.value) > stock) {
        qtyInput.value = stock;
      }
    } else {
      partIdInput.value = "";
      stockInfo.textContent = "";
    }
    
    calculateTotal();
  });
  
  partInput.addEventListener("change", () => {
    const datalist = row.querySelector(`#partDatalist-${rowId}`);
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === partInput.value);
    
    if (!selectedOption && partInput.value) {
      partError.textContent = "Nama sparepart tidak ditemukan dalam daftar";
      partError.style.display = "block";
    } else {
      partError.style.display = "none";
    }
  });
  
  // Plus button
  btnPlus.addEventListener("click", () => {
    const currentStock = partIdInput.value ? getPartStock(partIdInput.value) : Infinity;
    const currentQty = parseInt(qtyInput.value) || 0;
    const maxQty = partIdInput.value ? Math.min(currentStock, 99) : 99;
    
    if (currentQty < maxQty) {
      qtyInput.value = currentQty + 1;
      calculateTotal();
    }
  });
  
  // Minus button
  btnMinus.addEventListener("click", () => {
    const currentQty = parseInt(qtyInput.value) || 0;
    if (currentQty > 1) {
      qtyInput.value = currentQty - 1;
      calculateTotal();
    }
  });
  
  // Manual price input
  priceInput.addEventListener("input", calculateTotal);
  
  // Quantity change
  qtyInput.addEventListener("change", () => {
    const stock = partIdInput.value ? getPartStock(partIdInput.value) : 999;
    let qty = parseInt(qtyInput.value) || 1;
    if (qty < 1) qty = 1;
    if (qty > stock) qty = stock;
    qtyInput.value = qty;
    calculateTotal();
  });
  
  // Remove row
  row.querySelector(".btn-remove").addEventListener("click", () => {
    row.remove();
    calculateTotal();
  });
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
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("tanggal").value = today;
  document.getElementById("customerInput").value = "";
  document.getElementById("customerSelect").value = "";
  document.getElementById("policeNumberInput").value = "";
  document.getElementById("catatanInput").value = "";
  document.getElementById("itemContainer").innerHTML = "";
  document.getElementById("totalDisplay").innerText = formatCurrency(0);
  
  // Remove validation classes
  document.getElementById("tanggal").classList.remove("is-invalid");
  document.getElementById("customerInput").classList.remove("is-invalid");
  
  // Reset customer datalist
  renderCustomerDatalist();
  
  addItemRow();
  
  // Reset modal title
  document.querySelector("#modalServis .modal-header h5").textContent = "Tambah Servis";
  
  // Clear edit mode
  document.getElementById("modalServis").dataset.editId = "";
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
