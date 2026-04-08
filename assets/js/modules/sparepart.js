// assets/js/modules/sparepart.js

import { getData, saveData } from "../storage.js";
import { generateId, sanitizeHTML, formatCurrency } from "../utils.js";

const KEY = "parts";

function getSearchQuery() {
  const searchInput = document.getElementById("searchPart");
  return searchInput ? searchInput.value.toLowerCase() : "";
}

// INIT
export function initSparepartPage() {
  renderTable(getSearchQuery());
  setupEvent();
}

// ======================
// RENDER TABLE
// ======================
function renderTable(searchQuery = "") {
  const data = getData(KEY);
  const table = document.getElementById("partTable");

  let filteredData = data;
  
  // Filter by search query
  if (searchQuery) {
    filteredData = data.filter(item => {
      const name = item.name.toLowerCase();
      return name.includes(searchQuery);
    });
  }

  table.innerHTML = "";

  if (filteredData.length === 0) {
    table.innerHTML = `<tr><td colspan="3" class="text-center py-4">
      <div class="text-muted">
        <p class="mb-1">⚙️</p>
        <p>${searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data sparepart"}</p>
        <small>${searchQuery ? "Coba kata kunci lain" : "Klik tombol 'Tambah' untuk menambahkan sparepart"}</small>
      </div>
    </td></tr>`;
    return;
  }

  filteredData.forEach(item => {
    // Sanitize user input
    const safeName = sanitizeHTML(item.name);
    const safePrice = formatCurrency(item.price);
    
    table.innerHTML += `
      <tr>
        <td>${safeName}</td>
        <td>${safePrice}</td>
        <td>
          <button class="btn btn-warning btn-sm btn-edit" data-id="${item.id}" title="Edit">✏️</button>
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
  const btnSave = document.getElementById("savePart");
  const table = document.getElementById("partTable");
  const searchInput = document.getElementById("searchPart");

  // Search functionality
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    renderTable(query);
  });

  btnSave.addEventListener("click", () => {
    const nameInput = document.getElementById("namaPart");
    const priceInput = document.getElementById("hargaPart");
    
    const name = nameInput.value.trim();
    const price = parseInt(priceInput.value);

    // Validation
    if (!name) {
      nameInput.classList.add("is-invalid");
      return;
    }
    nameInput.classList.remove("is-invalid");
    
    if (!price || price <= 0) {
      priceInput.classList.add("is-invalid");
      return;
    }
    priceInput.classList.remove("is-invalid");

    // Check if editing or adding
    const editId = btnSave.dataset.editId;
    const data = getData(KEY);
    
    if (editId) {
      // Update existing
      const index = data.findIndex(p => p.id == editId);
      if (index !== -1) {
        // Check for duplicate name (excluding current)
        const exists = data.some(p => p.name.toLowerCase() === name.toLowerCase() && p.id != editId);
        if (exists) {
          alert("Nama sparepart sudah ada!");
          return;
        }
        data[index].name = name;
        data[index].price = price;
        saveData(KEY, data);
      }
      delete btnSave.dataset.editId;
    } else {
      // Add new
      const newPart = {
        id: generateId(),
        name,
        price
      };
      
      // Check for duplicate name
      const exists = data.some(p => p.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        alert("Nama sparepart sudah ada!");
        return;
      }
      
      data.push(newPart);
      saveData(KEY, data);
    }

    clearForm();
    renderTable(searchInput.value.toLowerCase());
    closeModal();
  });
  
  // Table events
  table.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const id = e.target.dataset.id;
      deletePart(id);
    }
    
    if (e.target.classList.contains("btn-edit")) {
      const id = e.target.dataset.id;
      editPart(id);
    }
  });
}

// ======================
// DELETE
// ======================
function deletePart(id) {
  if (!confirm("Yakin ingin menghapus sparepart ini?")) return;
  
  let data = getData(KEY);
  data = data.filter(item => item.id != id);
  saveData(KEY, data);
  renderTable(getSearchQuery());
}

// ======================
// EDIT
// ======================
function editPart(id) {
  const data = getData(KEY);
  const part = data.find(p => p.id == id);
  if (!part) return;

  // Set values to form
  document.getElementById("namaPart").value = part.name;
  document.getElementById("hargaPart").value = part.price;
  
  // Set edit ID
  document.getElementById("savePart").dataset.editId = id;
  
  // Update modal title
  document.querySelector("#modalPart .modal-header h5").textContent = "Edit Sparepart";
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("modalPart"));
  modal.show();
}

// ======================
// UTIL
// ======================
function clearForm() {
  document.getElementById("namaPart").value = "";
  document.getElementById("hargaPart").value = "";
  
  // Remove validation classes
  document.getElementById("namaPart").classList.remove("is-invalid");
  document.getElementById("hargaPart").classList.remove("is-invalid");
  
  // Reset modal title
  document.querySelector("#modalPart .modal-header h5").textContent = "Tambah Sparepart";
}

function closeModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalPart")
  );
  if (modal) {
    modal.hide();
  }
  
  // Reset form when modal is closed
  clearForm();
  
  // Remove edit ID
  delete document.getElementById("savePart").dataset.editId;
}
