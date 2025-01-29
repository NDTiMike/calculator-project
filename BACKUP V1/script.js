document.addEventListener("DOMContentLoaded", () => {
  const descriptionSelect = document.getElementById("description");
  const multiplierInput = document.getElementById("multiplier");
  const form = document.getElementById("calculator-form");
  const resultDisplay = document.getElementById("result");
  const selectedValueDisplay = document.createElement("h2"); // For showing the selected value
  selectedValueDisplay.id = "selected-value";
  resultDisplay.insertAdjacentElement("beforebegin", selectedValueDisplay); // Insert above the result

  console.log("Fetching CSV...");

  // Fetch the CSV data
  fetch('data.csv')
    .then(response => {
      console.log("Fetch response:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(csvText => {
      console.log("CSV Loaded:", csvText);

      const rows = csvText.split("\n").slice(1); // Skip the header row
      rows.forEach(row => {
        const [description, value] = row.split(/,(.+)/); // Split at the first comma
        if (description && value) {
          const numericValue = parseFloat(value.replace(/"/g, '').replace(/,/g, '').trim());
          console.log(`Description: "${description.trim()}", Value: ${numericValue}`);
          if (!isNaN(numericValue)) {
            const option = document.createElement("option");
            option.value = numericValue; // Store numeric value for dropdown
            option.textContent = description.trim(); // Use description for display
            descriptionSelect.appendChild(option);
          } else {
            console.error("Invalid numeric value:", value);
          }
        }
      });
    })
    .catch(error => console.error("Error loading CSV:", error));

  // Show the selected value dynamically
  descriptionSelect.addEventListener("change", () => {
    const selectedValue = parseFloat(descriptionSelect.value); // Get the numeric value of the selected option
    if (!isNaN(selectedValue)) {
      selectedValueDisplay.textContent = `Economic Value Per Unit: £${selectedValue.toFixed(2)}`;
    } else {
      selectedValueDisplay.textContent = "Please select a valid option.";
    }
  });

  // Handle form submission for the calculation
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedValue = parseFloat(descriptionSelect.value); // Get the numeric value from dropdown
    const multiplier = parseFloat(multiplierInput.value); // Get the multiplier input

    console.log("Selected Value:", selectedValue);
    console.log("Multiplier:", multiplier);

    // Validate inputs
    if (!isNaN(selectedValue) && !isNaN(multiplier)) {
      const result = selectedValue * multiplier; // Perform the calculation
      resultDisplay.textContent = `Result: £${result.toFixed(2)}`; // Display the result
    } else {
      resultDisplay.textContent = "Please select a valid option and enter a multiplier.";
    }
  });
});
