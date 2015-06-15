var request  = require('request');
var jwt      = require('jsonwebtoken');
var crud     = require('../libs/crud');
var auth     = require('../libs/auth');
var subs     = require('../libs/subscriptions');
var config   = require('../libs/config');


var express = require('express');
var router  = express.Router();

var apiKeyExtract = new RegExp(/[a-z,0-9]{32}/m);

module.exports = function(cmd_args) {

   var seckeyenc            = cmd_args.seckeyenc;
   var user_dash_public_key = cmd_args.auth_server_public_key.replace(/'/g, "").replace(/"/g, '').replace(/\\n/g, "\n");

   return function (req, res, next) {

      jwt.verify(req.signedCookies.session, user_dash_public_key, function (err, decoded) {

         if ( err ) {
            res.render('/admin/login')
         }
         else {

            res.render('addSubscription', {
               user     : decoded.user_id,
               session  : req.signedCookies.session,
               cloudlet : decoded.cloudlet
            });


         }

      });

   }
};
