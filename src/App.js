import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import SpotifyWebApi from "spotify-web-api-js";

const App = () => {
  const [token, setToken] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const initialRender = useRef(true);
  
  useEffect(() => {
    getToken();
  },[]);

  useEffect(() => {
    console.log(initialRender);
    if(initialRender.current) {
      initialRender.current = false;
    }
    else {
      searchArtist();
    }
  }, [query]);

  const getToken = async () => {

    const CLIENT_ID = "02c458fbde8b405ca33a9ce698c989e3";
    const CLIENT_SECRET = "c29d45caaf114e9b9fcad204dd174aea";

    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
      },
      body: "grant_type=client_credentials",
    });
    const data = await result.json();
    setToken(data.access_token);
    return data.access_token;
  };


  var Spotify = require("spotify-web-api-js");
  var spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(token);
  
  const searchArtist = async () => {
    spotifyApi.searchArtists(query).then(
      function (data) {
        console.log('res: ', data);
      },
      function (err) {
        console.error(err);
      }
    )
  }

  const updateSearch = e => {
    setSearch(e.target.value)
    console.log(search)
  }

  const getSearch = e => {
    
    e.preventDefault();
    setQuery(search)
  }

  return (
    <div className="App">
      <h1>Hello </h1>
      <form className="search-form" onSubmit={getSearch}>
        <input className="search-bar" type="text" value={search} onChange={updateSearch}/>
        <button className="search-button" type="submit">
          Search
        </button>
      </form>
    </div>
  );
};

export default App;
