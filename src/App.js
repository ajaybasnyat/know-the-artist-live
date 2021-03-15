import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import Artist from "./Artist";
import Track from "./Track";

const App = () => {
  const [token, setToken] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState([]);
  const [currentArtist, setCurrentArtist] = useState("");
  const [tracks, setTracks] = useState([]);
  const initialRender = useRef(true);
  

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      var artist;
      for (artist in artists) {
      console.log("artist: " + artist.name);
      };
      searchArtist();
    }
  }, [query]);

  useEffect(() => {
    getArtistTracks();
  }, [currentArtist]);

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
        console.log("res: ", data);
        setArtists(data.artists.items);
      },
      function (err) {
        console.error(err);
      }
    );
  };

  const getArtistTracks = async () => {
    spotifyApi.getArtistTopTracks(currentArtist, "US").then(
      function (data) {
        console.log("top tracks: ", data);
        setTracks(data.tracks);
        setArtists([]);
      },
      function (err) {
        console.error(err);
      }
    );
  }

  const updateSearch = (e) => {
    setSearch(e.target.value);
  };

  const getSearch = (e) => {
    e.preventDefault();
    setQuery(search);
  };

  return (
    <div className="App">
      <h1>Know The Artist </h1>
      <form className="search-form" onSubmit={getSearch}>
        <input
          className="search-bar"
          type="text"
          value={search}
          onChange={updateSearch}
        />
        <button className="search-button" type="submit">
          Search
        </button>
      </form>
      {/* map artist data to component props with id, name and images - some artists do not have images, so must check if images exist */}
      {artists.map(artists => (
        <Artist key={artists.id} name={artists.name} 
                image={artists.images.length>0 ? artists.images[1].url : ""}
                onClick={e => {setCurrentArtist(artists.id);
                console.log(currentArtist)}}/>
      ))}
      {tracks.map(tracks => (
        <Track key={tracks.id} title={tracks.name} />
      ))}
    </div>
  );
};

export default App;
