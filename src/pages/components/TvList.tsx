import TvItem from "./TvItem";

export default function TvList() {
    return(
        <>
        <div className="text-center w-100 text-white bg-primary p-1">TV SHOWS</div>
        <div className="tv-list">
            <table className="container">
                <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>TV Show Title</th>
                    <th>Rating</th>
                    <th>IMDB</th>
                    <th>Add/Remove</th>
                </tr>
            
                <tr><TvItem /></tr>

            </table>
        </div>
        </>
    );
}