import Searchbar from "./components/Searchbar";
import TvList from "./components/TvList";

export default function Index() {
  return (
    <div className="container">
      <div className="d-grid justify-content-end">
        <a href="/logout">Logout</a>
        <a href="/profile">My List</a>
        <p>Hi eo!</p>
      </div>
      <Searchbar />
      <TvList />
    </div>
  );
}