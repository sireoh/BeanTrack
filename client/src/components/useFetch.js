import React, { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data.data);
        setIsPending(false);
      })
      .catch((error) => {
        setError(`Error fetching data: ${error}`);
      });
  }, [url])

  return { data, isPending, error };
}

export default useFetch;
