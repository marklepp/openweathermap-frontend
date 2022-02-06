const express = require("express");
const https = require("https");

const app = express();
const port = process.env.PORT || 5000;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const { cityIds } = require("./cities.js");

const currentWeatherCache = {};
function getCurrentWeather(cityId, callback) {
  let time = Date.now();
  if (
    cityId in currentWeatherCache &&
    time - currentWeatherCache[cityId].time <= 10 * 60 * 1000
  ) {
    console.log(new Date(), "Current weather from cache for", cityId);
    setTimeout(() => callback({ ...currentWeatherCache[cityId].data }), 0);
    return;
  }
  console.log(new Date(), "Fetching current weather for", cityId);
  https
    .get(
      "https://api.openweathermap.org/data/2.5/weather?id=" +
        cityId +
        "&units=metric&appid=" +
        OPENWEATHERMAP_API_KEY,
      //"&lang=fi"
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          const weatherjson = JSON.parse(body);
          weatherjson.precipitation = { "3h": 0 };
          //if ("rain" in weatherjson) {
          //  weatherjson.precipitation["3h"] = weatherjson.rain["3h"];
          //} else if ("snow" in weatherjson) {
          //  weatherjson.precipitation["3h"] = weatherjson.snow["3h"];
          //}
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
    time - forecastCache[cityId].time <= 3 * 60 * 60 * 1000
  ) {
    console.log(new Date(), "Forecast from cache for", cityId);
    setTimeout(() => callback({ ...forecastCache[cityId].data }), 0);
    return;
  }
  console.log(new Date(), "Fetching forecast for", cityId);
  https
    .get(
      "https://api.openweathermap.org/data/2.5/forecast?id=" +
        cityId +
        "&units=metric&cnt=6&appid=" +
        OPENWEATHERMAP_API_KEY,
      //"&lang=fi"
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          const weatherjson = JSON.parse(body);
          weatherjson.list.forEach((weather) => {
            weather.precipitation = { "3h": 0 };
            if ("rain" in weather) {
              weather.precipitation["3h"] = weather.rain["3h"];
            } else if ("snow" in weather) {
              weather.precipitation["3h"] = weather.snow["3h"];
            }
          });
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
      res.send(resJson);
    });
  } else {
    res.status(404).send({
      message: 'City "' + cityName + '" not found',
    });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
