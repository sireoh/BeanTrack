import React from 'react'

function Navbar() {
  return (
    <header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
        <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto ms-3 link-body-emphasis text-decoration-none">
            <i className="bi-alarm me-2"></i>
            <span className="fs-4">BeanTvList</span>
        </a>

        <ul className="nav nav-pills">
            <li className="nav-item"><a href="/" className="nav-link active" aria-current="page">Home</a></li>
            <li className="nav-item"><a href="/profile" className="nav-link">Profile</a></li>
        </ul>
    </header>
  )
}

export default Navbar
