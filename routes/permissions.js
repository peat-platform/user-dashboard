var jwt       = require('jsonwebtoken');
var config    = require('../libs/config');
var permsLib  = require('../libs/perms');
var crud      = require('../libs/crud');
var deepEqual  = require('deep-equal');


module.exports = function (cmd_args) {

   var user_dash_public_key = cmd_args.auth_server_public_key.replace(/'/g, "").replace(/"/g, '').replace(/\\n/g, "\n");

   return function (req, res, next) {

      console.log("---=" + req)

      jwt.verify(req.signedCookies.session, user_dash_public_key, function (err, decoded) {

         if ( err ) {
            res.render('/user/login')
         }
         else {
            var url = "https://127.0.0.1:8443/api/v1/permissions/" + req.query.cid + "/" + req.query.api_key;
            var auth = req.signedCookies.session;

            console.log(url)

            crud.get(url, auth, function (err, user_app_perms, body) {

               var perms = JSON.parse(user_app_perms)

               console.log("perms1  ", JSON.stringify(perms, null, 2));
               console.log("res     ", user_app_perms);
               console.log("body    ", body);

               var path = "https://127.0.0.1:8443/api/v1/app_permissions_latest/" + req.query.api_key;

               crud.get(path, auth, function (err, app_perms) {

                  app_perms = JSON.parse(app_perms)

                  //strip out SEs
                  for ( var i in app_perms.result[0].permissions){
                     var e = app_perms.result[0].permissions[i]
                     if (e.type === "service_enabler"){
                        delete app_perms.result[0].permissions[i]
                     }
                  }

                  var reset = (deepEqual(perms, app_perms.result[0].permissions)) ? false : true ;
                  var empty = 0 === perms.length

                  console.log("perms2  ", JSON.stringify(app_perms.result[0].permissions, null, 2));

                  console.log("reset", reset)

                  var tmp = app_perms

                  tmp.result[0].permissions = perms

                  var permsHTML = permsLib.renderPerms(tmp)

                  res.render('permissions', {
                     api_key   : req.query.api_key,
                     cid       : req.query.cid,
                     reset     : reset,
                     empty     : empty,
                     permsHTML : permsHTML
                  })
               })
            })
         }
      });
   };
};
