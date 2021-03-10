import logo from './logo.svg';
import './App.css';
import React from "react"

const App = () => {
  const CLIENT_ID = "02c458fbde8b405ca33a9ce698c989e3";
  const CLIENT_SECRET = "c29d45caaf114e9b9fcad204dd174aea";
  var Spotify = require('spotify-web-api-js');
  var s = new Spotify();
  var spotifyApi = new SpotifyWebApi();
  const result = await fetch('https://accounts.spotify.com/api/token'), {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Authorization' : 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
    },
    body: 'grant_type=client_credentials'
  });
  const data = await result.json();
  token = data.access_token

  return (
    <div className="App">
      <h1>Hello </h1>
    </div>
    console.log(data);
  )
}

export default App;
