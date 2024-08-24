import React from 'react'
import AddModalSearchBar from './addmodalsearchbar';

const AddModal = () => {
  const closeButton = (
    <form method="dialog" className="modal-backdrop">
      <button />
    </form>
  );

  return (
    <dialog id="Wt8FtOge" className="modal">
      <div className="modal-box w-11/12 max-w-7xl relative">
        <AddModalSearchBar />
      </div>
      {closeButton}
    </dialog>
  );
}

export default AddModal
