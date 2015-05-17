/**
 * Created by dmccarthy on 09/03/15.
 */
var request = require('request');
var crud    = require('../libs/crud');
var express = require('express');
var jwt     = require('jsonwebtoken');
var config  = require('../libs/config');
var router  = express.Router();

router.get('/', function(req, res){

   jwt.verify(req.signedCookies.session, config.key.verify, function (err, decoded) {

      if (err) {
         res.render('/user/login')
      }
      else {

         var perms = [{name : "Ayda Fertility App"}, {name : "Family Budget Tracker"}]

         res.render('apps_dashboard', {
            'user'      : decoded.user_id,
            'cloudlet'  : decoded.cloudlet,
            'session'   : req.signedCookies.session,
            'perms'     : perms
         });
      }
   });
});


module.exports = router;