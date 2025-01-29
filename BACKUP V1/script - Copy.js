document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category");
  const detailSelect = document.getElementById("detail");
  const costDetailSelect = document.getElementById("costDetail");
  const multiplierInput = document.getElementById("multiplier");
  const form = document.getElementById("calculator-form");

  const socialDisplay = document.getElementById("social-total");
  const economicDisplay = document.getElementById("economic-total");
  const fiscalDisplay = document.getElementById("fiscal-total");
  const grandTotalDisplay = document.getElementById("grand-total");

  const baseSocial = document.getElementById("base-social");
  const baseEconomic = document.getElementById("base-economic");
  const baseFiscal = document.getElementById("base-fiscal");

  const summaryTableBody = document.querySelector("#summary-table tbody");
  const runningSocial = document.getElementById("running-social");
  const runningEconomic = document.getElementById("running-economic");
  const runningFiscal = document.getElementById("running-fiscal");
  const runningGrand = document.getElementById("running-grand");
  const exportButton = document.getElementById("export-button");

  let incidentData = [];
  let totalSocial = 0, totalEconomic = 0, totalFiscal = 0, totalGrand = 0;

  function updateRunningTotals() {
    runningSocial.textContent = `£${totalSocial.toFixed(2)}`;
    runningEconomic.textContent = `£${totalEconomic.toFixed(2)}`;
    runningFiscal.textContent = `£${totalFiscal.toFixed(2)}`;
    runningGrand.textContent = `£${totalGrand.toFixed(2)}`;
  }

  function resetBaseCosts() {
    baseSocial.textContent = `Social: £0.00`;
    baseEconomic.textContent = `Economic: £0.00`;
    baseFiscal.textContent = `Fiscal: £0.00`;
  }

  fetch('data.csv')
    .then(response => response.text())
    .then(csvText => {
      console.log("CSV Loaded Successfully.");

      const rows = csvText.split("\n").slice(1);
      incidentData = rows.map(row => {
        const values = row.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(val => val.trim());

        return {
          category: values[0] || "",
          detail: values[1] || "",
          costDetail: values[2] || "",
          fiscal: parseFloat(values[6]?.replace(/,/g, '')) || 0,
          economic: parseFloat(values[7]?.replace(/,/g, '')) || 0,
          social: parseFloat(values[8]?.replace(/,/g, '')) || 0,
        };
      });

      populateCategories();
    })
    .catch(error => console.error("Error loading CSV:", error));

  function populateCategories() {
    categorySelect.innerHTML = `<option value="" disabled selected>Select an outcome category</option>`;
    const uniqueCategories = [...new Set(incidentData.map(item => item.category))].filter(Boolean);

    uniqueCategories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  categorySelect.addEventListener("change", () => {
    detailSelect.innerHTML = `<option value="" disabled selected>Select an outcome detail</option>`;
    costDetailSelect.innerHTML = `<option value="" disabled selected>Select a cost/saving detail</option>`;
    resetBaseCosts();

    const selectedCategory = categorySelect.value;
    const filteredDetails = [...new Set(
      incidentData.filter(item => item.category === selectedCategory).map(item => item.detail)
    )];

    filteredDetails.forEach(detail => {
      const option = document.createElement("option");
      option.value = detail;
      option.textContent = detail;
      detailSelect.appendChild(option);
    });
  });

  detailSelect.addEventListener("change", () => {
    costDetailSelect.innerHTML = `<option value="" disabled selected>Select a cost/saving detail</option>`;
    resetBaseCosts();

    const selectedCategory = categorySelect.value;
    const selectedDetail = detailSelect.value;
    const filteredCostDetails = [...new Set(
      incidentData.filter(item => item.category === selectedCategory && item.detail === selectedDetail)
        .map(item => item.costDetail)
    )];

    filteredCostDetails.forEach(costDetail => {
      const option = document.createElement("option");
      option.value = costDetail;
      option.textContent = costDetail;
      costDetailSelect.appendChild(option);
    });
  });

  costDetailSelect.addEventListener("change", () => {
    const selectedCategory = categorySelect.value;
    const selectedDetail = detailSelect.value;
    const selectedCostDetail = costDetailSelect.value;
    updateBaseCosts(selectedCategory, selectedDetail, selectedCostDetail);
  });

  function updateBaseCosts(category, detail, costDetail) {
    const selectedIncident = incidentData.find(item =>
      item.category === category && item.detail === detail && item.costDetail === costDetail
    );

    if (selectedIncident) {
      baseSocial.textContent = `Social: £${selectedIncident.social.toFixed(2)}`;
      baseEconomic.textContent = `Economic: £${selectedIncident.economic.toFixed(2)}`;
      baseFiscal.textContent = `Fiscal: £${selectedIncident.fiscal.toFixed(2)}`;
    } else {
      resetBaseCosts();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedCategory = categorySelect.value;
    const selectedDetail = detailSelect.value;
    const selectedCostDetail = costDetailSelect.value;
    const multiplier = parseFloat(multiplierInput.value);

    if (!selectedCategory || !selectedDetail || !selectedCostDetail || isNaN(multiplier)) {
      alert("Please select valid options and enter a valid multiplier.");
      return;
    }

    const selectedIncident = incidentData.find(item =>
      item.category === selectedCategory &&
      item.detail === selectedDetail &&
      item.costDetail === selectedCostDetail
    );

    if (selectedIncident) {
      const socialTotal = selectedIncident.social * multiplier;
      const economicTotal = selectedIncident.economic * multiplier;
      const fiscalTotal = selectedIncident.fiscal * multiplier;
      const grandTotal = socialTotal + economicTotal + fiscalTotal;

      socialDisplay.textContent = `Social Total: £${socialTotal.toFixed(2)}`;
      economicDisplay.textContent = `Economic Total: £${economicTotal.toFixed(2)}`;
      fiscalDisplay.textContent = `Fiscal Total: £${fiscalTotal.toFixed(2)}`;
      grandTotalDisplay.textContent = `Grand Total: £${grandTotal.toFixed(2)}`;

      const newRow = summaryTableBody.insertRow();
      newRow.innerHTML = `
        <td>${selectedCategory}</td>
        <td>${selectedDetail}</td>
        <td>${selectedCostDetail}</td>
        <td>£${selectedIncident.social.toFixed(2)}</td>
        <td>£${selectedIncident.economic.toFixed(2)}</td>
        <td>£${selectedIncident.fiscal.toFixed(2)}</td>
        <td>${multiplier}</td>
        <td>£${socialTotal.toFixed(2)}</td>
        <td>£${economicTotal.toFixed(2)}</td>
        <td>£${fiscalTotal.toFixed(2)}</td>
        <td>£${grandTotal.toFixed(2)}</td>
        <td><button onclick="removeRow(this, ${socialTotal}, ${economicTotal}, ${fiscalTotal}, ${grandTotal})">X</button></td>
      `;

      totalSocial += socialTotal;
      totalEconomic += economicTotal;
      totalFiscal += fiscalTotal;
      totalGrand += grandTotal;
      updateRunningTotals();
    }
  });

  window.removeRow = function(button, social, economic, fiscal, grand) {
    totalSocial -= social;
    totalEconomic -= economic;
    totalFiscal -= fiscal;
    totalGrand -= grand;
    updateRunningTotals();
    button.closest("tr").remove();
  };
});
document.getElementById("export-button").addEventListener("click", () => {
  let table = document.getElementById("summary-table");

  if (!table) {
      alert("Table not found!");
      return;
  }

  let rows = table.querySelectorAll("tbody tr");
  if (rows.length === 0) {
      alert("No data to copy!");
      return;
  }

  let text = "";

  // Get table headers (excluding delete button column)
  let headers = Array.from(table.querySelectorAll("thead th"))
      .map(header => header.innerText.trim())
      .slice(0, -1) // Remove last column (Delete button)
      .join("\t");

  text += headers + "\n";

  // Get table row data (excluding delete button column)
  rows.forEach(row => {
      let rowData = Array.from(row.querySelectorAll("td"))
          .map(cell => cell.innerText.trim())
          .slice(0, -1) // Remove last column (Delete button)
          .join("\t");

      text += rowData + "\n";
  });

  // Copy to clipboard
  navigator.clipboard.writeText(text).then(() => {
      alert("Table copied to clipboard!");
  }).catch(err => {
      console.error("Clipboard API failed:", err);
      fallbackCopyText(text);
  });
});

// Fallback method for copying text (if clipboard API is blocked)
function fallbackCopyText(text) {
  let textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
      document.execCommand("copy");
      alert("Table copied to clipboard!");
  } catch (err) {
      alert("Copy failed. Try selecting and copying manually.");
  }
  document.body.removeChild(textarea);
}
