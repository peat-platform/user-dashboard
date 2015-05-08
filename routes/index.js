var express = require('express');
var jwt     = require('jsonwebtoken')

module.exports = function(config) {

   var router = express.Router();

   /* GET home page. */
   router.get('/', function (req, res) {

      jwt.verify(req.signedCookies.session, config.trusted_public_key, function (err, decoded) {

         if (err) {
            res.render('/user/login')
         }
         else {
            res.render('index', {
               title    : 'PEAT-Dashboard',
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
