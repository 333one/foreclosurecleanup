const siteValue = require('../models/site-values');

const { logErrorMessage, wrapAsync } = require('./error-handling');
let { projectStatus } = siteValue;

exports.logoutUser = wrapAsync( async function(req, res, destination) {

    // Triple redundancy,
    // clearCookie deletes cookie in the browser
    // session.destroy() deletes the session 
    // unset: 'destroy' is set in the cookie so .destroy() deletes the reference in the redis DB.
    res.clearCookie(process.env.SESSION_NAME);
    req.session.destroy();
    
    return res.redirect(destination);

    // This is the old way.  Keeping in case problems are discovered with the new way.
    // if (projectStatus === 'staging' || projectStatus === 'production') {

    //     let redisClient = req.app.get('referenceToRedisClient');
    //     redisClient.del(req.session.id);

    // }

    // req.session.destroy( function(error) {
    //     if (error) res.clearCookie(process.env.SESSION_NAME);
    // });

});