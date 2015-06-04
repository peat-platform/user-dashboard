var express = require('express');
var jwt     = require('jsonwebtoken')

module.exports = function(config) {

   var router = express.Router();

   console.log(config)
   console.log("---------------")
   console.log(config.auth_server_public_key)

   /* GET home page. */
   router.get('/', function (req, res) {

      jwt.verify(req.signedCookies.session, config.auth_server_public_key, function (err, decoded) {

         if (err) {
            res.render('/user/login')
         }
         else {
            res.render('index', {
               title    : 'OPENi-Dashboard',
               ContentHeader  : decoded.user_id.toUpperCase()+'\'s Home',
               token    : req.signedCookies.session.substring(0, 100) + "...",
               user     : decoded.user_id,
               cloudlet : decoded.cloudlet
            });
         }
      });
   });

   return router
}
