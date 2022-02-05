const express = require("express");
const https = require("https");

const app = express();
const port = process.env.PORT || 5000;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const { cityIds } = require("./cities.js");

function inMilliseconds(hours, minutes = 60, seconds = 60) {
  return hours * minutes * seconds * 1000;
}

const currentWeatherCache = {};

function getCurrentWeather(cityId, callback) {
  let time = Date.now();
  if (
    cityId in currentWeatherCache &&
    currentWeatherCache[cityId].time - time <= inMilliseconds(0, 10)
  ) {
    setTimeout(() => callback({ ...currentWeatherCache[cityId].data }), 0);
    return;
  }
  https
    .get(
      "https://api.openweathermap.org/data/2.5/weather?id=" +
        cityId +
        "&units=metric&appid=" +
        OPENWEATHERMAP_API_KEY +
        "&lang=fi",
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          const weatherjson = JSON.parse(body);
          currentWeatherCache[cityId] = {
            time: Date.now(),
            data: weatherjson,
          };
          callback({ ...weatherjson });
        });
      }
    )
    .on("error", (e) => {
      console.error(e);
    });
}

const forecastCache = {};

function getWeatherForecast(cityId, callback) {
  let time = Date.now();
  if (
    cityId in forecastCache &&
    forecastCache[cityId].time - time <= inMilliseconds(3)
  ) {
    setTimeout(() => callback({ ...forecastCache[cityId].data }), 0);
    return;
  }
  https
    .get(
      "https://api.openweathermap.org/data/2.5/forecast?id=" +
        cityId +
        "&units=metric&appid=" +
        OPENWEATHERMAP_API_KEY +
        "&lang=fi",
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          const weatherjson = JSON.parse(body);
          forecastCache[cityId] = {
            time: Date.now(),
            data: weatherjson,
          };
          callback({ ...weatherjson });
        });
      }
    )
    .on("error", (e) => {
      console.error(e);
    });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/current", (req, res) => {
  const { cityName } = req.body;
  if (cityName in cityIds) {
    const cityId = cityIds[cityName];
    getCurrentWeather(cityId, (resJson) => {
      res.send(resJson);
    });
  } else {
    res.status(404).send({
      message: 'City "' + cityName + '" not found',
    });
  }
});

app.post("/api/forecast", (req, res) => {
  const { cityName } = req.body;
  if (cityName in cityIds) {
    const cityId = cityIds[cityName];
    getWeatherForecast(cityId, (resJson) => {
      const time = Date.now();
      resJson.list = resJson.list.filter(
        (item) => item.dt * 1000 - time <= inMilliseconds(26)
      );
      res.send(resJson);
    });
  } else {
    res.status(404).send({
      message: 'City "' + cityName + '" not found',
    });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
