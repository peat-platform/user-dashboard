var request  = require('request');
var jwt      = require('jsonwebtoken');
var crud     = require('../libs/crud');
var auth     = require('../libs/auth');
var subs     = require('../libs/subscriptions');
var config   = require('../libs/config');


var express = require('express');
var router  = express.Router();

module.exports = function(cmd_args) {

   var seckeyenc = cmd_args.seckeyenc;
   var user_dash_public_key = cmd_args.auth_server_public_key.replace(/'/g, "").replace(/"/g, '').replace(/\\n/g, "\n");

   return function (req, res, next) {

      jwt.verify(req.signedCookies.session, user_dash_public_key, function (err, decoded) {


         if ( err ) {
            res.render('/admin/login')
         }
         else {

            var subscribers = null;
            var subscriptions = null;

            subs.getSubscribers(req.signedCookies.session, function (err, body) {
               subscribers = body;

               if ( body !== undefined && body.indexOf("Not Found") > -1) {
                  err = "Mongrel2 handler settings Incorrect. Please check configuration"
               }
               if ( err ) {
                  console.log(err)
               }


               subs.getSubscriptions(req.signedCookies.session, function (err, body) {
                  if ( err ) {
                     console.log(err)
                  }

                  subscriptions = body;

                  if ( subscribers !== null && subscriptions !== null ) {
                     res.render('subscriptions', {
                        user           : decoded.user_id,
                        'subscribers'  : subscribers,
                        'subscriptions': subscriptions,
                        'session'      : req.signedCookies.session
                     });
                  }
                  else {
                     res.render('subscriptions', {
                        user           : decoded.user_id,
                        'subscribers'  : [],
                        'subscriptions': [],
                        'session'      : req.signedCookies.session
                     });
                  }

               });
            });
         }
      });


   };
};

