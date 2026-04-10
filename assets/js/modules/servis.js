// assets/js/modules/servis.js

import { getData, saveData } from "../storage.js";
import { generateId, sanitizeHTML, formatCurrency, formatDate } from "../utils.js";

const KEY = "servis";
const CUSTOMER_KEY = "customers";
const PART_KEY = "parts";

let currentFilterStatus = "";

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
  const filterStatus = document.getElementById("filterStatus");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "", currentFilterStatus);
  setupEvent();
  addItemRow(); // default 1 row
  setupSearch();
  setupFilter();
}

// ======================
// FILTER FUNCTIONALITY
// ======================
function setupFilter() {
  const filterStatus = document.getElementById("filterStatus");
  filterStatus.addEventListener("change", (e) => {
    currentFilterStatus = e.target.value;
    const searchInput = document.getElementById("searchServis");
    renderTable(searchInput ? searchInput.value.toLowerCase() : "", currentFilterStatus);
  });
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
      renderTable(query, currentFilterStatus);
    }, 300);
  });
}

// ======================
// RENDER TABLE
// ======================
function renderTable(searchQuery = "", filterStatus = "") {
  const table = document.getElementById("servisTable");
  const data = getData(KEY);
  const customers = getData(CUSTOMER_KEY);
  
  // Filter data
  let filteredData = data;
  
  // Apply search filter
  if (searchQuery) {
    filteredData = filteredData.filter(s => {
      const customer = customers.find(c => c.id == s.customerId);
      const customerName = customer ? customer.name.toLowerCase() : "";
      const policeNumber = customer ? (customer.policeNumber || "").toLowerCase() : "";
      return customerName.includes(searchQuery) || policeNumber.includes(searchQuery);
    });
  }
  
  // Apply status filter
  if (filterStatus) {
    filteredData = filteredData.filter(s => s.status === filterStatus);
  }
  
  // Sort by date (newest first)
  filteredData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  
  if (filteredData.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Tidak ada data servis</td></tr>`;
    return;
  }
  
  table.innerHTML = filteredData.map(s => {
    const customer = customers.find(c => c.id == s.customerId);
    const customerName = customer ? sanitizeHTML(customer.name) : "-";
    const policeNumber = customer ? (customer.policeNumber || "-") : "-";
    
    let statusBadge = "";
    if (s.status === "menunggu") {
      statusBadge = '<span class="badge bg-warning">Menunggu</span>';
    } else if (s.status === "servicing") {
      statusBadge = '<span class="badge bg-info">Diproses</span>';
    } else if (s.status === "selesai") {
      statusBadge = '<span class="badge bg-success">Selesai</span>';
    }
    
    return `
      <tr>
        <td>${formatDate(s.tanggal)}</td>
        <td>${customerName}</td>
        <td>${policeNumber}</td>
        <td>${formatCurrency(s.total)}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-sm btn-primary btn-view" data-id="${s.id}">Detail</button>
          ${s.status !== "selesai" ? `<button class="btn btn-sm btn-success btn-selesai" data-id="${s.id}">Selesai</button>` : ""}
          <button class="btn btn-sm btn-danger btn-delete" data-id="${s.id}">Hapus</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ======================
// DATALIST CUSTOMER - READ ONLY AFTER SELECTION
// ======================
function renderCustomerDatalist(customers = null) {
  const custData = customers || getData(CUSTOMER_KEY);
  const input = document.getElementById("customerInput");
  const datalist = document.getElementById("customerDatalist");
  
  datalist.innerHTML = "";
  custData.forEach(c => {
    const safeName = sanitizeHTML(c.name);
    const police = c.policeNumber ? ` (${sanitizeHTML(c.policeNumber)})` : "";
    datalist.innerHTML += `<option value="${safeName}" data-id="${c.id}" data-police="${c.policeNumber || ''}">${safeName}${police}</option>`;
  });
  
  // Handle selection - make read-only after selection
  input.addEventListener("input", () => {
    const hiddenSelect = document.getElementById("customerSelect");
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === input.value);
    
    if (selectedOption) {
      hiddenSelect.value = selectedOption.dataset.id;
      // Make input read-only after selection
      input.readOnly = true;
      // Show validation message if invalid
      hideCustomerValidation();
      // Show selected customer info
      showSelectedCustomerInfo(selectedOption.dataset.id, selectedOption.dataset.police);
    } else {
      hiddenSelect.value = "";
      // If user clears input, remove read-only
      input.readOnly = false;
      hideSelectedCustomerInfo();
    }
  });
  
  input.addEventListener("change", () => {
    const hiddenSelect = document.getElementById("customerSelect");
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === input.value);
    
    if (selectedOption) {
      hiddenSelect.value = selectedOption.dataset.id;
      input.readOnly = true;
      hideCustomerValidation();
      showSelectedCustomerInfo(selectedOption.dataset.id, selectedOption.dataset.police);
    } else if (input.value) {
      // User typed something that doesn't match any option
      input.classList.add("is-invalid");
      showCustomerValidation();
      hiddenSelect.value = "";
      hideSelectedCustomerInfo();
    }
  });
}

