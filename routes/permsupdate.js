var jwt       = require('jsonwebtoken');
var config    = require('../libs/config');
var crud      = require('../libs/crud');
var deepEqual = require('deep-equal');


var persistObjectPerms = function(req, res, objPerms){


   var auth = req.signedCookies.session;
   var path = "https://127.0.0.1:8443/api/v1/app_permissions_latest/" + req.query.api_key;

   crud.get(path, auth, function (err, app_perms) {

      app_perms = JSON.parse(app_perms)

      app_perms = app_perms.result[0]

      for ( var i = 0; i < app_perms.permissions.length; i++ ){
         var e = app_perms.permissions[i]
         if ("object" === e.type && objPerms.id === e.ref){
            delete app_perms.permissions[i]
         }
      }

      for ( var i = 0; i < objPerms.permissions.length; i++ ){
         app_perms.permissions.push(objPerms.permissions[i])
      }

      persistPerms(req, res, app_perms)
   })

}



var persistPerms = function(req, res, appPerms){

   for (var i = 0; i < appPerms.permissions.length; i++){
      var perm = appPerms.permissions[i]

      if ('service_enabler' === perm.type){

         for (var j =0; j < appPerms.service_enablers.length; j++){
            var se = appPerms.service_enablers[j]

            if (se.name === perm.ref){
               appPerms.permissions[i].cloudlet = se.cloudlet
            }
         }
      }
   }

   var path = "https://127.0.0.1:8443/api/v1/permissions/" + req.query.cid + "/" + req.query.api_key;
   var data = appPerms.permissions;
   var auth = req.signedCookies.session;

   crud.post(path, data, auth, function (err, result) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
         "status" : "ok"
      }));
   })
}


var resetPerms = function(req, res){

   var auth = req.signedCookies.session;
   var path = "https://127.0.0.1:8443/api/v1/app_permissions_latest/" + req.query.api_key;

   crud.get(path, auth, function (err, app_perms) {

      app_perms = JSON.parse(app_perms)

      persistPerms(req, res, app_perms.result[0])
   })

}


module.exports = function (cmd_args) {

   var user_dash_public_key = cmd_args.auth_server_public_key.replace(/'/g, "").replace(/"/g, '').replace(/\\n/g, "\n");

   return function (req, res, next) {

      jwt.verify(req.signedCookies.session, user_dash_public_key, function (err, decoded) {

         if ( err ) {
            res.render('/user/login')
         }
         else {

            var appPerms = req.body

            if (appPerms.revoke){
               appPerms.permissions = []
               persistPerms(req, res, appPerms)
            }
            else if (appPerms.reset){
               resetPerms(req, res)
            }
            else if (appPerms.modify){
               persistPerms(req, res, appPerms)
            }
            else if (appPerms.modify_object){
               persistObjectPerms(req, res, appPerms)
            }
         }
      });
   };
};