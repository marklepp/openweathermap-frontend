const express = require("express");
const https = require("https");

const app = express();
const port = process.env.PORT || 5000;
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const cities = require("./cities.js");

const cache = {};

/*
https
  .get(
    "https://api.openweathermap.org/data/2.5/forecast?id=" +
      cities.jyvaksyla.id +
      "&units=metric&appid=" +
      OPENWEATHERMAP_API_KEY +
      "&lang=fi",
    (res) => {
      console.log("statusCode:", res.statusCode);
      console.log("headers:", res.headers);

      res.on("data", (d) => {
        process.stdout.write(d);
      });
    }
  )
  .on("error", (e) => {
    console.error(e);
  });
*/
function getCurrentWeather(city, callback) {
  https
    .get(
      "https://api.openweathermap.org/data/2.5/weather?id=" +
        city.id +
        "&units=metric&appid=" +
        OPENWEATHERMAP_API_KEY +
        "&lang=fi",
      (res) => {
        console.log("statusCode:", res.statusCode);
        console.log("headers:", res.headers);

        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          const weatherjson = JSON.parse(body);
          callback(weatherjson);
        });
      }
    )
    .on("error", (e) => {
      console.error(e);
    });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/*
app.get("/api/hello", (req, res) => {
  res.send({ express: "Hello From Express" });
});

app.post("/api/world", (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`
  );
});
*/
//app.listen(port, () => console.log(`Listening on port ${port}`));
