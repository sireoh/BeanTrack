import React from 'react'
import AddModalSearchBar from './addmodalsearchbar';

const AddModal = () => {
  const closeButton = (
    <form method="dialog">
      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
  );

  return (
    <dialog id="Wt8FtOge" className="modal">
      <div className="modal-box w-11/12 max-w-7xl relative">
        {closeButton}
        <AddModalSearchBar />
      </div>
    </dialog>
  );
}

export default AddModal
