import TvList from "./TvList";
import useFetch from "./useFetch";

function Main() {
  const { data, isPending, error } = useFetch("/api");
  
  return (
    <div className="main">
      <h1>TV Shows</h1>
      { error && <p>{ error }</p> }
      { isPending && <p>Loading ... </p> }
      { data && < TvList data={ data } /> }
    </div>
  );
}

export default Main;
