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
  const statusFilter = document.getElementById("filterStatus");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
  setupEvent();
  addItemRow(); // default 1 row
  setupSearch();
  setupStatusFilter();
}

// ======================
// STATUS FILTER
// ======================
function setupStatusFilter() {
  const statusFilter = document.getElementById("filterStatus");
  statusFilter.addEventListener("change", () => {
    const searchInput = document.getElementById("searchServis");
    renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter.value);
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
      const statusFilter = document.getElementById("filterStatus");
      renderTable(query, statusFilter ? statusFilter.value : "");
    }, 300);
  });
}

// ======================
// DATALIST CUSTOMER
// ======================
function renderCustomerDatalist(customers = null) {
  const custData = customers || getData(CUSTOMER_KEY);
  const input = document.getElementById("customerInput");
  const datalist = document.getElementById("customerDatalist");
  const customerNote = document.getElementById("customerNote");
  
  datalist.innerHTML = "";
  custData.forEach(c => {
    const safeName = sanitizeHTML(c.name);
    const police = c.policeNumber ? ` (${sanitizeHTML(c.policeNumber)})` : "";
    datalist.innerHTML += `<option value="${safeName}${police}" data-id="${c.id}" data-police="${c.policeNumber || ''}">`;
  });
  
  // Handle selection
  input.addEventListener("input", () => {
    const hiddenSelect = document.getElementById("customerSelect");
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === input.value);
    if (selectedOption) {
      hiddenSelect.value = selectedOption.dataset.id;
      input.classList.remove("is-invalid");
      customerNote.style.display = "none";
    } else if (input.value) {
      // User typed something that doesn't match any option
      hiddenSelect.value = "";
      customerNote.textContent = "Pelanggan tidak ditemukan";
      customerNote.style.display = "block";
    } else {
      hiddenSelect.value = "";
      customerNote.style.display = "none";
    }
  });
  
  input.addEventListener("change", () => {
    const hiddenSelect = document.getElementById("customerSelect");
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === input.value);
    if (selectedOption) {
      hiddenSelect.value = selectedOption.dataset.id;
      input.classList.remove("is-invalid");
      customerNote.style.display = "none";
    } else if (input.value) {
      // User typed something that doesn't match exactly
      input.classList.add("is-invalid");
      customerNote.textContent = "Pelanggan tidak ditemukan";
      customerNote.style.display = "block";
    } else {
      customerNote.style.display = "none";
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
    <div class="col-md-4">
      <label class="form-label small">Sparepart</label>
      <div class="input-group">
        <input type="text" class="form-control part-input" placeholder="Cari sparepart..." list="partDatalist-${rowId}">
        <button type="button" class="btn btn-outline-secondary btn-clear-part" title="Hapus pilihan">✕</button>
      </div>
      <datalist id="partDatalist-${rowId}">${options}</datalist>
      <input type="hidden" class="part-id">
      <div class="part-note small mt-1" style="display: none;"></div>
    </div>

    <div class="col-md-3">
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
  const partNote = row.querySelector(".part-note");
  const btnPlus = row.querySelector(".btn-plus");
  const btnMinus = row.querySelector(".btn-minus");
  const btnClearPart = row.querySelector(".btn-clear-part");
  
  // Handle part selection from datalist
  partInput.addEventListener("input", () => {
    const datalist = row.querySelector(`#partDatalist-${rowId}`);
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === partInput.value);
    
    if (selectedOption && !selectedOption.disabled) {
      partIdInput.value = selectedOption.dataset.id;
      priceInput.value = selectedOption.dataset.price;
      
      const stock = parseInt(selectedOption.dataset.stock);
      partNote.textContent = `Stok tersedia: ${stock}`;
      partNote.style.display = "block";
      partNote.className = stock > 0 ? "part-note small text-success mt-1" : "part-note small text-danger mt-1";
      
      // Set max quantity based on stock
      qtyInput.max = stock;
      if (parseInt(qtyInput.value) > stock) {
        qtyInput.value = stock;
      }
    } else if (partInput.value) {
      // User typed something that doesn't match any option
      partIdInput.value = "";
      partNote.textContent = "Sparepart tidak ditemukan";
      partNote.style.display = "block";
      partNote.className = "part-note small text-danger mt-1";
    } else {
      partIdInput.value = "";
      partNote.style.display = "none";
    }
    
    calculateTotal();
  });
  
  // Clear part button
  btnClearPart.addEventListener("click", () => {
    partInput.value = "";
    partIdInput.value = "";
    priceInput.value = "";
    partNote.style.display = "none";
    qtyInput.value = 1;
    qtyInput.max = 99;
    calculateTotal();
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
    const name = row.querySelector(".part-input").value.trim();
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
function renderTable(searchQuery = "", statusFilter = "") {
  const data = getData(KEY);
  const customers = getData(CUSTOMER_KEY);
  const table = document.getElementById("servisTable");
  
  table.innerHTML = "";
  
  // Filter by search query and status
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
  if (statusFilter) {
    filteredData = filteredData.filter(item => item.status === statusFilter);
  }
  
  if (filteredData.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="text-center py-4">
      <div class="text-muted">
        <p class="mb-1">🔧</p>
        <p>${searchQuery || statusFilter ? "Tidak ada hasil pencarian" : "Belum ada data servis"}</p>
        <small>${searchQuery || statusFilter ? "Coba kata kunci lain" : "Klik tombol 'Tambah Servis' untuk menambah data"}</small>
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
  
  // Show catatan
  const catatan = document.getElementById("catatan").value;
  const previewCatatan = document.getElementById("previewCatatan");
  previewCatatan.textContent = catatan || "-";
  
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
  const btnClearCustomer = document.getElementById("clearCustomer");
  
  // Clear customer button
  btnClearCustomer.addEventListener("click", () => {
    document.getElementById("customerInput").value = "";
    document.getElementById("customerSelect").value = "";
    document.getElementById("customerNote").style.display = "none";
  });
  
  // Add item
  btnAddItem.addEventListener("click", addItemRow);
  
  // Preview
  btnPreview.addEventListener("click", showPreview);
  
  // Save with preview confirmation
  btnSave.addEventListener("click", () => {
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
    
    let confirmationMsg = `Konfirmasi Penyimpanan Servis:\n\n`;
    confirmationMsg += `Pelanggan: ${customer ? customer.name : '-'}\n`;
    confirmationMsg += `Tanggal: ${formatDate(tanggal)}\n\n`;
    confirmationMsg += `Item Servis:\n`;
    
    items.forEach(item => {
      const partName = item.partId ? item.name : `${item.name} (Manual)`;
      confirmationMsg += `• ${partName}: ${formatCurrency(item.price)} x ${item.qty} = ${formatCurrency(item.price * item.qty)}\n`;
    });
    
    confirmationMsg += `\nTotal: ${formatCurrency(total)}\n\n`;
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
      catatan: document.getElementById("catatan").value,
      status: "menunggu"
    };
    
    const data = getData(KEY);
    data.push(newServis);
    saveData(KEY, data);
    
    resetForm();
    const searchInput = document.getElementById("searchServis");
    const statusFilter = document.getElementById("filterStatus");
    renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
    
    // Close modal using Bootstrap
    const modalElement = document.getElementById("modalServis");
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
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
  
  // Show catatan
  const detailCatatan = document.getElementById("detailCatatan");
  detailCatatan.textContent = servis.catatan || "-";
  
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
  const statusFilter = document.getElementById("filterStatus");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
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
  const statusFilter = document.getElementById("filterStatus");
  renderTable(searchInput ? searchInput.value.toLowerCase() : "", statusFilter ? statusFilter.value : "");
}

// ======================
// RESET FORM
// ======================
function resetForm() {
  // Reset to today's date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("tanggal").value = today;
  
  document.getElementById("customerInput").value = "";
  document.getElementById("customerSelect").value = "";
  document.getElementById("itemContainer").innerHTML = "";
  document.getElementById("totalDisplay").innerText = formatCurrency(0);
  document.getElementById("catatan").value = "";
  document.getElementById("customerNote").style.display = "none";
  
  // Remove validation classes
  document.getElementById("tanggal").classList.remove("is-invalid");
  document.getElementById("customerInput").classList.remove("is-invalid");
  
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
