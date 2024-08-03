import React from 'react'

function TvList({ data }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Rating</th>
          <th>Status</th>
          <th>Remove</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, i) => (
          <tr key={i}>
            <td>{item.title}</td>
            <td>{item.rating}</td>
            <td>{item.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
  
}

export default TvList
