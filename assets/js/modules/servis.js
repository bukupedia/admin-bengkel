// assets/js/modules/servis.js

import { getData, saveData } from "../storage.js";
import { generateId } from "../utils.js";

const KEY = "servis";
const CUSTOMER_KEY = "customers";
const PART_KEY = "parts";

// ======================
// INIT
// ======================
export function initServisPage() {
  renderCustomerDropdown();
  renderTable();
  setupEvent();
  addItemRow(); // default 1 row
}

// ======================
// DROPDOWN CUSTOMER
// ======================
function renderCustomerDropdown() {
  const customers = getData(CUSTOMER_KEY);
  const select = document.getElementById("customerSelect");

  select.innerHTML = `<option value="">-- Pilih Pelanggan --</option>`;
  customers.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
  });
}

// ======================
// ITEM HANDLING
// ======================
function addItemRow() {
  const container = document.getElementById("itemContainer");
  const parts = getData(PART_KEY);

  const row = document.createElement("div");
  row.className = "row g-2 mb-2 item-row";

  // dropdown options
  let options = `<option value="">-- Pilih Sparepart --</option>`;
  parts.forEach(p => {
    options += `<option value="${p.id}" data-price="${p.price}">${p.name}</option>`;
  });

  row.innerHTML = `
    <div class="col-md-4">
      <select class="form-control part-select">
        ${options}
      </select>
    </div>

    <div class="col-md-3">
      <input type="text" class="form-control item-name" placeholder="Atau nama manual">
    </div>

    <div class="col-md-3">
      <input type="number" class="form-control item-price" placeholder="Harga">
    </div>

    <div class="col-md-2">
      <button class="btn btn-danger w-100 btn-remove">x</button>
    </div>
  `;

  container.appendChild(row);

  const select = row.querySelector(".part-select");
  const nameInput = row.querySelector(".item-name");
  const priceInput = row.querySelector(".item-price");

  // pilih sparepart → auto isi
  select.addEventListener("change", () => {
    const selected = select.options[select.selectedIndex];
    const price = selected.dataset.price;
    const name = selected.text;

    if (price) {
      priceInput.value = price;
      nameInput.value = name;
    }

    calculateTotal();
  });

  // manual input → tetap dihitung
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
  const prices = document.querySelectorAll(".item-price");
  let total = 0;

  prices.forEach(input => {
    total += parseInt(input.value) || 0;
  });

  document.getElementById("totalDisplay").innerText =
    "Rp " + total.toLocaleString("id-ID");

  return total;
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
    table.innerHTML = `<tr><td colspan="5" class="text-center">Belum ada data</td></tr>`;
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
        <td>
          <button class="btn btn-success btn-sm btn-selesai" data-id="${item.id}">✓</button>
          <button class="btn btn-danger btn-sm btn-delete" data-id="${item.id}">🗑</button>
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
    const tanggal = document.getElementById("tanggal").value;
    const customerId = document.getElementById("customerSelect").value;

    const items = [];

    document.querySelectorAll(".item-row").forEach(row => {
      const name = row.querySelector(".item-name").value;
      const price = parseInt(row.querySelector(".item-price").value);

      if (name && price) {
        items.push({ name, price });
      }
    });

    if (!tanggal || !customerId || items.length === 0) {
      alert("Lengkapi data");
      return;
    }

    const total = calculateTotal();

    const newServis = {
      id: generateId(),
      tanggal,
      customerId,
      items,
      total,
      status: "proses"
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

    if (e.target.classList.contains("btn-delete")) {
      deleteServis(id);
    }

    if (e.target.classList.contains("btn-selesai")) {
      updateStatus(id);
    }
  });
}

// ======================
// DELETE
// ======================
function deleteServis(id) {
  if (!confirm("Hapus data?")) return;

  let data = getData(KEY);
  data = data.filter(item => item.id != id);

  saveData(KEY, data);
  renderTable();
}

// ======================
// UPDATE STATUS
// ======================
function updateStatus(id) {
  let data = getData(KEY);

  data = data.map(item => {
    if (item.id == id) item.status = "selesai";
    return item;
  });

  saveData(KEY, data);
  renderTable();
}

// ======================
// RESET FORM
// ======================
function resetForm() {
  document.getElementById("tanggal").value = "";
  document.getElementById("customerSelect").value = "";
  document.getElementById("itemContainer").innerHTML = "";
  document.getElementById("totalDisplay").innerText = "Rp 0";

  addItemRow();
}

// ======================
// CLOSE MODAL
// ======================
function closeModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("modalServis")
  );
  modal.hide();
}
