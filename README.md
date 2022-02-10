# openweathermap-frontend

Api key is read from environment variable `OPENWEATHERMAP_API_KEY`. Set it 
before running the app.

Top level npm scripts have been tested on Windows:

- `npm install` installs both folders, api and client 
- `npm start` builds the client and starts api/main server
- `npm run build` builds the client 
- `npm run server` starts api/main server
- `npm run devserver` starts api- and client-servers for development (most likely to work only on windows)
- `npm run client` starts client server for development

## Details

### Production: build and serve

The client must be built before running the app: enter `npm run build` in
the `client`-folder.

App is run by running `npm start` or `node main.js` in `api`-folder. The default 
port is 5000, but this can be changed by setting environment variable `PORT` 
to the desired port number.

### Development: start client and api-server

Running the devserver with a proxy is broken due to a webpack-configuration 
problem in the current react-scripts version (5.0.0). This can be worked around
by setting environment variable `DANGEROUSLY_DISABLE_HOST_CHECK` to `true`, 
after which the devserver should work fine.* 

Run devServer by running api-server first and then client-server
by running `npm start` in the `client`-folder. The port is 3000.



*) http-proxy-middleware would have provided a better solution, but it
was using a deprecated feature at the time of writing