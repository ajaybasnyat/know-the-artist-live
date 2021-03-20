import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Artist from "./Artist";
import shuffle from "shuffle-array";
require("dotenv").config();

const App = () => {
  const [token, setToken] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState([]);
  const [currentArtist, setCurrentArtist] = useState("");
  const [tracks, setTracks] = useState([]);
  const [orderedTracks, setOrderedTracks] = useState([]);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [renderResults, setRenderResults] = useState(false);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [numCorrectTracks, setNumCorrectTracks] = useState(0);
  const initialRender = useRef(true);

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    if (!initialRender.current) {
      getArtistTracks();
      setShowSubmitButton(true);
      // get related artists
      getRelatedArtists();
      setRenderResults(false);
    }
  }, [currentArtist]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      searchArtist();
      setRenderResults(false);
      setTracks([]);
      setOrderedTracks([]);
    }
  }, [query]);

  const getToken = async () => {
    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
    const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;

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
        setArtists(data.artists.items);
      },
      function (err) {
        console.error(err);
      }
    );
  };

  const getRelatedArtists = async () => {
    spotifyApi.getArtistRelatedArtists(currentArtist).then(
      function (data) {
        setRelatedArtists(data.artists.slice(0, 5));
      },
      function (err) {
        console.error(err);
      }
    );
  };

  const getArtistTracks = async () => {
    spotifyApi.getArtistTopTracks(currentArtist, "US").then(
      function (data) {
        // get top 5 tracks (by default gets top 10 tracks)
        var tracksInOrder = data.tracks.slice(0, 5);
        // update ordered tracks
        setOrderedTracks(tracksInOrder);
        // copy array and randomize order (by default they are returned by popularity)
        var tracksRandomized = [...tracksInOrder];
        shuffle(tracksRandomized);
        // set the tracks
        setTracks(tracksRandomized);
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
    setSearch('');
  };

  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTracks(items);
  }

  function onSubmit() {
    var count = 0;
    tracks.forEach(function (track, i) {
      if (track == orderedTracks[i]) {
        count++;
        orderedTracks[i].correct = true;
        tracks[i].correct = true;
      }
      else {
        tracks[i].correct = false;
      }
    });
    setShowSubmitButton(false);
    setRenderResults(true);
    setNumCorrectTracks(count);
  }

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: 16,
    margin: `0 0 10px 0`,
  
    // change background colour if dragging
    background: isDragging ? "#61dafb" : "grey",
  
    // styles we need to apply on draggables
    ...draggableStyle
  });
  
  const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? "lightblue" : "#242424",
    padding: 8,
    width: 250
  });

  return (
    <div className="App">
      <h1>Know The Artist</h1>
      <form className="search-form" onSubmit={getSearch}>
        <input
          className="search-bar"
          type="text"
          value={search}
          onChange={updateSearch}
        />
        <button className="btn" type="submit">
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
          }}
        />
      ))}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="tracks">
          {(provided, snapshot) => (
            <ol
              className="tracks"
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {tracks.map((tracks, index) => {
                return (
                  <Draggable
                    key={tracks.id}
                    draggableId={tracks.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                        <h3 className={(tracks.correct && renderResults) ? 'correctTrack' : (!tracks.correct && renderResults) ? 'incorrectTrack' : ''}>{tracks.name}</h3>
                      </li>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </ol>
          )}
        </Droppable>
      </DragDropContext>
      {showSubmitButton ? <button className='btn' onClick={onSubmit}>Submit</button> : null}
      {renderResults ? (
        <div>
          <h1>{numCorrectTracks} / 5 correct</h1>
          <h1>Answer: </h1>
          <ol className="orderedTracks">
            {orderedTracks.map((orderedTracks) => {
              return (
              <li key={orderedTracks.id}>
                <h3 className={orderedTracks.correct ? 'correctTrack' : 'incorrectTrack'}>{orderedTracks.name}</h3>
              </li>
              )
            })}
          </ol>
          <h1>Related Artists</h1>
          {relatedArtists.map((relatedArtists) => (
            <Artist
              key={relatedArtists.id}
              name={relatedArtists.name}
              image={
                relatedArtists.images.length > 0
                  ? relatedArtists.images[1].url
                  : ""
              }
              onClick={(e) => {
                setCurrentArtist(relatedArtists.id);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default App;
