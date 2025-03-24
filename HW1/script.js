"use strict";

const idRegex = /[a-zA-Z]\w*/g;

function getInputIds(formulaString) {
  const inputIds = formulaString.match(idRegex);
  return inputIds ? Array.from(new Set(inputIds)) : [];
}

document.querySelectorAll("formula").forEach((formulaElement) => {
  const formulaString = formulaElement.attributes["evaluator"].value;
  const inputIds = getInputIds(formulaString);
  function evaluateFormula() {
    let inputEntered = true;
    const expression = formulaString.replace(idRegex, (match) => {
      const inputElement = document.getElementById(match);
      if (!inputElement.value) {
        inputEntered = false;
      }
      return `(${inputElement.value})`;
    });
    if (inputEntered) {
      try {
        const formulaResult = eval(expression);
        formulaElement.innerHTML = `Result: ${formulaResult}.`;
      } catch (error) {
        formulaElement.innerHTML = "Invalid Formula.";
      }
    } else {
      formulaElement.innerHTML = "Please enter all inputs.";
    }
  }
  inputIds.forEach((inputId) => {
    document.getElementById(inputId).addEventListener("input", evaluateFormula);
  });
  evaluateFormula();
});
