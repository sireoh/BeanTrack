import React from 'react'

const StatusFilterRow = ({ id, type }) => {
  return (
    <div className='join flex justify-center'>
        <a href={`/${type}list/${id}`} className="btn btn-outline w-1/6 join-item">All TV</a>
        <a href={`/${type}list/${id}?status=current`} className="btn btn-outline w-1/6 join-item">Currently Watching</a>
        <a href={`/${type}list/${id}?status=completed`} className="btn btn-outline w-1/6 join-item">Completed</a>
        <a href={`/${type}list/${id}?status=onhold`} className="btn btn-outline w-1/6 join-item">On Hold</a>
        <a href={`/${type}list/${id}?status=dropped`} className="btn btn-outline w-1/6 join-item">Dropped</a>
        <a href={`/${type}list/${id}?status=planned`} className="btn btn-outline w-1/6 join-item">Plan to Watch</a>
    </div>
  )
}

export default StatusFilterRow
