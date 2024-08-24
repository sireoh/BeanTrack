import React from 'react'
const authenticated = 1;
const username = "eo";

const Navbar = () => {
  let content;

  if (authenticated) {
    content = (
        <>
            <p className="m-auto p-3 rounded-none cursor-default">Hello <span className="font-bold">{username}</span>!</p>
            <li><a href={"/tvlist"} className="btn btn-primary rounded-none">TV List</a></li>
            <li><a href={"/movielist"} className="btn btn-primary rounded-none">Movie List</a></li>
            <li><a href="/logout" className="btn btn-error rounded-none">Logout</a></li>
        </>
    );
  } else {
    content = (
        <>
            <li><a href="/login" className="btn btn-dark rounded-0">Login</a></li>
            <li><a href="/signup" className="btn btn-secondary rounded-none">Sign Up</a></li>
        </>
    );
  }

  return (
    <div className="navbar p-0">
        <div className="flex-1"><a href="/" className="font-bold text-lg">🍐 BeanTrack</a></div>
        <div className="flex-none"><ul className="menu menu-horizontal">{content}</ul></div>
    </div>
  )
}

export default Navbar