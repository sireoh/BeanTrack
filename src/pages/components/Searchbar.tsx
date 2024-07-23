export default function Searchbar() {
    return (
        <form action="/searching" method="post">
            <input name="search" type="text"/>
            <button>Search!</button>
            <a href="/">Reset</a>
        </form>
    );
}