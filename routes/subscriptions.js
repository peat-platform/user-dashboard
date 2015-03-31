var request  = require('request');
var jwt      = require('jsonwebtoken');
var crud     = require('../libs/crud');
var auth     = require('../libs/auth');
var subs     = require('../libs/subscriptions')
var config   = require('../libs/config');


var express = require('express');
var router  = express.Router();

router.get('/', function(req, res)
{
   //console.log("req", req.signedCookies.session)

   jwt.verify(req.signedCookies.session, config.key.verify, function (err, decoded) {

      if (err) {
         res.render('/admin/login')
      }
      else {

         subs.getSubscribers(req.signedCookies.session, function(err, body)
         {
            console.log("-----------------------------------------")
            if (err) {
               console.log(err)
            }
            console.log(body);

            res.render('subscriptions', {user : decoded.user_id,
               's': body,
               'session' : req.signedCookies.session});


         });
      }
   });


});


module.exports = router;
