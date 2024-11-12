const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("from-currency");
const toCurrency = document.getElementById("to-currency");
const convertBtn = document.getElementById("convert-btn");
const swapBtn = document.getElementById("swap-btn");
const result = document.getElementById("result");

// Replace with your API key from https://www.exchangerate-api.com/
const API_KEY = "YOUR_API_KEY";

const CDF_RATES = {
  USD: 2500, // exemple de taux
  EUR: 2700, // à mettre à jour manuellement
  // autres devises...
};

function convertWithCDF(amount, fromCurrency, toCurrency) {
  if (fromCurrency === "CDF") {
    return amount / CDF_RATES[toCurrency];
  } else if (toCurrency === "CDF") {
    return amount * CDF_RATES[fromCurrency];
  }
}

async function convertCurrency(amount, fromCurrency, toCurrency) {
  try {
    // Si c'est la même devise, retourner le même montant
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Gestion spéciale pour CDF
    if (fromCurrency === "CDF" || toCurrency === "CDF") {
      const cdfRate = parseFloat(document.getElementById("cdf-rate").value);
      if (!cdfRate) {
        throw new Error("Veuillez saisir le taux CDF actuel");
      }

      if (fromCurrency === "CDF") {
        return amount / cdfRate;
      } else {
        return amount * cdfRate;
      }
    }

    // Utilisation de l'API Frankfurter (plus fiable)
    const response = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
    );
    const data = await response.json();

    if (data.rates && data.rates[toCurrency]) {
      return data.rates[toCurrency];
    } else {
      // Alternative avec Exchange Rate API si Frankfurter échoue
      const backupResponse = await fetch(
        `https://api.exchangerate.host/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
      );
      const backupData = await backupResponse.json();

      if (backupData.result) {
        return backupData.result;
      }
      throw new Error("Conversion impossible");
    }
  } catch (error) {
    console.error("Erreur détaillée:", error);
    throw new Error("Erreur de conversion de devise");
  }
}

// Fonction pour formater le résultat
function formatCurrencyValue(value, currency) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Fonction pour effectuer la conversion
async function performConversion() {
  const amount = parseFloat(document.getElementById("amount").value);
  const fromCurrency = document.getElementById("from-currency").value;
  const toCurrency = document.getElementById("to-currency").value;
  const resultElement = document.getElementById("result");

  try {
    if (!amount || isNaN(amount)) {
      throw new Error("Veuillez saisir un montant valide");
    }

    const result = await convertCurrency(amount, fromCurrency, toCurrency);
    resultElement.textContent = `${formatCurrencyValue(
      amount,
      fromCurrency
    )} = ${formatCurrencyValue(result, toCurrency)}`;
    resultElement.style.color = "black";
  } catch (error) {
    resultElement.textContent = `Erreur: ${error.message}`;
    resultElement.style.color = "red";
  }
}

function swapCurrencies() {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;
}

function showCdfRateInput() {
  const fromCurrency = document.getElementById("from-currency").value;
  const toCurrency = document.getElementById("to-currency").value;
  const cdfContainer = document.getElementById("cdf-rate-container");

  if (fromCurrency === "CDF" || toCurrency === "CDF") {
    cdfContainer.style.display = "block";
  } else {
    cdfContainer.style.display = "none";
  }
}

document
  .getElementById("from-currency")
  .addEventListener("change", showCdfRateInput);
document
  .getElementById("to-currency")
  .addEventListener("change", showCdfRateInput);

convertBtn.addEventListener("click", async () => {
  const amount = amountInput.value;
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (!amount || amount <= 0) {
    result.textContent = "Please enter a valid amount";
    return;
  }

  try {
    const convertedAmount = await convertCurrency(amount, from, to);
    result.textContent = `${amount} ${from} = ${convertedAmount} ${to}`;
  } catch (error) {
    result.textContent = "Error: Could not convert currency";
    console.error(error);
  }
});

swapBtn.addEventListener("click", swapCurrencies);

// Ajouter un écouteur d'événement pour la touche Enter
document.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    document.getElementById("convert-btn").click();
  }
});
