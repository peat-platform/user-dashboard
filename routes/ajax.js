var request   = require('request');
var jwt       = require('jsonwebtoken');
var crud      = require('../libs/crud');
var config    = require('../libs/config');
var couchbase = require('couchbase');


var objectPatternExtract     = new RegExp(/0[a-f,0-9]{7}-[a-f,0-9]{4}-4[a-f,0-9]{3}-[a-f,0-9]{4}-[a-f,0-9]{12}/);

var cluster;
var dbs = {};

var getDbLazy = function (name, cb) {

   if ( cluster == undefined ) {
      cluster = new couchbase.Cluster('couchbase://localhost');
   }

   if ( dbs[name] === undefined ) {
      dbs[name] = cluster.openBucket(name, function () {
         dbs[name].enableN1ql('localhost:8093');
         cb(dbs[name])
      });
   }
   else {
      cb(dbs[name])
   }

   return dbs[name];
};



var extractObjectId = function(path){

   var result = objectPatternExtract.exec(path);

   return (null !== result) ? result[0] : null;
};


var getDevName = function(cid, users){

   for (var i = 0; i < users.length; i++){
      if (cid === users[i].cloudlet){
         return users[i].developer
      }
   }

   return ""
}


var getAppName = function(id, apps){

   for (var i = 0; i < apps.length; i++){
      if (id === apps[i].id){
         return apps[i].name
      }
   }

   return ""
}


var getAppCloudlet = function(id, apps){

   for (var i = 0; i < apps.length; i++){
      if (id === apps[i].id){
         return apps[i].cloudlet
      }
   }

   return ""
}


var getAppPermsStr = function(id, perms){

   for (var i in perms){

      if (i === id){
         var vals = perms[i]
         var tmp  = []
         for (var j in vals){
            if (vals[j] === true){
               tmp.push(j)
            }
         }
         return tmp.join(", ")
         break;
      }
   }

   return ""
}


var dateToHRF = function(dateStr){

   //for (var i = 0; i < apps.length; i++){
   //   if (id === apps[i].id){
   //      return apps[i].name
   //   }
   //}
   var dateStr   = new Date(dateStr).toLocaleString()

   return dateStr.substring(0, dateStr.lastIndexOf(":"))

   return dateStr
}


module.exports = function (cmd_args) {

   var user_dash_public_key = cmd_args.auth_server_public_key.replace(/'/g, "").replace(/"/g, '').replace(/\\n/g, "\n");

   return function (req, res, next) {

      jwt.verify(req.signedCookies.session, user_dash_public_key, function (err, decoded) {

         if ( err || "session" !== decoded["openi-token-type"] || "user" !== decoded["scope"] ) {
            res.render('/admin/login')
         }
         else {

            var view_url = "https://localhost" + req.originalUrl.replace("/user/ajax/objects/", "/api/v1/objects/")


            crud.get(view_url, req.signedCookies.session, function (err, body) {

               if ( undefined !== err && null !== err ) {

                  res.setHeader('Content-Type', 'application/json');
                  res.end({ "error": err });
               }
               else {
                  var obj = JSON.parse(body);

                  getDbLazy("objects", function(db){

                     var sql = 'SELECT _permissions as perms FROM objects WHERE `@cloudlet` = "' + decoded["cloudlet"] + '" AND `@id` = "' + obj['@id'] + '" LIMIT 1'

                     var query = couchbase.N1qlQuery.fromString(sql);

                     db.query(query, function(err, result) {

                        //console.log("err",    err)
                        //console.log("result", JSON.stringify(result, null, 2))

                        var perms = result[0].perms

                        var c_ids   = []
                        var app_ids = []

                        for (var i in perms){
                           if (0 === i.indexOf("created_by")){
                              continue;
                           }
                           else if (0 === i.indexOf("c_")){
                              c_ids.push(i)
                           }
                           else{
                              app_ids.push(i)
                           }
                        }

                        getDbLazy("clients", function(db){
                           var clientSQL = 'SELECT api_key as id, name as name, cloudlet as cloudlet FROM clients where api_key in ["' + app_ids.join('", "') + '"]';

                           var query = couchbase.N1qlQuery.fromString(clientSQL);

                           db.query(query, function(err, client_result) {

                              getDbLazy("users", function(db){

                                 var devQuery = 'SELECT username as developer, cloudlet as cloudlet FROM users where cloudlet in ["' + c_ids.join('", "') + '"]';

                                 var query    = couchbase.N1qlQuery.fromString(devQuery);

                                 db.query(query, function(err, dev_result) {

                                    //console.log("result", JSON.stringify(client_result, null, 2))
                                    //console.log("result", JSON.stringify(dev_result, null, 2))
                                    //console.log("result", JSON.stringify(obj, null, 2))
                                    //console.log("result >>> ", dev_result)

                                    var meta = [
                                       { key : "Create by Developer:",   value : getDevName(perms.created_by, dev_result)},
                                       { key : "Create in Application:", value : getAppName(perms.created_by_app, client_result)},
                                       { key : "Create Date:",           value : dateToHRF(obj._date_created)},
                                       { key : "Last Modified:",         value : dateToHRF(obj._date_modified)}
                                    ]

                                    var perms_data = []

                                    for (var i in app_ids){
                                       var appId = app_ids[i]
                                       perms_data.push({ key : getAppName(appId, client_result),
                                          value : getAppPermsStr(appId, perms),
                                          cid   : getAppCloudlet(appId, client_result),
                                          id    : appId})
                                    }


                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({
                                       "obj"       : obj,
                                       "perms"     : perms_data,
                                       "meta"      : meta
                                    }));
                                 })
                              })
                           })
                        })
                     })
                  })
               }
            })
         }
      })

   }

};
