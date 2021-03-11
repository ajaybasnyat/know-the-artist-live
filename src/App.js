import logo from "./logo.svg";
import "./App.css";
import React from "react";

const APIController = (function () {
  const _getToken = async () => {
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
    return data.access_token;
  };

  return {
    getToken() {
      return _getToken();
    }
  }
})();

const App = () => {
  var token = APIController.getToken()
  console.log(token)
  return (
    <div className="App">
      <h1>Hello </h1>
      <form className="search-form">
        <input className="search-bar" type="text"/>
        <button className="search-button" type="submit">Search</button>
      </form>
    </div>
  );
};

export default App;
