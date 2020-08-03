"use strict";

const express = require('express');
const mongoose = require('mongoose'); 
const path = require('path');
const session = require('express-session');

// Use default store when testing on Windows.  On Linux remove the comments below and turn on Redis.  Also turn on Redis in the session.
//const redis = require('redis');
//let RedisStore = require('connect-redis')(session);
//let redisClient = redis.createClient();

const endpointsDefault = require('./controllers/endpoints_default');
const endpointsUserAccounts = require('./controllers/endpoints_user_accounts');

// Custom path to .env file.
require('dotenv').config({ path: path.join(__dirname, '/models/.env') });

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In the production app NGINX will serve static files and this shouldn't be needed.
app.use(express.static( path.join(__dirname, 'views/public')));

app.use(
    session({
        // maxAge: 24 hours
        maxAge: 24 * 60 * 60 * 1000,
        name: process.env.SESSION_NAME,
        resave: false,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
        // Use default store when testing on Windows.  On Linux remove the comment below to turn on the Redis store.
        //store: new RedisStore({ client: redisClient }),
        cookie: {
            sameSite: true,
            // secure: true requires internal https but when Nginx is configured as a reverse proxy it uses http by default to communicate with Node.js.  
            // Nginx does this because http is much less processor intensive.  All communication to the outside world still uses secure https.
            secure: false
        } 
    })
);

app.use(endpointsUserAccounts);
app.use(endpointsDefault);

mongoose.connect(process.env.DB_CONNECTION, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then( function(promiseData){
        console.log('mongoose connected');
    })
    .catch( function(err){
        console.log(err);
    });

app.listen(process.env.PORT, function(){
    console.log(`app.js listening on port ${process.env.PORT}`);
});

// close mongoose connection gracefully when app is terminated with ctrl-c.
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        process.exit(0);
    });
});