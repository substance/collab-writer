# CollabWriter

CollabWriter sets up a minimal [realtime collaboration infrastructure](./server.js).

STATUS: Experimental

## Install

```
$ git clone https://github.com/substance/examples.git
$ npm install
$ npm run build
$ npm start
```

- Open two browser windows at `http://localhost:7777`.
- Start typing and see the changes in realtime in the other window.

## Development

You can build in development mode, where source file changes trigger a rebuild of client and server. The Server will be bundled into `server.cjs.js`. We recommend using Google Chrome for development.

```
$ npm run dev
```

Open a separate terminal window and run node.

```js
$ node  server.cjs.js
```

We recommend that you start the server with a visual debugger, such as devtool.

```js
$ devtool server.cjs.js
```