// Show validation message when customer not found
function showCustomerValidation() {
  document.getElementById("customerValidationMsg").style.display = "block";
}

function hideCustomerValidation() {
  document.getElementById("customerValidationMsg").style.display = "none";
}

// Show selected customer info (read-only display)
function showSelectedCustomerInfo(customerId, policeNumber) {
  const infoDiv = document.getElementById("selectedCustomerInfo");
  const customers = getData(CUSTOMER_KEY);
  const customer = customers.find(c => c.id == customerId);
  
  if (customer) {
    document.getElementById("displayCustomerName").textContent = customer.name;
    document.getElementById("displayPoliceNumber").textContent = customer.policeNumber || "-";
    infoDiv.style.display = "block";
  }
}

function hideSelectedCustomerInfo() {
  document.getElementById("selectedCustomerInfo").style.display = "none";
}

// Clear customer selection
function clearCustomerSelection() {
  const input = document.getElementById("customerInput");
  const hiddenSelect = document.getElementById("customerSelect");
  
  input.value = "";
  input.readOnly = false;
  hiddenSelect.value = "";
  hideCustomerValidation();
  hideSelectedCustomerInfo();
  input.classList.remove("is-invalid");
}

// ======================
// GET AVAILABLE PARTS (stock > 0)
// ======================
function getAvailableParts() {
  return getData(PART_KEY).filter(p => (p.qty || 0) > 0);
}

