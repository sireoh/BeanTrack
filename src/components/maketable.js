import React, { useState, useEffect } from 'react';
import AddButton from './addbutton';

const MakeTable = ({ type }) => {
  const [outputContent, setOutputContent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://corsproxy.io/?' + encodeURIComponent(`https://beantrack.vincef.xyz/ownlist/eo?type=${type}`));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        setOutputContent(buildTable(data));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  function buildTable(data) {
      return (
         <>
            {data.map((item, index) => (
               <table key={index}>
                     <tbody>
                        <tr>
                           <td><img src={item.image} alt={item.id} height="128px" width="auto" /></td>
                           <td><a href={`https://www.imdb.com/title/${item.imdb}/`} target="_blank" rel="noopener noreferrer">{item.title}</a></td>
                           <td><p>{item.score}</p></td>
                        </tr>
                     </tbody>
               </table>
            ))}
         </>
   );
  }

  return (
    <>
      <AddButton />
      {outputContent}
    </>
  );
};

export default MakeTable;
