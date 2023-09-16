import { useEffect, useState } from "react";
import {
  SearchOutline,
  PlayCircle,
  ChevronForwardOutline,
  Heart,
  LogoFacebook,
  LogoInstagram,
  LogoTwitter,
  LogoYoutube,
  CloseCircle,
} from "react-ionicons";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzMTE2NjliY2QzNjdkZWZlY2E1NjU4NzZkYWMxZmMwMSIsInN1YiI6IjY1MDA5YTMzZTBjYTdmMDEyZWI4Y2QyNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.xKQQFw2xXYGaj1hjtL5ItluDouXcZe3v-qSNSXajkiw",
  },
};

function App() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchedMovies, setSearchedMovies] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [curSearch, setCurSearch] = useState(false);
  const [movieToPreview, setMovieToPreview] = useState("");
  const [movieId, setMovieId] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewErrMsg, setPreviewErrMsg] = useState("");
  const [previewTheMovie, setPreviewTheMovie] = useState(true);
  const [theMovieObj, setTheMovieObj] = useState({});

  console.log(movieToPreview);

  useEffect(
    function () {
      async function getMovieId() {
        try {
          const url = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/external_ids`,
            options
          );
          const id = await url.json();
          setMovieToPreview(id.imdb_id);
        } catch (err) {
          console.log(err.message);
        }
      }
      getMovieId();
    },
    [movieId]
  );

  //

  useEffect(
    function () {
      async function getOneMovie() {
        try {
          setPreviewLoading(true);
          setPreviewErrMsg("");
          const res = await fetch(
            `https://api.themoviedb.org/3/find/${movieToPreview}?external_source=imdb_id`,
            options
          );
          if (!res.ok) throw new Error("Something went wrong");
          const data = await res.json();
          if (data.movie_results.length < 1)
            throw new Error("Error getting movie");
          setTheMovieObj(data.movie_results[0]);
          setPreviewErrMsg("");
        } catch (err) {
          setPreviewErrMsg(err.message);
        } finally {
          setPreviewLoading(false);
        }
      }
      getOneMovie();
    },
    [movieToPreview]
  );

  //

  useEffect(
    function () {
      const controller = new AbortController();
      async function getSearchedMovie() {
        try {
          setIsLoading(true);
          setErrMsg("");
          //const url = 'https://api.themoviedb.org/3/search/movie?query=barbie&include_adult=false&language=en-US&page=1';
          const res = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`,
            { signal: controller.signal, ...options }
          );

          if (!res.ok) throw new Error("Something went wrong");
          const data = await res.json();
          if (data.results.length === 0) throw new Error("Movie not found!");
          setSearchedMovies(data.results);
          setErrMsg("");
        } catch (err) {
          if (err !== "AbortError") {
            setErrMsg(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length >= 3) {
        getSearchedMovie();
        setCurSearch(true);
      } else {
        setCurSearch(false);
      }

      return () => controller.abort();
    },
    [query]
  );

  return (
    <div>
      <Header>
        <Nav>
          <SearchBar query={query} onQuery={setQuery} />
        </Nav>
      </Header>
      {previewTheMovie === true && (
        <>
          {curSearch ? (
            <SearchedMovieSection
              isLoading={isLoading}
              errMsg={errMsg}
              searchedMovies={searchedMovies}
              onMovieId={setMovieId}
              onPreviewTheMovie={setPreviewTheMovie}
            />
          ) : (
            <FeaturedMoviesSection
              onMovieId={setMovieId}
              onPreviewTheMovie={setPreviewTheMovie}
            />
          )}
        </>
      )}
      {!previewTheMovie && (
        <>
          {previewLoading ? (
            <Loading />
          ) : previewErrMsg ? (
            <ShowError errMsg={previewErrMsg} />
          ) : (
            <PreviewMovie
              onPreviewTheMovie={setPreviewTheMovie}
              year={theMovieObj.release_date.slice(0, 4)}
              title={theMovieObj.original_title}
              image={theMovieObj.backdrop_path}
              rating={theMovieObj.vote_average.toFixed(1)}
              num_ratings={theMovieObj.vote_count}
              summary={theMovieObj.overview}
              key={theMovieObj.id}
            />
          )}
        </>
      )}
      <Footer />
    </div>
  );
}

function PreviewMovie({
  onPreviewTheMovie,
  title,
  year,
  image,
  rating,
  num_ratings,
  summary,
}) {
  return (
    <section className="previewmoviescontainer">
      <CloseCircle
        color={"#00000"}
        title={"close btn"}
        height="25px"
        width="25px"
        className="sclosebtnp"
        onClick={() => onPreviewTheMovie(true)}
      />
      <div className="previewmoviediv">
        <img
          src={`https://image.tmdb.org/t/p/original${image}`}
          alt={`${title}`}
        />
        <OneMovieRate
          title={title}
          year={year}
          rating={rating}
          num_ratings={num_ratings}
        />
        <OneMovieDetails summary={summary} />
      </div>
    </section>
  );
}

function OneMovieRate({ title, year, rating, num_ratings }) {
  return (
    <div className="sifm">
      <p className="mnrtg">
        <span>{title}</span> <strong>-</strong> <span>{year}</span>
        <strong> - </strong>
        <span>PG-13</span>
        <strong> - </strong>
        <span>2h 13m</span>
        <span> </span>
        <span className="pspan">Action</span>
        <span> </span>
        <span className="pspan">Drama</span>
      </p>

      <p className="ratingss">
        <span>⭐️</span>
        <span> </span>
        <span>{rating}</span>
        <span> </span>
        <span>|</span>
        <span> </span>
        <span>{num_ratings}</span>
      </p>
    </div>
  );
}

function OneMovieDetails({ summary }) {
  return (
    <div>
      <p className="sdws">{summary}</p>
      <p className="sdws">
        <span>Director : </span> <span className="gmr">Joseph Kosinki</span>
      </p>
      <p className="sdws">
        <span>Writers : </span>{" "}
        <span className="gmr">Jim Cash, Jack Epps Jr, Peter Craig</span>
      </p>
      <p className="sdws">
        <span>Stars : </span>{" "}
        <span className="gmr">
          Tom Cruise, Jennifer Cornnelly, Miles Teller
        </span>
      </p>
    </div>
  );
}

function SearchedMovieSection({
  isLoading,
  errMsg,
  searchedMovies,
  onMovieId,
  onPreviewTheMovie,
}) {
  return (
    <section className="fmSection">
      <FeaturedMoviesSectionTitle headerTitle={"Searched Movie"} />
      {isLoading ? (
        <Loading />
      ) : errMsg ? (
        <ShowError errMsg={errMsg} />
      ) : (
        <div className="tmoviesContainer">
          {searchedMovies.map((movie) => (
            <MoviePreview
              title={movie.title}
              year={movie.release_date.slice(0, 4)}
              rating={(+movie.vote_average * 10).toFixed(2)}
              posterImg={movie.poster_path}
              key={movie.id}
              onMovieId={onMovieId}
              movieId={movie.id}
              onPreviewTheMovie={onPreviewTheMovie}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Header({ children }) {
  const [headerMovie, setHeaderMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(function () {
    async function getHeaderMovie() {
      try {
        setIsLoading(true);
        setErrMsg("");
        const res = await fetch(
          "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1",
          options
        );

        if (!res.ok) throw new Error("Something went wrong");

        const data = await res.json();

        setHeaderMovie(data.results[0]);
        setErrMsg("");
      } catch (err) {
        console.log(err.message);
        setErrMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    getHeaderMovie();
  }, []);

  return (
    <>
      {children}
      {isLoading ? (
        <Loading color={"#000"} />
      ) : errMsg ? (
        <ShowError errMsg={errMsg} />
      ) : (
        <header
          className="header"
          style={{
            backgroundImage: `url(${`https://image.tmdb.org/t/p/original${headerMovie.backdrop_path}`})`,
          }}
        >
          <MovieAD headerMovie={headerMovie} />
        </header>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footerLogos">
        <LogoFacebook
          color={"#00000"}
          height="25px"
          width="25px"
          title={"Facebook Logo"}
        />
        <LogoInstagram
          color={"#00000"}
          title={"Instagram icon"}
          height="25px"
          width="25px"
        />
        <LogoTwitter
          color={"#00000"}
          title={"Twitter logo icon"}
          height="25px"
          width="25px"
        />
        <LogoYoutube
          color={"#00000"}
          title={"Youtube logo icon"}
          height="25px"
          width="25px"
        />
      </div>
      <div className="coupppr">
        <p>Conditions of Use</p>
        <p>Privacy & Policy</p>
        <p>Press Room</p>
      </div>
      <div>
        <p className="cr">c 2023 by chibuike</p>
      </div>
    </footer>
  );
}

function FeaturedMoviesSection({ onMovieId, onPreviewTheMovie }) {
  const [featureMovies, setFeaturedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    async function getFeaturedMovies() {
      try {
        setIsLoading(true);
        const res = await fetch(
          "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1",
          options
        );

        if (!res.ok) throw new Error("Error fetching movie");

        const data = await res.json();
        // console.log(data);
        setFeaturedMovies(data.results.slice(0, 10));
      } catch (err) {
        setShowError(true);
        setErrMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    getFeaturedMovies();
  }, []);

  return (
    <section className="fmSection">
      <FeaturedMoviesSectionTitle />
      {isLoading ? (
        <Loading />
      ) : showError ? (
        <ShowError errMsg={errMsg} />
      ) : (
        <div className="tmoviesContainer">
          {featureMovies.map((movie) => (
            <MoviePreview
              title={movie.title}
              year={movie.release_date.slice(0, 4)}
              rating={(+movie.vote_average * 10).toFixed(2)}
              posterImg={movie.poster_path}
              key={movie.id}
              movieId={movie.id}
              onMovieId={onMovieId}
              onPreviewTheMovie={onPreviewTheMovie}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ShowError({ errMsg }) {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "50px" }}>
      <h6 style={{ fontSize: "40px", textAlign: "center" }}>
        ⛔️ oops {errMsg}
      </h6>
    </div>
  );
}

function Loading({ color = "#000" }) {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "50px" }}>
      <h6 style={{ fontSize: "40px", textAlign: "center", color }}>
        Loading...
      </h6>
    </div>
  );
}

function MoviePreview({
  year,
  title,
  rating,
  posterImg,
  onMovieId,
  movieId,
  onPreviewTheMovie,
}) {
  return (
    <div
      className="tmovies"
      onClick={() => {
        onMovieId(movieId);
        onPreviewTheMovie(false);
      }}
    >
      <figure className="moviefig">
        <img
          src={`https://image.tmdb.org/t/p/original${posterImg}`}
          alt={`title`}
        />
      </figure>
      <p className="mcy">USA, {year}</p>
      <h6 className="mt">{title}</h6>
      <LogosContainer color={"#000"} maxWidth={"300px"} rating={rating} />
      <Heart
        color={"#fff"}
        height="35px"
        width="35px"
        className="likefav"
        title={"Like Icon"}
      />
      {/* <p className="tvseries">TV SERIES</p> */}
      <p className="mcy">Action, Adventure, Horror</p>
    </div>
  );
}

function FeaturedMoviesSectionTitle({ headerTitle = "Featured Movie" }) {
  return (
    <div className="fmsm">
      <h6 className="featuredMovie">{headerTitle}</h6>
      <div className="smicon">
        <p>See more</p>
        <ChevronForwardOutline
          color={"#c92a2a"}
          height="15px"
          width="15px"
          title={"Forward icon"}
        />
      </div>
    </div>
  );
}

function MovieAD({ headerMovie }) {
  return (
    <div className="movieDets">
      <h5 className="movieName">{headerMovie.original_title}</h5>
      <LogosContainer rating={(+headerMovie.vote_average * 10).toFixed(2)} />
      <p className="movieSummary">{headerMovie.overview}</p>
      <button className="watch-btn">
        <PlayCircle
          style={{ display: "inline-block", alignSelf: "flex-end" }}
          color={"#fff"}
          height="20px"
          width="20px"
          title={"Play Icon"}
        />

        <p>Watch Trailer</p>
      </button>
    </div>
  );
}

function LogosContainer({ color = "#fff", maxWidth = "200px", rating }) {
  return (
    <div style={{ maxWidth }} className="logosContainer">
      <figure>
        <img
          src="/IMDB_Logo_2016.svg.png"
          // className="imdbimg"
          style={{ width: "30px" }}
          alt="imdb logo"
        />
        <span style={{ color }}>{rating || 86.0}/100</span>
      </figure>
      <figure>
        <img
          src="/rtomato.png"
          // className="rtomatoimg"
          alt="imdb logo"
          style={{ width: "20px" }}
        />
        <span style={{ color }}>{rating || 97}%</span>
      </figure>
    </div>
  );
}

function Nav({ children }) {
  return (
    <nav className="nav">
      <div className="navdiv">
        <p className="movieBoxTitle">🎥 MovieBox</p>
        {children}
        <div>
          <p className="signin">Sign in</p>
        </div>
      </div>
    </nav>
  );
}

function SearchBar({ query, onQuery }) {
  return (
    <div className="searchboxContainer">
      <input
        placeholder="What do you want to watch? "
        className="searchMovies"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
      <SearchOutline
        color={"#fff"}
        height="15px"
        width="15px"
        title={"search icon"}
      />
    </div>
  );
}

// 311669bcd367defeca565876dac1fc01

export default App;
