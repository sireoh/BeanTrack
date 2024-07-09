async function addToList(index) {
    const response = await fetch('http://localhost:3055/api/tvcache');
    const data = await response.json();
    const item = data[index-1]

    console.log(item);

    //Add to server
    const addToServer = await fetch('http://localhost:3055/api/addtoserver', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    });
}

async function addToMovieList(index) {
  const response = await fetch('http://localhost:3055/api/moviecache');
  const data = await response.json();
  const item = data[index-1]

  console.log(item);

  //Add to server
  const addToServer = await fetch('http://localhost:3055/api/addtoserver', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
  });
}