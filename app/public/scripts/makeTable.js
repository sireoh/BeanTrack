const editButtons = document.getElementsByClassName("rHdkJvYyW0u1OTH9XOi7nQ");
const addShowButton = document.getElementById("VLTLkGETmEqX7tjiClvJjw");
const alertText = document.getElementById("RldW9jTkvEKJ9t7ohj2pUw");

function editItem(event) {
    const id = event.target.parentNode.parentNode.children[2].children[0].alt;

    event.target.parentNode.previousElementSibling.innerHTML = createMenu();
    event.target.parentNode.previousElementSibling.children[0].addEventListener("change", (event) => {
        const arr = Array.from(event.target.children);

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].selected === true) {
                setYesButton(
                    document.getElementById("ZFreIdeaoUydMMbVK4q5fg"),
                    {
                        id: id,
                        newStatus: arr[i].value
                    }
                );
                alertText.innerHTML = arr[i].innerHTML;
                alertModal.classList.toggle("d-none");
            }
        }
    });
}

function setYesButton(node, data) {
    node.addEventListener("click", () => {
        fetch('http://localhost:3000/editItem', {  
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ data })
          })
          .then((response) => { console.log(`Response: `, response) })
          .catch((error) => { console.log(`Error: `, error) })
        alertModal.classList.toggle("d-none");
        node.outerHTML = `<button class="btn btn-success" id="ZFreIdeaoUydMMbVK4q5fg">Yes</button>`;
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
        modal.classList.toggle("d-none");
    });
}

document.addEventListener("DOMContentLoaded", setup);