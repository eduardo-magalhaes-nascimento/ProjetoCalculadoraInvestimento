import { generateReturnsArray } from "./src/investimentGoals.js";
import { Chart } from "chart.js/auto";

const form = document.getElementById("investment-form");
const clearFormButton = document.getElementById("clear-form");
const finalMoneyChart = document.getElementById("final-money-distribution");
const progressionChart = document.getElementById("progression");

let doughnutChatReference = {}
let progressionChartReference = {}

function formatCurrency(value) {
  return value.toFixed(2)
}

function renderProgression(evt) {
  evt.preventDefault();
  if (document.querySelector(".error")) {
    return false;
  }
  resetChart()
  //   const startingAmount = form['starting-amount']
  const startingAmount = Number(
    document.getElementById("starting-amount").value.replace(",", ".")
  );
  const additionalContribution = Number(
    document.getElementById("additional-contribution").value.replace(",", ".")
  );
  const timeAmount = Number(document.getElementById("time-amount").value);
  const timeAmountPeriod = document.getElementById("time-amount-period").value;
  const returnRate = Number(
    document.getElementById("return-rate").value.replace(",", ".")
  );
  const returnRatePeriod = document.getElementById("evaluation-period").value;
  const taxRate = Number(
    document.getElementById("tax-rate").value.replace(",", ".")
  );

  const returnsArray = generateReturnsArray(
    startingAmount,
    timeAmount,
    timeAmountPeriod,
    additionalContribution,
    returnRate,
    returnRatePeriod
  );

  const finalInvestmentObject = returnsArray[returnsArray.length - 1];
  // console.log(returnsArray);
  doughnutChatReference = new Chart(finalMoneyChart, {
    type: "doughnut",
    data: {
      labels: ["Total Investido", "Rendimento", "Imposto"],
      datasets: [
        {
          data: [
            formatCurrency(finalInvestmentObject.investedAmount),
            formatCurrency(finalInvestmentObject.totalInterestReturns * (1 - taxRate / 100)),
            formatCurrency(finalInvestmentObject.totalInterestReturns * (taxRate/100)),
          ],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  });


  progressionChartReference = new Chart(progressionChart, {
    type: 'bar',
    data: {
      labels: returnsArray.map(investmentObject => investmentObject.month),
      datasets: [{
        label: "Total Investido",
        backgroundColor: "rgb(255, 99, 132)",
        data: returnsArray.map(investmentObject => formatCurrency(investmentObject.investedAmount))
      }, {
        label: "Retorno de Investimento",
        backgroundColor: "rgb(54, 162, 235)",
        data: returnsArray.map(investmentObject => formatCurrency(investmentObject.interestReturns))
      }]
    },
    options: {
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true
      }
    }
  }
  })
}

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function resetChart() {
  if(!isObjectEmpty(doughnutChatReference) && !isObjectEmpty(progressionChartReference)) {
    doughnutChatReference.destroy();
    progressionChartReference.destroy();
  }
}

function clearForm() {
  form["starting-amount"].value = "";
  form["additional-contribution"].value = "";
  form["time-amount"].value = "";
  form["return-rate"].value = "";
  form["tax-rate"].value = "";

  resetChart()

  const errorInputContainers = document.querySelectorAll(".error");

  for (const errorInputContainer of errorInputContainers) {
    errorInputContainer.classList.remove("error");
    errorInputContainer.parentElement.querySelector("p").remove();
  }
}

function validateInput(evt) {
  if (evt.target.value === "") {
    return;
  }

  const { parentElement } = evt.target; // Tag pai tem que ser pintada
  const grandParentElement = evt.target.parentElement.parentElement; // Tag avo tem que ser adicionada a altura
  const inputValue = evt.target.value.replace(",", ".");
  if (
    !parentElement.classList.contains("error") &&
    (Number(inputValue) <= 0 || isNaN(inputValue))
  ) {
    const errorTextElement = document.createElement("p"); //<p></p>
    errorTextElement.classList.add("text-red-500"); //<p class="text-red-500"></p>
    errorTextElement.innerText = "Insira um valor númerico e maior que zero";

    parentElement.classList.add("error");
    grandParentElement.appendChild(errorTextElement);
  } else if (
    parentElement.classList.contains("error") &&
    !isNaN(inputValue) &&
    Number(inputValue) > 0
  ) {
    parentElement.classList.remove("error");
    grandParentElement.querySelector("p").remove();
  }
}

for (const formElement of form) {
  if (formElement.tagName === "INPUT" && formElement.hasAttribute("name")) {
    formElement.addEventListener("blur", validateInput);
  }
}

form.addEventListener("submit", renderProgression);
clearFormButton.addEventListener("click", clearForm);
