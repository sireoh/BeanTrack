import React from 'react'
import AddModal from './addmodal'

const AddButton = () => {
  return (
    <>
        <AddModal />
        <div className='flex justify-end'>
            <button className="btn btn-outline" onClick={()=>document.getElementById('Wt8FtOge').showModal()}>➕ Add</button>
        </div>
    </>
  )
}

export default AddButton
