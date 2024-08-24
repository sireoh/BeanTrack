import React, { useRef, useState } from 'react';

const AddModalSearchBar = () => {
  const [currentType, setCurrentType] = useState(0);
  const searchInputBox = useRef(null);
  const [outputContent, setOutputContent] = useState(null);

  const types = ["TV", "MOVIES"];
  const OMDB_KEY = "b05a38fc";

  function handleOutputContent(search, type, data) {
    console.log(search);
    if (type == 0) {
        setOutputContent(outputTV(data));
    } else {
        setOutputContent(outputMovie(data));
    }
  }

  function outputTV(data) {
    if (data.Error) {
      console.log(data.Error);
      return (
        <>
          <div className='text-center'>{data.Error} ... 🦗</div>
        </>
      );
    }

    return (
        <>
          <table className='table-fixed w-full'>
            <thead>
              <tr>
                <th className='w-1/12'>Image</th>
                <th className='text-left ps-3'>Name</th>
                <th className='w-min'>Score</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
              <tr key={index}>
                <td><img src={item.show.image ? item.show.image.medium : ""} alt={item.show.id} height="128px" width="180px" /></td>
                <td className='ps-3 text-xl font-bold'><a href={`https://www.imdb.com/title/${item.show.externals.imdb}/`} target="_blank" rel="noopener noreferrer">{item.show.name}</a></td>
                <td className='text-center'><p>{(item.show.rating.average) ? item.show.rating.average : "-"}</p></td>
              </tr>
              ))}
            </tbody>
          </table>
        </>
    );
  }

  function outputMovie(data) {
    if (data.Error) {
      console.log(data.Error);
      return (
        <>
          <div className='text-center'>{data.Error} ... 🦗</div>
        </>
      );
    }

    return (
        <>
          <table className='table-fixed w-full'>
            <thead>
              <tr>
                <th className='w-1/12'>Image</th>
                <th className='text-left ps-3'>Name</th>
                <th className='w-min'>Score</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
              <tr key={index}>
                <td><img src={item.Poster} alt={item.imdbID.substring(2)} height="128px" width="180px" /></td>
                <td className='ps-3 text-xl font-bold'><a href={`https://www.imdb.com/title/${item.imdbID}/`} target="_blank" rel="noopener noreferrer">{item.Title}</a></td>
                <td className='text-center'>-</td>
              </tr>
              ))}
            </tbody>
          </table>
        </>
    );
  }

  function handleToggle() {
    setCurrentType(prevType => (prevType === 0 ? 1 : 0));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const search = searchInputBox.current.value;
    if (currentType == 0) {
        await fetch(`https://api.tvmaze.com/search/shows?q=${search}`)
        .then((res) => res.json())
        .then((data) => { 
          if (data.length >= 1) {
            handleOutputContent(search, 0, data);
          } else {
            handleOutputContent(search, 0, data={Error: "TV Show not found!"});
          }
         });
      } else if (currentType == 1) {
        const url = `https://www.omdbapi.com/?s=${search}&apikey=${OMDB_KEY}`;
        await fetch(url)
        .then((res) => res.json())
        .then((data) => { 
          if (data.Response == "True") {
            handleOutputContent(search, 1, data.Search)
          } else {
            handleOutputContent(search, 1, data)
          }
         })
        .catch((error) => {
          if (error) {
            console.log("error");
            return;
          }
        })
      } else {
        console.log("No type found.");
      }
  }

  const typeToggle = (
    <div className='flex justify-center'>
        <input
        type="checkbox"
        className="toggle toggle-lg"
        onChange={handleToggle}
        checked={currentType === 1}
      />
      <label className='ms-3 text-lg'>{types[currentType]}</label>
    </div>
  );

  const searchBar = (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="form-control w-full">
        <form className="relative" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search..."
            className="input input-bordered input-lg w-full pr-12"
            ref={searchInputBox}
          />
          <button className="absolute inset-y-0 right-0 flex items-center pr-3" type="submit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 4a7 7 0 014.65 11.39l4.85 4.85a1 1 0 01-1.42 1.42l-4.85-4.85A7 7 0 1111 4z"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      {typeToggle}
      {searchBar}
      <div>{outputContent}</div>
    </div>
  );
};

export default AddModalSearchBar;
