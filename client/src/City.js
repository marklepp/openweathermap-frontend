import "./City.css";
import { useState, useEffect } from "react";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "November",
  "December",
];
function dayOrdinal(d) {
  if (d > 3 && d < 21) return "th";
  switch (d % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
function padInt(length, int) {
  let asStr = "" + int;
  while (asStr.length < length) {
    asStr = "0" + asStr;
  }
  return asStr;
}
function toMonthAndDay(date) {
  let output = "";
  output += months[date.getMonth()] + " ";
  let dayOfMonth = date.getDate() + 1;
  output += dayOfMonth + dayOrdinal(dayOfMonth);
  return output;
}
function toTimeOfDay(date) {
  return padInt(2, date.getHours()) + ":" + padInt(2, date.getMinutes());
}
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function City({ cityName }) {
  const [current, setCurrent] = useState({
    weather: [{ description: "Loading...", icon: "01d" }],
    main: { temp: 0, humidity: 0 },
    wind: { speed: 0 },
    precipitation: { "3h": 0 },
    dt: 0,
  });
  const [forecast, setForecast] = useState({
    list: [1, 2, 3, 4, 5, 6].map((i) => {
      return {
        weather: [{ description: "Loading...", icon: "01d" }],
        main: { temp: 0, humidity: 0 },
        wind: { speed: 0 },
        dt: 0,
        precipitation: { "3h": 0 },
      };
    }),
  });
  console.log(current);
  console.log(forecast);
  useEffect(
    function updateCurrent() {
      fetch("/api/current", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "error",
        body: JSON.stringify({ cityName }),
      })
        .then((res) => {
          if (res.status !== 200) {
            return undefined;
          }
          return res.json();
        })
        .then((data) => {
          if (data) setCurrent(data);
        });
    },
    [cityName]
  );
  useEffect(
    function updateForecast() {
      fetch("/api/forecast", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "error",
        body: JSON.stringify({ cityName }),
      })
        .then((res) => {
          if (res.status !== 200) {
            return undefined;
          }
          return res.json();
        })
        .then((data) => {
          if (data) setForecast(data);
        });
    },
    [cityName]
  );
  return (
    <div className="City">
      <div className="City-current">
        <div className="City-header">
          <p className="City-name">{cityName}</p>
          <p className="City-description">{capitalizeFirst(current.weather[0].description)}</p>
        </div>
        <div className="City-largetemperature">
          <img
            className="City-largeicon"
            alt="Weather"
            src={"http://openweathermap.org/img/wn/" + current.weather[0].icon + "@2x.png"}
          />
          <p className="City-maintemperature">{current.main.temp.toFixed(0)} °C</p>
        </div>
        <div className="City-date-time">
          <p className="City-date">{toMonthAndDay(new Date())}</p>
          <p className="City-time-of-day">{toTimeOfDay(new Date())}</p>
        </div>
        <div className="City-details">
          <p className="City-detail">Wind: {current.wind.speed.toFixed(1)} m/s</p>
          <p className="City-detail">Humidity: {current.main.humidity.toFixed(0)} %</p>
          <p className="City-detail">
            Precipitation (3 h): {current.precipitation["3h"].toFixed(0)} mm
          </p>
        </div>
      </div>
      <div className="City-forecast">
        {forecast.list.map((weatherAtTime, i) => {
          return (
            <div key={i} className="City-smalltemperature">
              <p className="City-time-of-day">{toTimeOfDay(new Date(weatherAtTime.dt * 1000))}</p>
              <img
                className="City-smallicon"
                alt="Weather"
                src={"http://openweathermap.org/img/wn/" + weatherAtTime.weather[0].icon + ".png"}
              />
              <p className="City-temperature">{weatherAtTime.main.temp.toFixed(0)} °C</p>
              <div className="City-small-details">
                <p className="City-small-detail">{weatherAtTime.wind.speed.toFixed(1)} m/s</p>
                <p className="City-small-detail">{weatherAtTime.main.humidity.toFixed(0)} %</p>
                <p className="City-small-detail">{weatherAtTime.precipitation["3h"]} mm</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default City;
