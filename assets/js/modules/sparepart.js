// assets/js/modules/sparepart.js

import { getData, saveData } from "../storage.js";
import { generateId } from "../utils.js";

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
    table.innerHTML = `<tr><td colspan="2" class="text-center">Belum ada data</td></tr>`;
    return;
  }

  data.forEach(item => {
    table.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>Rp ${item.price.toLocaleString("id-ID")}</td>
      </tr>
    `;
  });
}

// ======================
// EVENT
// ======================
function setupEvent() {
  const btnSave = document.getElementById("savePart");

  btnSave.addEventListener("click", () => {
    const name = document.getElementById("namaPart").value.trim();
    const price = parseInt(document.getElementById("hargaPart").value);

    if (!name || !price) {
      alert("Lengkapi data");
      return;
    }

    const newPart = {
      id: generateId(),
      name,
      price
    };

    const data = getData(KEY);
    data.push(newPart);
    saveData(KEY, data);

    clearForm();
    renderTable();
    closeModal();
  });
}

// ======================
// UTIL
// ======================
function clearForm() {
  document.getElementById("namaPart").value = "";
  document.getElementById("hargaPart").value = "";
}

function closeModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalPart")
  );
  modal.hide();
}
