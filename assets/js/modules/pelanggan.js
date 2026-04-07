// assets/js/modules/pelanggan.js

import { getData, saveData } from "../storage.js";
import { generateId, sanitizeHTML } from "../utils.js";

const KEY = "customers";

// INIT PAGE
export function initPelangganPage() {
  renderTable();
  setupEvent();
}

// RENDER TABLE
function renderTable() {
  const data = getData(KEY);
  const table = document.getElementById("pelangganTable");

  table.innerHTML = "";

  if (data.length === 0) {
    table.innerHTML = `<tr><td colspan="3" class="text-center py-4">
      <div class="text-muted">
        <p class="mb-1">📋</p>
        <p>Belum ada data pelanggan</p>
        <small>Klik tombol "Tambah" untuk menambahkan pelanggan</small>
      </div>
    </td></tr>`;
    return;
  }

  data.forEach((item) => {
    // Sanitize user input before rendering
    const safeName = sanitizeHTML(item.name);
    const safePhone = sanitizeHTML(item.phone);
    
    table.innerHTML += `
      <tr>
        <td data-label="Nama">${safeName}</td>
        <td data-label="No HP">${safePhone}</td>
        <td data-label="Aksi">
          <button class="btn btn-danger btn-sm btn-delete" data-id="${item.id}" title="Hapus">🗑</button>
        </td>
      </tr>
    `;
  });
}

// SETUP EVENT
function setupEvent() {
  const btnSave = document.getElementById("savePelanggan");
  const table = document.getElementById("pelangganTable");

  btnSave.addEventListener("click", () => {
    const nameInput = document.getElementById("namaPelanggan");
    const phoneInput = document.getElementById("noHp");
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    // Validation
    if (!name) {
      nameInput.classList.add("is-invalid");
      return;
    }
    nameInput.classList.remove("is-invalid");

    // Validate phone format (allow digits, spaces, dashes, parentheses)
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (phone && !phoneRegex.test(phone)) {
      phoneInput.classList.add("is-invalid");
      return;
    }
    phoneInput.classList.remove("is-invalid");

    const newCustomer = {
      id: generateId(),
      name,
      phone
    };

    const data = getData(KEY);
    
    // Check for duplicate name
    const exists = data.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      alert("Nama pelanggan sudah ada!");
      return;
    }
    
    data.push(newCustomer);
    saveData(KEY, data);

    clearForm();
    renderTable();
    closeModal();
  });
  
  // Table delete event
  table.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const id = e.target.dataset.id;
      deleteCustomer(id);
    }
  });
}

// DELETE CUSTOMER
function deleteCustomer(id) {
  if (!confirm("Yakin ingin menghapus pelanggan ini?")) return;
  
  let data = getData(KEY);
  data = data.filter(item => item.id != id);
  saveData(KEY, data);
  renderTable();
}

// CLEAR FORM
function clearForm() {
  document.getElementById("namaPelanggan").value = "";
  document.getElementById("noHp").value = "";
  
  // Remove validation classes
  document.getElementById("namaPelanggan").classList.remove("is-invalid");
  document.getElementById("noHp").classList.remove("is-invalid");
}

// CLOSE MODAL
function closeModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalPelanggan")
  );
  if (modal) {
    modal.hide();
  }
}
