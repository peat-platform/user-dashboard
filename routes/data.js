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
         crud.readUserCloudlets(req.signedCookies.session, function(err, body){

            var dupCheck = []
            var tids     = [];

            var e;

            if(err || body.indexOf("error") >= 0) {
               e = (body.indexOf("error") >= 0) ? body : err;
               console.log("Error: ",e)
            }
            else {
               var body = JSON.parse(body);

               console.log(body)

               for ( var i = 0; i < body.result.length; i++ ) {
                  var entry = body.result[i];
                  var obj = {"name" : entry, "id" : entry}
                  if(dupCheck.indexOf(entry) === -1) {
                     dupCheck.push(entry)
                     tids.push(obj)
                  }
               }

            }

            res.render('data_dashboard', {
               'user'      : decoded.user_id,
               'cloudlet'  : decoded.cloudlet,
               'session'   : req.signedCookies.session,
               'types'     : tids,
               'error'     : e
            });
         });
      }
   });
});


module.exports = router;