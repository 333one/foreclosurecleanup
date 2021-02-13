'use strict';

const express = require('express');
const app = express();

const mongoose = require('mongoose'); 
const path = require('path');
const session = require('express-session');

// Custom path to .env file.
require('dotenv').config({ path: path.join(__dirname, '/models/.env')});

const endpointsUserAccounts = require('./controllers/endpoints-user-accounts');
const endpointsStripe = require('./controllers/endpoints-stripe');
const endpointsDefault = require('./controllers/endpoints-default');
const logicDefault = require('./controllers/logic-default');
const scheduledEvents = require('./controllers/scheduled-events');
const siteValue = require('./models/site-values');
const { customExpressErrorHandler, logErrorMessage } = require('./controllers/error-handling');

let { projectStatus } = siteValue;

// Use default store when testing on Windows.  On Linux turn on Redis.  Also turn on Redis in the session.
if (projectStatus === 'staging' || projectStatus === 'production') {

    var redis = require('redis');
    var redisClient = redis.createClient();
    var RedisStore = require('connect-redis')(session);
    app.set('trust proxy', 'loopback');

    app.set('referenceToRedisClient', redisClient);
    
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In the production app NGINX will serve static files and this shouldn't be needed.
if (projectStatus === 'development') {
    app.use(express.static(path.join(__dirname, 'views/public')));
}

let sessionObject = logicDefault.createSessionObject(projectStatus, redisClient, RedisStore);
app.use(session(sessionObject));

let temporaryPlaceholder = false;
if (temporaryPlaceholder === true) {

    app.get(['/', '/index'], function(req, res) {

        res.render('index-single-page-site');

    });

} else {

    app.use(endpointsUserAccounts);
    app.use(endpointsStripe);
    app.use(endpointsDefault);
    app.use(customExpressErrorHandler);
    
    mongoose.connect(process.env.DB_CONNECTION, { autoIndex: false, useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
        .then( function() {
            console.log('mongoose connected');
        })
        .catch( function(error) {
            logErrorMessage(error);
        });

}

app.listen(siteValue.port, function(){
    console.log(`app.js listening on port ${ siteValue.port }`);
});

scheduledEvents.turnOnScheduledEvents();

// close mongoose connection gracefully when app is terminated with ctrl-c.
process.on('SIGINT', function() {
    mongoose.connection.close(function() { process.exit(0); });
});