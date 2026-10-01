const express = require('express');

const app = express();


app.get('/', (req, res) => {

  res.send(`

    <!doctype html>

    <html>

    <head>

      <meta charset="utf-8">

      <title>
        AZSAGH Internal Admin
      </title>

    </head>


    <body>

      <h1>
        AZSAGH Internal Admin Service
      </h1>

      <p>
        This service listens only on
        127.0.0.1:8080.
      </p>

      <p>
        Later you will reach it through
        an SSH SOCKS5 tunnel.
      </p>

    </body>

    </html>

  `);

});


app.listen(
  8080,
  '127.0.0.1',
  () => {

    console.log(
      'Internal admin service: http://127.0.0.1:8080'
    );

  }
);