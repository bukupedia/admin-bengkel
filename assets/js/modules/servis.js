// assets/js/modules/servis.js

import { getData, saveData } from "../storage.js";
import { generateId } from "../utils.js";

const KEY = "servis";
const CUSTOMER_KEY = "customers";

// INIT
export function initServisPage() {
  renderCustomerDropdown();
  renderTable();
  setupEvent();
}

// ======================
// DROPDOWN PELANGGAN
// ======================
function renderCustomerDropdown() {
  const customers = getData(CUSTOMER_KEY);
  const select = document.getElementById("customerSelect");

  select.innerHTML = `<option value="">-- Pilih Pelanggan --</option>`;

  customers.forEach(c => {
    select.innerHTML += `
      <option value="${c.id}">${c.name}</option>
    `;
  });
}

// ======================
// RENDER TABLE
// ======================
function renderTable() {
  const data = getData(KEY);
  const customers = getData(CUSTOMER_KEY);
  const table = document.getElementById("servisTable");

  table.innerHTML = "";

  if (data.length === 0) {
    table.innerHTML = `<tr><td colspan="4" class="text-center">Belum ada data</td></tr>`;
    return;
  }

  data.forEach(item => {
    const customer = customers.find(c => c.id == item.customerId);

    table.innerHTML += `
      <tr>
        <td>${item.tanggal}</td>
        <td>${customer ? customer.name : "-"}</td>
        <td>Rp ${item.total.toLocaleString("id-ID")}</td>
        <td>
          <span class="badge bg-${item.status === "selesai" ? "success" : "warning"}">
            ${item.status}
          </span>
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

  btnSave.addEventListener("click", () => {
    const tanggal = document.getElementById("tanggal").value;
    const customerId = document.getElementById("customerSelect").value;
    const total = parseInt(document.getElementById("total").value);

    if (!tanggal || !customerId || !total) {
      alert("Semua field wajib diisi");
      return;
    }

    const newServis = {
      id: generateId(),
      tanggal,
      customerId,
      total,
      status: "proses"
    };

    const data = getData(KEY);
    data.push(newServis);
    saveData(KEY, data);

    clearForm();
    renderTable();
    closeModal();
  });
}

// ======================
// UTIL UI
// ======================
function clearForm() {
  document.getElementById("tanggal").value = "";
  document.getElementById("customerSelect").value = "";
  document.getElementById("total").value = "";
}

function closeModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalServis")
  );
  modal.hide();
}
