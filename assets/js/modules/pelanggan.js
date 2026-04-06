// assets/js/modules/pelanggan.js

import { getData, saveData } from "../storage.js";
import { generateId } from "../utils.js";

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
    table.innerHTML = `<tr><td colspan="2" class="text-center">Belum ada data</td></tr>`;
    return;
  }

  data.forEach((item) => {
    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.phone}</td>
      </tr>
    `;
  });
}

// SETUP EVENT
function setupEvent() {
  const btnSave = document.getElementById("savePelanggan");

  btnSave.addEventListener("click", () => {
    const name = document.getElementById("namaPelanggan").value.trim();
    const phone = document.getElementById("noHp").value.trim();

    if (!name) {
      alert("Nama wajib diisi");
      return;
    }

    const newCustomer = {
      id: generateId(),
      name,
      phone
    };

    const data = getData(KEY);
    data.push(newCustomer);
    saveData(KEY, data);

    clearForm();
    renderTable();
    closeModal();
  });
}

// CLEAR FORM
function clearForm() {
  document.getElementById("namaPelanggan").value = "";
  document.getElementById("noHp").value = "";
}

// CLOSE MODAL
function closeModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalPelanggan")
  );
  modal.hide();
}
