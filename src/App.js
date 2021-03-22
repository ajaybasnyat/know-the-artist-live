import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Artist from "./Artist";
import shuffle from "shuffle-array";
require("dotenv").config();

// application
const App = () => {
  // token for api access
  const [token, setToken] = useState("");
  // search bar input
  const [search, setSearch] = useState("");
  // query string for api
  const [query, setQuery] = useState("");
  // artists returned on user search
  const [artists, setArtists] = useState([]);
  // current artist user selects
  const [currentArtist, setCurrentArtist] = useState("");
  // tracks of the artist
  const [tracks, setTracks] = useState([]);
  // the tracks in correct popularity order
  const [orderedTracks, setOrderedTracks] = useState([]);
  // boolean when to show submit button
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  // boolean when to show results
  const [renderResults, setRenderResults] = useState(false);
  // artists related to current artist
  const [relatedArtists, setRelatedArtists] = useState([]);
  // correct number of user guesses
  const [numCorrectTracks, setNumCorrectTracks] = useState(0);
  // mark initial render when app first runs
  const initialRender = useRef(true);
  // create var from spotify-web-api-js wrapper class that manages api
  var spotifyApi = new SpotifyWebApi();

  // get api access token on first render
  useEffect(() => {
    getToken();
  }, []);

  // use effect, updates whenever current artist is changed
  useEffect(() => {
    // if not first render
    if (!initialRender.current) {
      // get the artist top tracks
      getArtistTracks();
      // show submit button
      setShowSubmitButton(true);
      // get related artists
      getRelatedArtists();
      // render results
      setRenderResults(false);
    }
  }, [currentArtist]);

  // use effect whenever user searches
  useEffect(() => {
    // if its the first render, do nothing but set intialrender to false
    if (initialRender.current) {
      initialRender.current = false;
    } else {  
      // search for the artist
      searchArtist();
      // set render results
      setRenderResults(false);
      setShowSubmitButton(false);
      // reset tracks
      setTracks([]);
      // reset ordered tracks
      setOrderedTracks([]);
    }
  }, [query]);

  // method to get token for api access
  const getToken = async () => {
    // get client id and secret from environmental vars
    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
    const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;

    // fetch token from api
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
      },
      body: "grant_type=client_credentials",
    });
    // get res and set as token
    const data = await result.json();
    setToken(data.access_token);
  };

  // set token to wrapper class object
  spotifyApi.setAccessToken(token);

  // method to search for artists
  const searchArtist = async () => {
    spotifyApi.searchArtists(query).then(
      function (data) {
        // set all artists from res
        setArtists(data.artists.items);
      },
      function (err) {
        console.error(err);
      }
    );
  };

  // method to get artists related to the current artist
  const getRelatedArtists = async () => {
    spotifyApi.getArtistRelatedArtists(currentArtist).then(
      function (data) {
        // set the first 5 related artists
        setRelatedArtists(data.artists.slice(0, 5));
      },
      function (err) {
        console.error(err);
      }
    );
  };

  // method to get an artists top tracks
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

  // method to update search state from input
  const updateSearch = (e) => {
    setSearch(e.target.value);
  };

  // method to update query state and reset input field on search
  const getSearch = (e) => {
    e.preventDefault();
    setQuery(search);
    setSearch('');
  };

  // func to handle dragging tracks when arranging them 
  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTracks(items);
  }

  // func to handle when submit button is clicked
  function onSubmit() {
    // create count var for tracking how many correct guesses user has
    var count = 0;
    // loop through tracks
    tracks.forEach(function (track, i) {
      // if track was in correct position
      if (track == orderedTracks[i]) {
        // increase count
        count++;
        // add 'correct' attribute to tracks for addressing their classes in JSX
        orderedTracks[i].correct = true;
        tracks[i].correct = true;
      }
      else {
        tracks[i].correct = false;
      }
    });
    // reset and render results
    setShowSubmitButton(false);
    setRenderResults(true);
    setNumCorrectTracks(count);
  }

  const getItemStyle = (isDragging, draggableStyle) => ({
    // change background colour if dragging
    background: isDragging ? "MediumSeaGreen" : "#242424",
  
    // styles we need to apply on draggables
    ...draggableStyle
  });

  // return JSX
  return (
    <div className="App">
      <h1>Know The Artist</h1>
      <p>Search an artist and try to arrange their top five tracks from most to least popular</p> 
      
      <form className="search-form" onSubmit={getSearch}>
        <input
          className="search-bar"
          type="text"
          value={search}
          onChange={updateSearch}
        />
        <button className="btn" type="submit"> Search </button>
      </form>
      {/* map artist data to component props with id, name and images - some artists do not have images, so must check if images exist */}
      {artists.map((artists) => (
        <Artist
          key={artists.id}
          name={artists.name}
          image={artists.images.length > 0 ? artists.images[1].url : ""}
          // when an artist is clicked, set them as current artist
          onClick={(e) => {
            setCurrentArtist(artists.id);
          }}
        />
      ))}
      {/* using Beautiful DND library, drag and drop to handle user arranging tracks */}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="tracks">
          {(provided) => (
            <ol
              className="tracks"
              {...provided.droppableProps}
              ref={provided.innerRef}
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
                        <h3 id='track-name' className={(tracks.correct && renderResults) ? 'correctTrack' : (!tracks.correct && renderResults) ? 'incorrectTrack' : ''}>{tracks.name}</h3>
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
      {/* render results if applicable */}
      {renderResults ? (
        <div>
          <h2>Your score: {numCorrectTracks} / 5 </h2>
          <h2 className='correct-order-h2'>Correct Order: </h2>
          <ol className="orderedTracks">
            {/* map through ordered tracks to show correct order */}
            {orderedTracks.map((orderedTracks) => {
              return (
              <li key={orderedTracks.id}>
                <h3 className={orderedTracks.correct ? 'correctTrack' : 'incorrectTrack'}>{orderedTracks.name}</h3>
              </li>
              )
            })}
          </ol>
          <h2 className='related-artists-h2'>Related Artists</h2>
          {/* map related artists so user can quickly start with a different artist */}
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
