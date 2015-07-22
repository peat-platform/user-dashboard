var jwt       = require('jsonwebtoken');
var config    = require('../libs/config');
var crud      = require('../libs/crud');
var deepEqual = require('deep-equal');


var persistObjectPerms = function(req, res, objPerms){

   var auth = req.signedCookies.session;
   var path = "https://127.0.0.1:8443/api/v1/permissions_latest/" + req.query.cid + "/" + req.query.api_key;

   crud.get(path, auth, function (err, app_perms) {

      app_perms = JSON.parse(app_perms)

      for ( var i = 0; i < app_perms.length; i++ ){
         var e = app_perms[i]
         if ("object" === e.type && objPerms.id === e.ref){
            delete app_perms[i]
         }
      }

      for ( var i = 0; i < objPerms.permissions.length; i++ ){
         objPerms.permissions[i].access_level = "CLOUDLET"
         objPerms.permissions[i].type         = "object"
         app_perms.push(objPerms.permissions[i])
      }

      persistPerms(req, res, {permissions : app_perms})
   })

}


var isEmpty = function(s){
   if (undefined === s || null === s || "" === s){
      return true
   }
   return false
}


var persistPerms = function(req, res, appPerms){

   var cid     = req.query.cid
   var api_key = req.query.api_key

   if (isEmpty(cid) || isEmpty(api_key)){
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
         "error" : "required parameter is missing"
      }));
      return
   }

   var path = "https://127.0.0.1:8443/api/v1/permissions/" + cid + "/" + api_key;
   var data = appPerms.permissions;
   var auth = req.signedCookies.session;

   crud.post(path, data, auth, function (err, result) {
      //console.log(err)
      //console.log(result)
      if (err){
         res.setHeader('Content-Type', 'application/json');
         res.end(JSON.stringify({
            "error" : "" + err
         }));
         return
      }
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