// ======================
// ITEM HANDLING - SPAREPART (READ-ONLY)
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
    <div class="col-md-4">
      <label class="form-label small">Sparepart</label>
      <input type="text" class="form-control part-input" placeholder="Cari sparepart..." list="partDatalist-${rowId}">
      <datalist id="partDatalist-${rowId}">${options}</datalist>
      <input type="hidden" class="part-id">
      <div class="part-validation-msg small text-danger mt-1" style="display: none;">Sparepart tidak ditemukan</div>
      <div class="stock-info small text-muted mt-1"></div>
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
  const priceInput = row.querySelector(".item-price");
  const qtyInput = row.querySelector(".item-qty");
  const stockInfo = row.querySelector(".stock-info");
  const validationMsg = row.querySelector(".part-validation-msg");
  const btnPlus = row.querySelector(".btn-plus");
  const btnMinus = row.querySelector(".btn-minus");
  
  // Handle part selection from datalist - make name and price read-only
  partInput.addEventListener("input", () => {
    const datalist = row.querySelector(`#partDatalist-${rowId}`);
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === partInput.value);
    
    if (selectedOption && !selectedOption.disabled) {
      partIdInput.value = selectedOption.dataset.id;
      priceInput.value = selectedOption.dataset.price;
      priceInput.readOnly = true; // Make price read-only
      partInput.readOnly = true; // Make name read-only
      validationMsg.style.display = "none";
      partInput.classList.remove("is-invalid");
      
      const stock = parseInt(selectedOption.dataset.stock);
      stockInfo.textContent = `Stok tersedia: ${stock}`;
      stockInfo.className = stock > 0 ? "stock-info small text-success mt-1" : "stock-info small text-danger mt-1";
      
      // Set max quantity based on stock
      qtyInput.max = stock;
      if (parseInt(qtyInput.value) > stock) {
        qtyInput.value = stock;
      }
    } else {
      partIdInput.value = "";
      stockInfo.textContent = "";
      validationMsg.style.display = "none";
      
      // Allow re-editing if not selected from datalist
      priceInput.readOnly = false;
      partInput.readOnly = false;
    }
    
    calculateTotal();
  });
  
  // Show validation when part not found
  partInput.addEventListener("change", () => {
    const datalist = row.querySelector(`#partDatalist-${rowId}`);
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === partInput.value);
    
    if (!selectedOption && partInput.value) {
      validationMsg.style.display = "block";
      partInput.classList.add("is-invalid");
    } else if (selectedOption) {
      validationMsg.style.display = "none";
      partInput.classList.remove("is-invalid");
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

// ======================
// JASA (PEMBATASAN MANUAL)
// ======================
function addJasaRow() {
  const container = document.getElementById("jasaContainer");
  
  const rowId = "jasa-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  
  const row = document.createElement("div");
  row.className = "row g-2 mb-2 jasa-row";
  row.id = rowId;
  
  row.innerHTML = `
    <div class="col-md-6">
      <input type="text" class="form-control jasa-name" placeholder="Nama Pekerjaan (Jasa)">
    </div>
    <div class="col-md-4">
      <input type="number" class="form-control jasa-price" placeholder="Harga" min="0">
    </div>
    <div class="col-md-2 d-flex align-items-end">
      <button class="btn btn-danger w-100 btn-remove-jasa">✕</button>
    </div>
  `;
  
  container.appendChild(row);
  
  // Update total when price changes
  row.querySelector(".jasa-price").addEventListener("input", calculateTotal);
  
  // Remove row
  row.querySelector(".btn-remove-jasa").addEventListener("click", () => {
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
// CALCULATE TOTAL
// ======================
function calculateTotal() {
  let total = 0;
  
  // Calculate sparepart items
  document.querySelectorAll(".item-row").forEach(row => {
    const partId = row.querySelector(".part-id").value;
    const price = parseFloat(row.querySelector(".item-price").value) || 0;
    const qty = parseInt(row.querySelector(".item-qty").value) || 0;
    
    if (partId && qty > 0) {
      total += price * qty;
    }
  });
  
  // Calculate jasa items
  document.querySelectorAll(".jasa-row").forEach(row => {
    const price = parseFloat(row.querySelector(".jasa-price").value) || 0;
    const name = row.querySelector(".jasa-name").value;
    
    if (name && price > 0) {
      total += price;
    }
  });
  
  document.getElementById("totalDisplay").textContent = formatCurrency(total);
  return total;
}

// ======================
// GET ITEMS
// ======================
function getItems() {
  const items = [];
  
  // Get sparepart items
  document.querySelectorAll(".item-row").forEach(row => {
    const partId = row.querySelector(".part-id").value;
    const price = parseFloat(row.querySelector(".item-price").value) || 0;
    const qty = parseInt(row.querySelector(".item-qty").value) || 0;
    const partInput = row.querySelector(".part-input").value;
    
    if (partId && qty > 0) {
      items.push({
        partId,
        name: partInput,
        price,
        qty,
        type: "sparepart"
      });
    }
  });
  
  // Get jasa items
  document.querySelectorAll(".jasa-row").forEach(row => {
    const name = row.querySelector(".jasa-name").value;
    const price = parseFloat(row.querySelector(".jasa-price").value) || 0;
    
    if (name && price > 0) {
      items.push({
        name,
        price,
        qty: 1,
        type: "jasa"
      });
    }
  });
  
  return items;
}

// ======================
// PREVIEW
// ======================
function showPreview() {
  const { total, items } = { total: calculateTotal(), items: getItems() };
  const customerId = document.getElementById("customerSelect").value;
  const tanggal = document.getElementById("tanggal").value;
  const complaint = document.getElementById("customerComplaint").value;
  
  // Validation
  if (!customerId) {
    alert("Pilih pelanggan terlebih dahulu");
    return;
  }
  
  if (items.length === 0) {
    alert("Tambahkan setidaknya satu item (sparepart atau jasa)");
    return;
  }
  
  const customers = getData(CUSTOMER_KEY);
  const customer = customers.find(c => c.id == customerId);
  
  document.getElementById("previewCustomer").textContent = customer ? customer.name : "-";
  document.getElementById("previewPolice").textContent = customer ? (customer.policeNumber || "-") : "-";
  document.getElementById("previewDate").textContent = formatDate(tanggal);
  document.getElementById("previewComplaint").textContent = complaint || "-";
  
  const previewItems = document.getElementById("previewItems");
  previewItems.innerHTML = items.map(item => {
    const itemType = item.type === "jasa" ? " (Jasa)" : "";
    return `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>${sanitizeHTML(item.name)}${itemType}</strong>
          <small class="d-block text-muted">${formatCurrency(item.price)} ${item.type === "sparepart" ? `x ${item.qty}` : ""}</small>
        </div>
        <span class="badge bg-primary rounded-pill">${formatCurrency(item.price * (item.qty || 1))}</span>
      </li>
    `;
  }).join('');
  
  document.getElementById("previewTotal").textContent = formatCurrency(total);
  
  const previewModal = new bootstrap.Modal(document.getElementById("modalPreview"));
  previewModal.show();
  return true;
}

// ======================
// EVENT
// ======================
function setupEvent() {
  const btnSave = document.getElementById("saveServis");
  const btnAddItem = document.getElementById("addItem");
  const btnAddJasa = document.getElementById("addJasa");
  const btnPreview = document.getElementById("previewServis");
  const btnClearCustomer = document.getElementById("btnClearCustomer");
  const table = document.getElementById("servisTable");
  
  // Clear customer selection
  btnClearCustomer.addEventListener("click", clearCustomerSelection);
  
  // Add sparepart item
  btnAddItem.addEventListener("click", addItemRow);
  
  // Add jasa item
  btnAddJasa.addEventListener("click", addJasaRow);
  
  // Preview
  btnPreview.addEventListener("click", showPreview);
  
  // Save with preview confirmation
  btnSave.addEventListener("click", () => {
    // First show preview for confirmation
    const { total, items } = { total: calculateTotal(), items: getItems() };
    const customerInput = document.getElementById("customerInput");
    const customerId = document.getElementById("customerSelect").value;
    const tanggal = document.getElementById("tanggal").value;
    const complaint = document.getElementById("customerComplaint").value;
    
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
    
    // Check for invalid sparepart
    const invalidParts = [];
    document.querySelectorAll(".item-row").forEach(row => {
      const partInput = row.querySelector(".part-input");
      const partId = row.querySelector(".part-id").value;
      if (partInput.value && !partId) {
        invalidParts.push(partInput.value);
      }
    });
    if (invalidParts.length > 0) {
      errors.push("• Sparepart tidak ditemukan: " + invalidParts.join(", "));
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
    
    let confirmationMsg = `Konfirmasi Penyimpanan Servis:\n\n`;
    confirmationMsg += `Pelanggan: ${customer ? customer.name : '-'}\n`;
    confirmationMsg += `No. Polisi: ${customer ? (customer.policeNumber || '-') : '-'}\n`;
    confirmationMsg += `Tanggal: ${formatDate(tanggal)}\n`;
    if (complaint) {
      confirmationMsg += `Keluhan: ${complaint}\n`;
    }
    confirmationMsg += `\nItem Servis:\n`;
    
    items.forEach(item => {
      const itemType = item.type === "jasa" ? " (Jasa)" : "";
      confirmationMsg += `• ${item.name}${itemType}: ${formatCurrency(item.price)} ${item.type === "sparepart" ? `x ${item.qty}` : ""} = ${formatCurrency(item.price * (item.qty || 1))}\n`;
    });
    
    confirmationMsg += `\nTotal: ${formatCurrency(total)}\n\n`;
    confirmationMsg += `Stok sparepart akan dikurangi sesuai quantity yang digunakan.\n`;
    confirmationMsg += `Lanjutkan menyimpan?`;
    
    if (!confirm(confirmationMsg)) {
      return;
    }
    
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
      complaint: complaint
    };
    
    const data = getData(KEY);
    data.push(newServis);
    saveData(KEY, data);
    
    resetForm();
    renderTable();
    closeModal();
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
    
    if (e.target.classList.contains("btn-view")) {
      showDetail(id);
    }
  });
}

// ======================
// SHOW DETAIL
// ======================
let currentServisId = null;
let isEditingItems = false;

function showDetail(id) {
  currentServisId = id;
  isEditingItems = false;
  
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
  document.getElementById("detailComplaint").textContent = servis.complaint || "-";
  document.getElementById("detailTotal").textContent = formatCurrency(servis.total);
  
  // Show/hide edit button based on status
  const btnEditItems = document.getElementById("btnEditItems");
  const btnSaveEdit = document.getElementById("btnSaveEdit");
  const detailItemsSection = document.getElementById("detailItemsSection");
  const editItemsSection = document.getElementById("editItemsSection");
  
  if (servis.status !== "selesai") {
    btnEditItems.style.display = "inline-block";
  } else {
    btnEditItems.style.display = "none";
    btnSaveEdit.style.display = "none";
    detailItemsSection.style.display = "block";
    editItemsSection.style.display = "none";
  }
  
  // Display items
  const itemsList = document.getElementById("detailItems");
  itemsList.innerHTML = servis.items.map(item => {
    const itemType = item.type === "jasa" ? " (Jasa)" : "";
    return `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          ${sanitizeHTML(item.name)}${itemType}
          <small class="d-block text-muted">${formatCurrency(item.price)} ${item.type === "sparepart" ? `x ${item.qty}` : ""}</small>
        </div>
        <span class="badge bg-primary rounded-pill">${formatCurrency(item.price * (item.qty || 1))}</span>
      </li>
    `;
  }).join('');
  
  // Setup edit button event
  btnEditItems.onclick = () => {
    isEditingItems = true;
    detailItemsSection.style.display = "none";
    editItemsSection.style.display = "block";
    btnEditItems.style.display = "none";
    btnSaveEdit.style.display = "inline-block";
    renderEditItems(servis.items);
  };
  
  // Setup save edit button event
  btnSaveEdit.onclick = () => {
    saveEditedItems();
  };
  
  // Setup add item in edit mode
  document.getElementById("editAddItem").onclick = () => {
    addEditItemRow();
  };
  
  const modal = new bootstrap.Modal(document.getElementById("modalDetail"));
  modal.show();
}

// ======================
// EDIT ITEMS IN DETAIL MODAL
// ======================
function renderEditItems(items) {
  const container = document.getElementById("editItemContainer");
  container.innerHTML = "";
  
  items.forEach((item, index) => {
    addEditItemRow(item, index);
  });
}

function addEditItemRow(item = null, index = null) {
  const container = document.getElementById("editItemContainer");
  const rowId = "edit-row-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  
  const row = document.createElement("div");
  row.className = "row g-2 mb-2 edit-item-row";
  row.id = rowId;
  
  const parts = getData(PART_KEY);
  let options = `<option value="">-- Pilih Sparepart --</option>`;
  parts.forEach(p => {
    const safeName = sanitizeHTML(p.name);
    options += `<option value="${p.id}" data-price="${p.price}">${safeName}</option>`;
  });
  
  const isJasa = item && item.type === "jasa";
  const currentName = item ? item.name : "";
  const currentPrice = item ? item.price : 0;
  const currentQty = item ? (item.qty || 1) : 1;
  const currentPartId = item && item.partId ? item.partId : "";
  
  row.innerHTML = `
    <div class="col-md-3">
      <select class="form-select edit-part-select">
        ${options}
      </select>
    </div>
    <div class="col-md-3">
      <input type="text" class="form-control edit-item-name" placeholder="Nama" value="${isJasa ? currentName : ''}">
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control edit-item-price" placeholder="Harga" value="${currentPrice}">
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control edit-item-qty" placeholder="Qty" value="${currentQty}" min="1">
    </div>
    <div class="col-md-2 d-flex align-items-end">
      <button class="btn btn-danger w-100 btn-remove-edit">✕</button>
    </div>
  `;
  
  container.appendChild(row);
  
  const partSelect = row.querySelector(".edit-part-select");
  const nameInput = row.querySelector(".edit-item-name");
  const priceInput = row.querySelector(".edit-item-qty");
  const qtyInput = row.querySelector(".edit-item-qty");
  
  // Set initial values
  if (item) {
    if (item.partId) {
      partSelect.value = item.partId;
      nameInput.value = item.name;
      // Cannot edit part name or price - read only
      nameInput.readOnly = true;
      priceInput.readOnly = true;
    } else if (item.type === "jasa") {
      partSelect.value = "";
      nameInput.value = item.name;
      priceInput.value = item.price;
    }
    qtyInput.value = item.qty || 1;
  }
  
  // Handle part selection
  partSelect.addEventListener("change", () => {
    const selectedOption = partSelect.options[partSelect.selectedIndex];
    if (selectedOption.value) {
      nameInput.value = selectedOption.text;
      priceInput.value = selectedOption.dataset.price;
      nameInput.readOnly = true;
      priceInput.readOnly = true;
    } else {
      nameInput.readOnly = false;
      priceInput.readOnly = false;
    }
  });
  
  // Remove row
  row.querySelector(".btn-remove-edit").addEventListener("click", () => {
    row.remove();
  });
}

function saveEditedItems() {
  const data = getData(KEY);
  const servisIndex = data.findIndex(s => s.id == currentServisId);
  
  if (servisIndex === -1) return;
  
  const items = [];
  document.querySelectorAll(".edit-item-row").forEach(row => {
    const partSelect = row.querySelector(".edit-part-select");
    const nameInput = row.querySelector(".edit-item-name");
    const priceInput = row.querySelector(".edit-item-price");
    const qtyInput = row.querySelector(".edit-item-qty");
    
    const partId = partSelect.value;
    const name = nameInput.value;
    const price = parseFloat(priceInput.value) || 0;
    const qty = parseInt(qtyInput.value) || 1;
    
    if (name && price > 0) {
      items.push({
        partId: partId || null,
        name,
        price,
        qty,
        type: partId ? "sparepart" : "jasa"
      });
    }
  });
  
  if (items.length === 0) {
    alert("Minimal satu item harus ada");
    return;
  }
  
  // Calculate new total
  const total = items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  
  data[servisIndex].items = items;
  data[servisIndex].total = total;
  
  saveData(KEY, data);
  
  // Refresh the view
  const searchInput = document.getElementById("searchServis");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "", currentFilterStatus);
  
  // Close and reopen detail modal to refresh
  const modal = bootstrap.Modal.getInstance(document.getElementById("modalDetail"));
  if (modal) {
    modal.hide();
  }
  
  // Show updated detail
  setTimeout(() => showDetail(currentServisId), 300);
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
  renderTable(searchInput ? searchInput.value.toLowerCase() : "", currentFilterStatus);
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
  renderTable(searchInput ? searchInput.value.toLowerCase() : "", currentFilterStatus);
}

// ======================
// RESET FORM
// ======================
function resetForm() {
  document.getElementById("tanggal").value = "";
  document.getElementById("customerInput").value = "";
  document.getElementById("customerSelect").value = "";
  document.getElementById("customerInput").readOnly = false;
  document.getElementById("customerComplaint").value = "";
  document.getElementById("itemContainer").innerHTML = "";
  document.getElementById("jasaContainer").innerHTML = "";
  document.getElementById("totalDisplay").innerText = formatCurrency(0);
  
  // Remove validation classes
  document.getElementById("tanggal").classList.remove("is-invalid");
  document.getElementById("customerInput").classList.remove("is-invalid");
  
  // Hide validation and info
  hideCustomerValidation();
  hideSelectedCustomerInfo();
  
  // Reset customer datalist
  renderCustomerDatalist();
  
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
