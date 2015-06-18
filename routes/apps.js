var request = require('request');
var crud = require('../libs/crud');
var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('../libs/config');
var router = express.Router();
var couchbase = require('couchbase');

var cluster;
var dbs = {};

var getDbLazy = function (name, cb) {


   if ( cluster == undefined ) {
      cluster = new couchbase.Cluster('couchbase://localhost');
   }

   if ( name === 'query' ) {
      name = 'object';
   }

   if ( dbs[name] === undefined ) {
      dbs[name] = cluster.openBucket(name, function () {
         cb(dbs[name])
      });
   }
   else {
      cb(dbs[name])
   }

   return dbs[name];
};

module.exports = function (cmd_args) {

   var seckeyenc = cmd_args.seckeyenc;
   var user_dash_public_key = cmd_args.auth_server_public_key.replace(/'/g, "").replace(/"/g, '').replace(/\\n/g, "\n");

   return function (req, res, next) {

      jwt.verify(req.signedCookies.session, user_dash_public_key, function (err, decoded) {

         if ( err ) {
            res.render('/user/login')
         }
         else {

            //var cid = 'c_01dda1c6b53189d214d70109ef8871da'

            var cid = decoded.cloudlet;
            var url = 'http://localhost:8092/permissions/_design/permissions_views/_view/list_permissions_for_cloudlet?startkey=%5B%22' + cid + '%22%5D&endkey=%5B%22' + cid + '%5E%22%5D&inclusive_end=false&reduce=false&stale=false&connection_timeout=60000&limit=10&skip=0';

            crud.crud("GET", url, {}, function (err, body) {

               if ( err ) {
                  res.render('apps_dashboard', {
                     'user'    : decoded.user_id,
                     'cloudlet': decoded.cloudlet,
                     'session' : req.signedCookies.session,
                     'clients' : []
                  });
               }
               else {
                  var clients       = [];
                  var keys          = [];
                  var clients_perms = {};
                  //{name : "Sample App"}, {name : "Family Budget Tracker"}

                  console.log("body", body)

                  for ( var i = 0; i < body.rows.length; i++ ) {
                     var client_id = body.rows[i].key[2];
                     if ( undefined !== client_id && null !== client_id ) {
                        keys.push("clients_" + client_id);
                        clients_perms[client_id] = body.rows[i].value
                     }
                  }

                  if ( 0 === keys.length ) {
                     res.render('apps_dashboard', {
                        'user'    : decoded.user_id,
                        'cloudlet': decoded.cloudlet,
                        'session' : req.signedCookies.session,
                        'clients' : []
                     });

                     return
                  }

                  console.log("clients_perms", clients_perms)

                  getDbLazy("clients", function (db_use, err) {
                     db_use.getMulti(keys, function (err, result) {
                        if ( err ) {
                           //callback(null, { 'error': 'Error creating entity: exists'}, HTTPStatus.CONFLICT);
                           //return;
                           console.log(error)
                        }

                        for ( var i in result ) {
                           var r = result[i];
                           var c = r.value;

                           c.perms = clients_perms[c.api_key];

                           delete c.secret;
                           //delete c.api_key;
                           //delete c.cloudlet;

                           clients.push(c)
                        }


                        res.render('apps_dashboard', {
                           'user'    : decoded.user_id,
                           'cloudlet': decoded.cloudlet,
                           'session' : req.signedCookies.session,
                           'clients' : clients
                        });
                     });
                  })
               }

            })
         }
      });
   };
};
