import React from 'react';
import { Router } from "@reach/router";
import Header from '../components/header';
import MakeTable from '../components/maketable';

const MovieListTemplate = ({ id, location }) => {
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search");

  return (
    <main className='container mx-auto'>
      <Header id={id}/>
      <MakeTable type="movie" search={searchQuery} id={id}/>
    </main>
  )
}

const MovieListRouter = () => {
    return (
      <Router basepath='/movielist'>
        <MovieListTemplate path="/:id" />
      </Router>
    );
};

export default MovieListRouter;