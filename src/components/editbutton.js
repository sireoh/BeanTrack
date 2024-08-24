import React, { useState, useRef } from 'react';

const EditButton = ({ id, status, title, imdb, type }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);

  function handleCreateModal(event) {
    const obj = {
        statusNode: event.target.parentNode.parentNode.children[0],
        entireNode: event.target.parentNode.parentNode
    };

    setIsModalOpen(true);
    setCurrentItem(obj);
  };

  function handleCloseModal() {
    setIsModalOpen(false);
  };

  function handleSubmit() {
    console.log(id, type, currentStatus, currentItem.statusNode);
    handleCloseModal();
}

function handleDelete() {
    console.log(id, type, currentStatus, currentItem.entireNode);
    handleCloseModal();
}

function handleSetCurrentStatus(event) {
    setCurrentStatus(event.target.value);
}

  return (
    <>
    {isModalOpen && (
        <dialog className="modal modal-open">
            <div className="modal-box grid text-center">
                <a href={`https://www.imdb.com/title/${imdb}/`} className='text-3xl font-bold pb-5'>{title}</a>
                <div className='pb-10 border-b-2 border-gray-600'>
                    <select className="select select-bordered w-full" onChange={handleSetCurrentStatus}>
                        <option value="current">Currently Watching</option>
                        <option value="completed">Completed</option>
                        <option value="onhold">On Hold</option>
                        <option value="dropped">Dropped</option>
                        <option value="planned">Plan to Watch</option>
                    </select>
                </div>
                <div className="join justify-center pt-6">
                    <button className="btn btn-success join-item" onClick={handleSubmit}>Submit</button>
                    <button className="btn btn-error join-item" onClick={handleDelete}>Delete</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={handleCloseModal}/>
            </form>
        </dialog>
    )}
      <button className='btn btn-link' onClick={handleCreateModal}>Edit</button>
    </>
  );
};

export default EditButton;
