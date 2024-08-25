import React, { useState, useRef } from 'react'

const SearchList = ({ id }) => {
  const [searchResult, setSearchResult] = useState('');
  const timeoutRef = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    console.log(searchResult);
    window.location.href = `/tvlist/${id}?search=${searchResult}`;
  }

  function handleUpdateSearch(event) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log(event.target.value);
      setSearchResult(event.target.value);
    }, 150);
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="form-control w-full">
        <form className="relative" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search..."
            className="input input-bordered input-lg w-full pr-12"
            onChange={handleUpdateSearch}
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
  )
}

export default SearchList
