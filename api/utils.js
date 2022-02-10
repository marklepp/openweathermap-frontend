const https = require("https");

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function cachedRequester(description, cacheTimeMillisecs, urlBuilder, preprocessor) {
  const cache = {};
  return function cachedRequest(id, callback) {
    if (id in cache && cache[id].fetching) {
      cache[id].waiting.push(callback);
      return;
    }

    const time = Date.now();
    if (id in cache && time - cache[id].time <= cacheTimeMillisecs) {
      //console.log(new Date(), capitalizeFirst(description), id, "from cache");
      setTimeout(() => callback({ ...cache[id].data }), 0);
      return;
    }

    if (id in cache) {
      cache[id].fetching = true;
    } else {
      cache[id] = { time: new Date(0), fetching: true, waiting: [] };
    }
    cache[id].waiting.push(callback);

    console.log(new Date(), "Fetching", description, id);
    https
      .get(urlBuilder(id), (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          const responseJson = preprocessor(JSON.parse(body));

          const waiting = cache[id].waiting;
          cache[id] = {
            time: Date.now(),
            data: responseJson,
            fetching: false,
            waiting: [],
          };
          for (const callback of waiting) {
            setTimeout(() => {
              //console.log(new Date(), "Sending", description, id);
              callback({ ...responseJson });
            }, 0);
          }
        });
      })
      .on("error", (e) => {
        console.error(e);
        cache[id].fetching = false;
        for (const callback of cache[id].waiting) {
          setTimeout(() => callback({ cod: 500 }));
        }
        cache[id].waiting = [];
      });
  };
}

module.exports = { cachedRequester, capitalizeFirst };
