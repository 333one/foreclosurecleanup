const siteValue = require('../models/site-values');

const { logErrorMessage, wrapAsync } = require('./error-handling');
let { projectStatus } = siteValue;

exports.logoutUser = wrapAsync( async function(req, res, destination) {

    if (projectStatus === 'staging' || projectStatus === 'production') {

        let redisClient = req.app.get('referenceToRedisClient');
        await redisClient.del(req.session.id);

    }

    req.session.destroy( function(error) {

        if (error) res.clearCookie(process.env.SESSION_NAME);

        if (destination) return res.redirect(destination);

    });

});