import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Artist from "./Artist";
import shuffle from "shuffle-array";

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
      }
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
        // get top 5 tracks (by default gets top 10 tracks)
        var topTracks = data.tracks.slice(0, 5)
        // randomize order (by default they are returned by popularity)
        shuffle(topTracks)
        // set the tracks
        setTracks(topTracks);
        // clear artist search
        setArtists([]);
      },
      function (err) {
        console.error(err);
      }
    );
  };

  const updateSearch = (e) => {
    setSearch(e.target.value);
  };

  const getSearch = (e) => {
    e.preventDefault();
    setQuery(search);
  };

  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTracks(items);
  }

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
      {artists.map((artists) => (
        <Artist
          key={artists.id}
          name={artists.name}
          image={artists.images.length > 0 ? artists.images[1].url : ""}
          onClick={(e) => {
            setCurrentArtist(artists.id);
            console.log(currentArtist);
          }}
        />
      ))}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="tracks">
          {(provided) => (
            <ul className="tracks" {...provided.droppableProps} ref={provided.innerRef}>
              {tracks.map((tracks, index) => {
                return (
                  <Draggable key={tracks.id} draggableId={tracks.id} index={index}>
                    {(provided) => (
                      <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                       <p>{ tracks.name }</p>
                     </li>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
       </DragDropContext>
       <button>Submit</button>
    </div>
  );
};

export default App;