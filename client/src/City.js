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
  let dayOfMonth = date.getDate();
  output += dayOfMonth + dayOrdinal(dayOfMonth);
  return output;
}
function toTimeOfDay(date) {
  return padInt(2, date.getHours()) + ":" + padInt(2, date.getMinutes());
}
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function DateAndTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const nextTarget = new Date(time.getTime() + 1000 * 60);
    nextTarget.setSeconds(1, 0);

    const timeout = setTimeout(() => setTime(new Date()), nextTarget.getTime() - Date.now());
    return () => {
      clearTimeout(timeout);
    };
  }, [time]);
  return (
    <div className="City-date-time">
      <p className="City-date">{toMonthAndDay(time)}</p>
      <p className="City-time-of-day">{toTimeOfDay(time)}</p>
    </div>
  );
}

function City({ cityName, show }) {
  const [current, setCurrent] = useState({
    weather: [{ description: "Loading...", main: "Weather", icon: null }],
    main: { temp: 0, humidity: 0 },
    wind: { speed: 0 },
    precipitation: { "3h": 0 },
    dt: 0,
  });
  const [forecast, setForecast] = useState({
    list: [1, 2, 3, 4, 5, 6].map((i) => {
      return {
        weather: [{ description: "Loading...", main: "Weather", icon: null }],
        main: { temp: 0, humidity: 0 },
        wind: { speed: 0 },
        dt: 0,
        precipitation: { "3h": 0 },
      };
    }),
  });

  useEffect(
    function updateCurrent() {
      fetch("/api/current", {
        method: "POST",
        mode: "same-origin",
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
          if (data && data.cod === 200) {
            setCurrent(data);
          }
        })
        .catch((reason) => {
          console.warn(reason);
        });
      const timeout = setTimeout(updateCurrent, 1000 * 60 * 10);
      return () => {
        clearTimeout(timeout);
      };
    },
    [cityName]
  );
  useEffect(
    function updateForecast() {
      fetch("/api/forecast", {
        method: "POST",
        mode: "same-origin",
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
          if (data && data.cod === 200) {
            setForecast(data);
          }
        })
        .catch((reason) => {
          console.warn(reason);
        });
      const nextTarget = new Date(Date.now() + 1000 * 60 * 60);
      nextTarget.setMinutes(0, 0, 0);
      const timeout = setTimeout(updateForecast, nextTarget.getTime() - Date.now());
      return () => {
        clearTimeout(timeout);
      };
    },
    [cityName]
  );
  const nextForecastInUnder1h = forecast.list[0].dt - Date.now() / 1000 < 1 * 60 * 60;
  const [start, end] = nextForecastInUnder1h ? [1, 6] : [0, 5];
  return (
    <div className={show ? "City" : "hide"}>
      <div className="City-current">
        <div className="City-header">
          <p className="City-name">{cityName}</p>
          <p className="City-description">{capitalizeFirst(current.weather[0].description)}</p>
        </div>
        <div className="City-large-temperature">
          {current.weather[0].icon === null ? (
            <div className="City-large-icon"></div>
          ) : (
            <img
              className="City-large-icon"
              alt={current.weather[0].main}
              src={"http://openweathermap.org/img/wn/" + current.weather[0].icon + "@2x.png"}
            />
          )}
          <p className="City-main-temperature">{current.main.temp.toFixed(0)} °C</p>
        </div>
        <DateAndTime />
        <div className="City-details">
          <p className="City-detail City-wind">{current.wind.speed.toFixed(1)} m/s</p>
          <p className="City-detail City-humidity">{current.main.humidity.toFixed(0)} %</p>
          <p className="City-detail City-precipitation">
            {forecast.list[0].precipitation["3h"].toFixed(0)} mm
          </p>
        </div>
      </div>
      <div className="City-forecasts">
        {forecast.list.slice(start, end).map((weatherAtTime, i) => {
          return (
            <div key={i} className="City-forecast">
              <div className="City-small-temperature">
                <p className="City-time-of-day">{toTimeOfDay(new Date(weatherAtTime.dt * 1000))}</p>
                {weatherAtTime.weather[0].icon === null ? (
                  <div className="City-small-icon"></div>
                ) : (
                  <img
                    className="City-small-icon"
                    alt={current.weather[0].main}
                    src={
                      "http://openweathermap.org/img/wn/" + weatherAtTime.weather[0].icon + ".png"
                    }
                  />
                )}
                <p className="City-temperature">{weatherAtTime.main.temp.toFixed(0)} °C</p>
              </div>
              <div className="City-small-details">
                <p className="City-small-detail">{weatherAtTime.wind.speed.toFixed(1)} m/s</p>
                <p className="City-small-detail">{weatherAtTime.main.humidity.toFixed(0)} %</p>
                <p className="City-small-detail">
                  {weatherAtTime.precipitation["3h"].toFixed(0)} mm
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default City;
