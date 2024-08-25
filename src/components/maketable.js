import React, { useState, useEffect } from 'react';
import AddButton from './addbutton';
import EditButton from './editbutton';
import SearchList from './searchlist';
import StatusFilterRow from './statusfilterrow';

const statusColors = {
	"current" : "#23b230",
	"completed" : "#26448f",
	"onhold" : "#f1c83e",
	"dropped" : "#a12f31",
	"planned" : "#c3c3c3"
}

function compareTitle(a, b) {
  if ( a.title < b.title ){
      return -1;
    }
    if ( a.title > b.title ){
      return 1;
    }
    return 0;
}

function compareStatus(a, b) {
  const statusOrder = {
      current: 1,
      completed: 2,
      onhold: 3,
      dropped: 4,
      planned: 5
  }

  return statusOrder[a.status] - statusOrder[b.status];
}

const MakeTable = ({ type, id, search, status }) => {
  const [outputContent, setOutputContent] = useState(null);
  // const [currentClientData, setCurrentClientData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://corsproxy.io/?' + encodeURIComponent(`https://beantrack.vincef.xyz/ownlist/${id}?type=${type}`));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const alphabeticalData = data.sort( compareTitle );
        const dataByStatus = alphabeticalData.sort( compareStatus );
        let currentData = dataByStatus;

        //Filters
        if (search && search !== "") {
          currentData = dataByStatus.filter((item) => {
            return item.title.toLowerCase().startsWith(search.toLowerCase()) || item.title.toLowerCase() === search.toLowerCase();
          });
        }        

        if (status && status !== "") {
          currentData = dataByStatus.filter((item) => {
            return item.status === status;
          });
        }

        setOutputContent(buildTable(currentData));
        // setCurrentClientData(currentData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   console.log(currentClientData);
  // }, [currentClientData]);

  function buildTable(data) {
    return (
        <>
          <table className='table-fixed w-full'>
            <thead>
              <tr className='border-b-2 border-gray-800'>
                <th className='w-min pe-2'></th>
                <th className='w-min ps-5 pe-5'>#</th>
                <th className='w-1/12'>Image</th>
                <th className='text-left ps-3'>Name</th>
                <th className='w-min'>Score</th>
                <th className='w-2/12'></th>
                <th className='w-1/12'></th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className='hover:bg-gray-600 border-b-2 border-gray-800'>
                  <td style={{backgroundColor: statusColors[item.status]}}></td>
                  <td className='text-center'>{index+1}</td>
                  <td><img src={item.image} alt={item.id} height="128px" width="180" /></td>
                  <td className='ps-3 text-xl font-bold'><a href={`https://www.imdb.com/title/${item.imdb}/`} target="_blank" rel="noopener noreferrer">{item.title}</a></td>
                  <td className='text-center'><p>{item.score}</p></td>
                  <td></td>
                  <td><EditButton id={item.id} status={item.status} title={item.title} imdb={item.imdb} type={item.type}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
    );
  }

  return (
    <>
      <AddButton />
      <StatusFilterRow type={type} id={id}/>
      <SearchList id={id}/>
      {outputContent}
    </>
  );
};

export default MakeTable;
