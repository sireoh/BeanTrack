import React from 'react'
import AddModalSearchBar from './addmodalsearchbar';

const AddModal = ({ data }) => {
  const closeButton = (
    <form method="dialog" className="modal-backdrop">
      <button />
    </form>
  );

  return (
    <dialog id="Wt8FtOge" className="modal">
      <div className="modal-box w-11/12 max-w-7xl relative">
        <AddModalSearchBar TVOwnList={data}/>
      </div>
      {closeButton}
    </dialog>
  );
}

export default AddModal
