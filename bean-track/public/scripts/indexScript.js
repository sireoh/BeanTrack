const mainModal = document.getElementById("ogJCheREvEanzp9ff7DP9Q");
const alertModal = document.getElementById("CxCVIDcEL0uyYZFlLIuvdw");
const alertNoButton = document.getElementById("egYBthp7GkuDQ92tOwfl0w");

const modalCloseButton = document.getElementById("gSPgxfT1gEmsaW1oDiiFXw");
const alertModalCloseButton = document.getElementById("RNQEB69Sm06s9rCc2FgIcA");

function initIndex() {
    modalCloseButton.addEventListener("click", () => {
        mainModal.classList.toggle("d-none");
    });

    alertModalCloseButton.addEventListener("click", () => {
        alertModal.classList.toggle("d-none");
    });
}

function setupIndex() {
    initIndex();

    alertNoButton.addEventListener("click", () => {
        alertModal.classList.toggle("d-none");
    });
}

//Load Setup
document.addEventListener("DOMContentLoaded", setupIndex());