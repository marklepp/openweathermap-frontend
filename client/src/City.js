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

function City({ cityName }) {
  const [current, setCurrent] = useState({
    weather: [{ description: "Loading...", icon: "01d" }],
    main: { temp: 0, humidity: 0 },
    wind: { speed: 0 },
    dt: 0,
  });
  console.log(current);
  useEffect(function updateCurrent() {
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
  }, []);
  return (
    <div className="City">
      <div className="City-current">
        <div className="City-header">
          <h1 className="City-name">{cityName}</h1>
          <p className="City-description">{current.weather[0].description}</p>
        </div>
        <div className="City-largetemperature">
          <img
            className="City-largeicon"
            src={
              "http://openweathermap.org/img/wn/" +
              current.weather[0].icon +
              ".png"
            }
          />
          <p className="City-maintemperature">
            {current.main.temp.toFixed(0)} °C
          </p>
        </div>
        <div className="City-date-time">
          <h2 className="City-date">{toMonthAndDay(new Date())}</h2>
          <p className="City-time-of-day">{toTimeOfDay(new Date())}</p>
        </div>
        <div className="City-details">
          <p className="City-detail">
            Wind: {current.wind.speed.toFixed(1)} m/s
          </p>
          <p className="City-detail">
            Humidity: {current.main.humidity.toFixed(0)} %
          </p>
          <p className="City-detail">Precipitation (3 h): mm</p>
        </div>
      </div>
    </div>
  );
}

export default City;
