"use strict";

exports.logoutUser = function(req, res, destination) {

    req.session.destroy( function(error) {

        if (error) res.clearCookie(process.env.SESSION_NAME);
        if (destination) return res.redirect(destination);

    });

}