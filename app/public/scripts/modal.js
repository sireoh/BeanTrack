const typeToggle = document.getElementById("sBthW1RpFUy70uMUe8pfNQ");
const searchButton = document.getElementById("v4GHrhIRr0WfIPjsPMjCbQ");
const resultPreview = document.getElementById("KErxjUJ1BUaXmJd7acF0TA");

const OMDB_KEY = "b05a38fc";
let currentType = "TV";
let localData = [];

function initModalEvents() {
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

async function checkOwnListData() {
  const currentURL = window.location.href;
  let id = null;

  if (!currentURL.includes("/tvlist/")) {
    return;
  } else {
    id = currentURL.split("/tvlist/")[1].split("?")[0];
  }

  const url = `http://localhost:3000/ownlist/${id}?type=tv`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

async function createTVTable(data) {
  let local_tvownlist;

  try {
    const temp = await checkOwnListData();
    local_tvownlist = temp;
  } catch (error) {
    console.error("Error:", error);
  }
  console.log(local_tvownlist);

  if (data.length < 1) {
    resultPreview.innerHTML = `
    <div class="text-center mt-3">It's kinda quiet here ... 🦗</div>`;
    return;
  }

  let str = "";
  localData = [];
  for (let i = 0; i < data.length; i++) {
    let found = false;
    const img = data[i].show.image ? data[i].show.image.medium : "";

    try {
      str += `
      <table class="text-center w-100">
        <tr>`;

      str += `
          <td class="col-md-1"><img src="${img}" alt="${data[i].show.id}" height="128px" width="auto"/></td>
          <td class="me-auto fw-bold text-decoration-none fs-5"><a href="https://www.imdb.com/title/${data[i].show.externals.imdb}/" target="_blank">${data[i].show.name}</a></td>
          <td class=""><div>${data[i].show.rating.average}</div></td>`;

      for (let j = 0; j < local_tvownlist.length; j++) {
        if (local_tvownlist[j].imdb == data[i].show.externals.imdb) {
          found = true;
        }
      }

      if (!found) {
        str += `
        <td class="col-md-3">
          <select class="form-select" id="CF5fHFw7ekmcDo58yqh27A${i}">
            <option value="completed" selected>Completed</option>
            <option value="planned">Plan to Watch</option>
            <option value="current">Currently Watching</option>
          </select>
        </td>
        <td class="col-md-1"><button class="btn btn-primary" onclick="AddTV(event, ${i})">Add</button></td>`;
      } else {
        str += `
        <td class="col-md-3"></td>
        <td class="col-md-1"><button class="btn btn-secondary" disabled>Added</button></td>`;
      }

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

function createMovieTable(data) {
  let str = "";
  localData = [];
  for (let i = 0; i < data.length; i++) {
    try {
      str += `
      <table class="text-center w-100">
        <tr>`;

      str += `
          <td class="col-md-1"><img src="${ data[i].Poster }" alt="${ data[i].imdbID.substring(2) }" height="128px" width="auto"/></td>
          <td class="me-auto fw-bold text-decoration-none fs-5"><a href="https://www.imdb.com/title/${ data[i].imdbID }/" target="_blank">${ data[i].Title }</a></td>
          <td class="col-md-3">
            <select class="form-select" id="CF5fHFw7ekmcDo58yqh27A${i}">
              <option value="completed" selected>Completed</option>
              <option value="planned">Plan to Watch</option>
              <option value="current">Currently Watching</option>
            </select>
          </td>
          <td class="col-md-1"><button class="btn btn-primary" onclick="AddMovie(event, ${i})">Add</button></td>`;

      str += `
        </tr>
      </table>`;

      localData.push({
        "id" : data[i].imdbID.substring(3),
        "status" : "",
        "image" : data[i].Poster,
        "title" : data[i].Title,
        "imdb" : data[i].imdbID,
        "score": "",
        "type" : currentType
      });
      resultPreview.innerHTML = str;
    } catch (error) {
        console.error("Error: ", error);
    }
  }
}

function AddTV(event, i) {
  event.target.classList = "btn btn-secondary";
  event.target.disabled = "true";
  event.target.parentNode.previousElementSibling.children[0].disabled = true;

  localData[i].status = getStatus(i);
  postData(localData[i]);
}

async function AddMovie(event, i) {
  event.target.classList = "btn btn-secondary";
  event.target.disabled = true;
  event.target.parentNode.previousElementSibling.children[0].disabled = true;

  localData[i].status = getStatus(i);

  try {
    const rating = await getMovieRating(localData[i].imdb);
    console.log(rating);
    localData[i].score = rating;
  } catch (error) {
    console.error("Error fetching movie rating:", error);
  }

  postMovieData(localData[i]);
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

function postMovieData(data) {
  fetch('http://localhost:3000/addMovie', {  
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ data })
  })
  .then((response) => { console.log(`Response: `, response) })
  .catch((error) => { console.log(`Error: `, error) })
}

async function searchFn(event) {
  event.preventDefault();
  const search = event.target.previousElementSibling.value;

  if (currentType === "TV") {
    await fetch(`https://api.tvmaze.com/search/shows?q=${search}`)
    .then((res) => res.json())
    .then((data) => { createTVTable(data) });
  } else {
    const url = `http://www.omdbapi.com/?s=${search}&apikey=${OMDB_KEY}`;
    await fetch(url)
    .then((res) => res.json())
    .then((data) => { createMovieTable(data.Search) })
    .catch((error) => {
      if (error) {
        resultPreview.innerHTML = `
        <div class="text-center mt-3">It's kinda quiet here ... 🦗</div>`;
        return;
      }
    })
  }
}

async function getMovieRating(imdb) {
  const url = `http://www.omdbapi.com/?i=${imdb}&apikey=${OMDB_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.imdbRating;
  } catch (error) {
    console.error("Error fetching from OMDB API:", error);
    return null;
  }
}

function setupModalEvents() {
  initModalEvents();

  searchButton.addEventListener("click", (event) => {
    searchFn(event);
  });
}

//Load Setup
document.addEventListener("DOMContentLoaded", setupModalEvents());