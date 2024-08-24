import React from 'react'
import Header from '../components/header'
import MakeTable from '../components/maketable'

const movielist = () => {
  return (
    <main className='container mx-auto'>
      <Header />
      <MakeTable type="movie"/>
    </main>
  )
}

export default movielist
