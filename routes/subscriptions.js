var request  = require('request');
var jwt      = require('jsonwebtoken');
var crud     = require('../libs/crud');
var auth     = require('../libs/auth');
var subs     = require('../libs/subscriptions');
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

         var subscribers = null;
         var subscriptions = null ;

         subs.getSubscribers(req.signedCookies.session, function(err, body)
         {
            console.log(body);
            if (err) {
               console.log(err)
            }

            subscribers = body;

            subs.getSubscriptions(req.signedCookies.session, function(err, body) {
               if ( err ) {
                  console.log(err)
               }
               console.log(body);

               subscriptions = body;

               if(subscribers !== null && subscriptions !== null){
                  res.render('subscriptions', {user : decoded.user_id,
                     'subscribers': subscribers,
                     'subscriptions':subscriptions,
                     'session' : req.signedCookies.session});
               }
               else{
                  res.render('subscriptions', {user : decoded.user_id,
                     'subscribers': [],
                     'subscriptions':[],
                     'session' : req.signedCookies.session});
               }

            });
         });
      }
   });


});


module.exports = router;
