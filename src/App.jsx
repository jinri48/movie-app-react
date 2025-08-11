import {useEffect, useState} from 'react'
import React from 'react'
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from "react-use";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        authorization: `Bearer ${API_KEY}`,
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [isloading, setIsloading] = useState(false);
    const [debouncedSearch, setdebouncedSearch] = useState('');

    useDebounce(() => setdebouncedSearch(searchTerm), 500, [searchTerm]);
    const fetchMovies = async(query) => {
        setIsloading(true);
        setErrorMessage('');

        try {

            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURI(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by_popularity.desc`;
            // const endpoint = `${API_BASE_URL}/authentication `;
            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

           const data = await response.json();
            if (data.Response === 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([])
                return;
            }

            setMovieList(data.results || []);

        }catch (e) {
            console.error(`Error fetching movies: ${e.error}`);
            setErrorMessage("Error encountered loading movies. Please try again later");
        }finally {
            setIsloading(false);
        }
    }
    // deps to be empty array to only run this once the components load

    useEffect(() => {
        fetchMovies(debouncedSearch)
    }, [debouncedSearch]) // only call the fetch movies whenever there are changes in the search query or term

    return (
        <main>
            <div className="pattern"/>
            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner"/>
                    <h1>Find <span className="text-gradient"> Movies </span> You'll Enjoy Without the Hassle</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>
                <section className="all-movies">
                    <h2 className="mt-[40px]">All Movies</h2>
                    {isloading ? (
                        <Spinner/>

                    ) : errorMessage ? (
                       <p className="text-red-500">{errorMessage}</p>

                    ) : (
                        <ul>
                            {/*{console.log(movieList)}*/}
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie}/>

                            ))}
                        </ul>
                    )}
                </section>
                {/*<h1 className="text-white">{searchTerm}</h1>*/}

            </div>
        </main>

    );
}

export default App
