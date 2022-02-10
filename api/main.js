const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const { cityIds } = require("./cities.js");
const { capitalizeFirst, cachedRequester } = require("./utils.js");

const getCurrentWeather = cachedRequester(
  "current weather",
  9 * 60 * 1000,
  (cityId) =>
    "https://api.openweathermap.org/data/2.5/weather?id=" +
    cityId +
    "&units=metric&appid=" +
    OPENWEATHERMAP_API_KEY,
  (weatherjson) => {
    weatherjson.precipitation = { "3h": 0 };
    if ("rain" in weatherjson) {
      if ("3h" in weatherjson.rain) weatherjson.precipitation["3h"] = weatherjson.rain["3h"];
      else if ("1h" in weatherjson.rain) weatherjson.precipitation["3h"] = weatherjson.rain["1h"];
    } else if ("snow" in weatherjson) {
      if ("3h" in weatherjson.snow) weatherjson.precipitation["3h"] = weatherjson.snow["3h"];
      else if ("1h" in weatherjson.snow) weatherjson.precipitation["3h"] = weatherjson.snow["1h"];
    }
    weatherjson.cod = Number(weatherjson.cod);
    return weatherjson;
  }
);

const getWeatherForecast = cachedRequester(
  "forecast",
  59 * 60 * 1000,
  (cityId) =>
    "https://api.openweathermap.org/data/2.5/forecast?id=" +
    cityId +
    "&units=metric&cnt=6&appid=" +
    OPENWEATHERMAP_API_KEY,
  (weatherjson) => {
    weatherjson.list.forEach((weather) => {
      weather.precipitation = { "3h": 0 };
      if ("rain" in weather) {
        weather.precipitation["3h"] = weather.rain["3h"];
      } else if ("snow" in weather) {
        weather.precipitation["3h"] = weather.snow["3h"];
      }
    });
    weatherjson.cod = Number(weatherjson.cod);
    return weatherjson;
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/current", (req, res) => {
  const { cityName } = req.body;
  if (cityName in cityIds) {
    const cityId = cityIds[cityName];
    getCurrentWeather(cityId, (resJson) => {
      console.log(new Date(), "Sending current weather", cityName, cityId, "for", req.ip);
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
      console.log(new Date(), "Sending forecast", cityName, cityId, "for", req.ip);
      res.send(resJson);
    });
  } else {
    res.status(404).send({
      message: 'City "' + cityName + '" not found',
    });
  }
});

//app.use(express.static(path.join(__dirname, "..", "client", "build")));
//
//app.get("/", function (req, res) {
//  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
//});

app.listen(port, () => console.log(`Listening on port ${port}`));
