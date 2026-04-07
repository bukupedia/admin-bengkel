// assets/js/modules/sparepart.js

import { getData, saveData } from "../storage.js";
import { generateId, sanitizeHTML, formatCurrency } from "../utils.js";

const KEY = "parts";

// INIT
export function initSparepartPage() {
  renderTable();
  setupEvent();
}

// ======================
// RENDER TABLE
// ======================
function renderTable() {
  const data = getData(KEY);
  const table = document.getElementById("partTable");

  table.innerHTML = "";

  if (data.length === 0) {
    table.innerHTML = `<tr><td colspan="3" class="text-center py-4">
      <div class="text-muted">
        <p class="mb-1">⚙️</p>
        <p>Belum ada data sparepart</p>
        <small>Klik tombol "Tambah" untuk menambahkan sparepart</small>
      </div>
    </td></tr>`;
    return;
  }

  data.forEach(item => {
    // Sanitize user input
    const safeName = sanitizeHTML(item.name);
    const safePrice = formatCurrency(item.price);
    
    table.innerHTML += `
      <tr>
        <td data-label="Nama">${safeName}</td>
        <td data-label="Harga">${safePrice}</td>
        <td data-label="Aksi">
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

    const newPart = {
      id: generateId(),
      name,
      price
    };

    const data = getData(KEY);
    
    // Check for duplicate name
    const exists = data.some(p => p.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      alert("Nama sparepart sudah ada!");
      return;
    }
    
    data.push(newPart);
    saveData(KEY, data);

    clearForm();
    renderTable();
    closeModal();
  });
  
  // Table delete event
  table.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const id = e.target.dataset.id;
      deletePart(id);
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
  renderTable();
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
}

function closeModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalPart")
  );
  if (modal) {
    modal.hide();
  }
}
