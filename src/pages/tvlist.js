import React from 'react';
import { Router } from "@reach/router";
import Header from '../components/header';
import MakeTable from '../components/maketable';

const TvListTemplate = ({ id, location }) => {
  const params = new URLSearchParams(location.search);

  return (
    <main className='container mx-auto'>
      <Header id={id}/>
      <MakeTable type="tv" search={params.get("search")} status={params.get("status")} id={id}/>
    </main>
  )
}

const TvListRouter = () => {
    return (
      <Router basepath='/tvlist'>
        <TvListTemplate path="/:id" />
      </Router>
    );
};

export default TvListRouter;