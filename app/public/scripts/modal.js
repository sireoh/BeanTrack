const closeButton = document.getElementById("gSPgxfT1gEmsaW1oDiiFXw");
const modal = document.getElementById("ogJCheREvEanzp9ff7DP9Q");
const typeToggle = document.getElementById("sBthW1RpFUy70uMUe8pfNQ");
const searchButton = document.getElementById("v4GHrhIRr0WfIPjsPMjCbQ");
const resultPreview = document.getElementById("KErxjUJ1BUaXmJd7acF0TA");
let currentType = "TV";
let localData = [];

function addInitEvents() {
  closeButton.addEventListener("click", () => {
    modal.classList.toggle("d-none");
  });

  typeToggle.addEventListener("click", (event) => {
    const children = Array.from(event.target.parentNode.children);

    children.forEach((child) => {
      if (child.classList.contains("btn-dark")) {
        child.classList.replace("btn-dark", "btn-outline-secondary");
        currentType = "TV";
      } else {
        child.classList.replace("btn-outline-secondary", "btn-dark");
        currentType = "Movie";
      }
    });
  });
}

function createTable(data) {
  let str = "";
  localData = [];
  for (let i = 0; i < data.length; i++) {
    const img = data[i].show.image ? data[i].show.image.medium : "";

    try {
      str += `
      <table class="text-center w-100">
        <tr>`;

      str += `
          <td class="col-md-1"><img src="${img}" alt="${data[i].show.id}" height="128px" width="auto"/></td>
          <td class="me-auto fw-bold text-decoration-none fs-5"><a href="https://www.imdb.com/title/${data[i].show.externals.imdb}/" target="_blank">${data[i].show.name}</a></td>
          <td class=""><div>${data[i].show.rating.average}</div></td>
          <td class="col-md-3">
            <select class="form-select" id="CF5fHFw7ekmcDo58yqh27A${i}">
              <option value="completed" selected>Completed</option>
              <option value="planned">Plan to Watch</option>
              <option value="current">Currently Watching</option>
            </select>
          </td>
          <td class="col-md-1"><button class="btn btn-primary" onclick="Add(${i})">Add</button></td>`;

      str += `
        </tr>
      </table>`;

      localData.push({
        "id" : data[i].show.id,
        "status" : "",
        "image" : img,
        "title" : data[i].show.name,
        "imdb" : data[i].show.externals.imdb,
        "score" : data[i].show.rating.average,
        "type" : currentType
      });
      resultPreview.innerHTML = str;
    } catch (error) {
        console.error("Error: ", error);
    }
  }
}

function Add(i) {
  localData[i].status = getStatus(i);
  postData(localData[i]);
}

function getStatus(i) {
  const form = document.getElementById(`CF5fHFw7ekmcDo58yqh27A${i}`);
  const arr = Array.from(form.children);

  for (let j = 0; j < arr.length; j++) {
    if (arr[j].selected) {
      return arr[j].value;
    }
  }

  return arr[1].selected;
}

function postData(data) {
  fetch('http://localhost:3000/addShow', {  
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ data })
  })
  .then((response) => { console.log(`Response: `, response) })
  .catch((error) => { console.log(`Error: `, error) })
}

async function searchFn(event) {
  const search = event.target.previousElementSibling.value;

  await fetch(`https://api.tvmaze.com/search/shows?q=${search}`)
    .then((res) => res.json())
    .then((data) => { createTable(data) });
}

function setup() {
  addInitEvents();

  searchButton.addEventListener("click", (event) => {
    searchFn(event);
  });
}

//Load Setup
document.addEventListener("DOMContentLoaded", setup());