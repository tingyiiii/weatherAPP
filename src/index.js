import React from "react";
import ReactDOM from "react-dom";
import WeatherApp from "./WeatherApp";

function App() {
  return <WeatherApp />;
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);
