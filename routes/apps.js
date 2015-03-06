var request = require('request');
var jwt     = require('jsonwebtoken');
var crud    = require('../libs/crud');
var auth    = require('../libs/auth');
var config  = require('../libs/config');

var express = require('express');
var router  = express.Router();

router.get('/', function(req, res)
{
   jwt.verify(req.signedCookies.session, config.key.verify, function (err, decoded) {

      if (err) {
         res.render('/user/login')
      }
      else {

         auth.readClients(req.signedCookies.session, function(err, body)
         {
            res.render('apps', {user : decoded.user_id, 'clients': body.result});
         });
      }
   });


});

module.exports = router;
