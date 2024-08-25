const editButtons = document.getElementsByClassName("rHdkJvYyW0u1OTH9XOi7nQ");
const addShowButton = document.getElementById("VLTLkGETmEqX7tjiClvJjw");
const scoreSortButton = document.getElementById("87667c19b24f");
const alertText = document.getElementById("RldW9jTkvEKJ9t7ohj2pUw");
const status_colors = {
	"current" : "#23b230",
	"completed" : "#26448f",
	"onhold" : "#f1c83e",
	"dropped" : "#a12f31",
	"planned" : "#c3c3c3"
}

function editItem(event) {
    const id = event.target.parentNode.parentNode.children[2].children[0].alt;

    event.target.parentNode.previousElementSibling.innerHTML = createMenu();
    event.target.parentNode.previousElementSibling.children[0].addEventListener("change", (event) => {
        const arr = Array.from(event.target.children);

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].selected === true) {
                setYesButton(
                    event.target,
                    document.getElementById("ZFreIdeaoUydMMbVK4q5fg"),
                    {
                        id: id,
                        newStatus: arr[i].value,
                        type: event.target.parentNode.previousElementSibling.innerHTML.toLowerCase()
                    }
                );
                alertText.innerHTML = arr[i].innerHTML;
                alertModal.classList.toggle("d-none");
            }
        }
    });
}

function setYesButton(selectform, node, data) {
    const statusBG = selectform.parentNode.parentNode.children[0];
    const entireDiv = selectform.parentNode.parentNode;

    node.addEventListener("click", () => {
        fetch(`${window.location.origin}/editItem`, {  
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ data })
          })
          .then((response) => { console.log(`Response: `, response) })
          .catch((error) => { console.log(`Error: `, error) })
        alertModal.classList.toggle("d-none");
        node.outerHTML = `<button class="btn btn-success" id="ZFreIdeaoUydMMbVK4q5fg">Yes</button>`;

        if (data.newStatus === "delete") {
            entireDiv.outerHTML = "";
            return;
        }

        statusBG.style.backgroundColor = status_colors[ data.newStatus ];
        selectform.disabled = true;
    });
}

function createMenu() {
    return `
    <select class="form-select" id="CF5fHFw7ekmcDo58yqh27A">
        <option selected></option>
        <option value="current">Currently Watching</option>
        <option value="completed">Completed</option>
        <option value="onhold">On Hold</option>
        <option value="dropped">Dropped</option>
        <option value="planned">Plan to Watch</option>
        <option value="delete">💩 Delete</option>
    </select>`;
}

function setup() {
    const arr = Array.from(editButtons);

    for (let i = 0; i < arr.length; i++) {
        arr[i].addEventListener("click", (event) => {
            editItem(event);
        });
    }

    addShowButton.addEventListener("click", () => {
        mainModal.classList.toggle("d-none");
    });

    scoreSortButton.addEventListener("click", handleSortByScore);
}

function handleSortByScore() {
    const url = new URL(window.location.href);
    url.searchParams.set('sort', 'score');

    window.location.href = url;
}

document.addEventListener("DOMContentLoaded", setup);