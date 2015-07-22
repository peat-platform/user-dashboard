var jwt       = require('jsonwebtoken');
var config    = require('../libs/config');
var permsLib  = require('../libs/perms');
var crud      = require('../libs/crud');
var deepEqual  = require('deep-equal');


var arrEq = function(a, b){
   var onlyInA = a.filter(function(current){
      return b.filter(function(current_b){
            var b = false;
            if (current_b.type === "service_enabler" ) {
               b = ( current_b.cloudlet == current.cloudlet &&  current_b.app_id == current.app_id )
            }
            else{
               b = ( current_b.access_type == current.access_type &&  current_b.access_level == current.access_level )
            }
            return current_b.ref == current.ref && current_b.type == current.type && b
         }).length == 0
   });

   var onlyInB = b.filter(function(current){
      return a.filter(function(current_a){
            var b = false;
            if (current_a.type === "service_enabler" ) {
               b = ( current_a.cloudlet == current.cloudlet &&  current_a.app_id == current.app_id )
            }
            else{
               b = ( current_a.access_type == current.access_type &&  current_a.access_level == current.access_level )
            }
            return current_a.ref == current.ref && current_a.type == current.type && b
         }).length == 0
   });

   var result = onlyInA.concat(onlyInB);

   return ( result.length === 0 ) ? true : false
}

module.exports = function (cmd_args) {

   var user_dash_public_key = cmd_args.auth_server_public_key.replace(/'/g, "").replace(/"/g, '').replace(/\\n/g, "\n");

   return function (req, res, next) {

      //console.log("---=" + req)

      jwt.verify(req.signedCookies.session, user_dash_public_key, function (err, decoded) {

         if ( err ) {
            res.render('/user/login')
         }
         else {
            var url = "https://127.0.0.1:8443/api/v1/permissions/" + req.query.cid + "/" + req.query.api_key;
            var auth = req.signedCookies.session;

            crud.get(url, auth, function (err, user_app_perms, body) {

               var perms = JSON.parse(user_app_perms)

               var path = "https://127.0.0.1:8443/api/v1/app_permissions_latest/" + req.query.api_key;

               crud.get(path, auth, function (err, app_perms) {

                  app_perms = JSON.parse(app_perms)


                  var reset = !arrEq(perms, app_perms.result[0].permissions)
                  var empty = 0 === perms.length

                  var tmp = app_perms

                  tmp.result[0].permissions = perms

                  var permsHTML = permsLib.renderPerms(tmp, tmp.result[0].service_enablers)

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
