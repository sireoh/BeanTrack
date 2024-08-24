import React from 'react'
import Header from '../components/header'
import MakeTable from '../components/maketable'

const tvlist = () => {
  return (
    <main className='container mx-auto'>
      <Header />
      <MakeTable type="tv"/>
    </main>
  )
}

export default tvlist