//var config = {};
var _ = require('lodash');
//var mysql = require('mysql');
//var debug = require('debug')('charts');
//var request = require('request');
var async = require('async');
var configs = {};

configs.piwikSQL = {};
configs.piwikSQL.host = 'localhost';
configs.piwikSQL.user = process.env.PIWIKSQL_USER || 'piwik';
configs.piwikSQL.password = process.env.PIWIKSQL_PASSWORD || 'password';
configs.piwikSQL.database = process.env.PIWIKSQL_DATABASE || 'piwik';
configs.piwikSQL.multipleStatements = 'true';
var mysql      = require('mysql');
var connection = mysql.createConnection(configs.piwikSQL);

//todo empty datatables seem to throw alerts, make this more graceful


//var token_auth = "a85d9a42aa63238dcd241b21a8f21e56";
var params = {};
var piwikToken;
var idSite;
var domain = "http://dev.openi-ict.eu:8888/piwik/";
//var appUrl = domain+'index.php?module=API&method=OpeniAppTracker.trackByApp&format=JSON&token_auth='+piwikToken+'&idSite='+idSite+'&period=month&date=today';
//var companyUrl = domain+'index.php?module=API&method=OpeniCompanyTracker.trackByCompany&format=JSON&token_auth='+token_auth+'&idSite=6&period=day&date=today';
//var objUrl = domain+'index.php?module=API&method=OpeniObjectTracker.getContentNames&format=JSON&token_auth='+token_auth+'&idSite=6&period=month&date=today';
//var locUrl = domain+'index.php?module=API&method=OpeniLocationTracker.trackByLocation&format=JSON&token_auth='+token_auth+'&idSite=6&period=month&date=today';
//debug('debugging');
//var visitUrl = domain+'index.php?module=API&method=API.get&format=JSON&idSite=6&period=day&date=2015-02-07,today&expanded=1&token_auth='+token_auth+'&filter_limit=30&columns=nb_visits';
//var appResults;
//var companyResults;
//var objResults;
//var locResults;
//var visitResults;

//http://dev.openi-ict.eu:8888/piwik/index.php?module=API&method=UsersManager.getTokenAuth&format=JSON&userLogin=c_482e0245ff645f09e769e139dae278c6@openi.com&md5Password=5f4dcc3b5aa765d61d8327deb882cf99
var request = require('request');
var jwt     = require('jsonwebtoken');
var crud    = require('../libs/crud');
var auth    = require('../libs/auth');
var config  = require('../libs/config');
var util    = require('util');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res)
{
   jwt.verify(req.signedCookies.session, config.key.verify, function (err, decoded) {

      if (err) {
         res.render('/user/login')
      }
      else {
         var login = decoded.cloudlet + '@openi.com';
         var password;

         function getPassword(params, callback) {
            connection.query('SELECT password FROM piwik_user WHERE login = ?', login, function(err, rows) {
               if (err) {
                  return callback(err);
               }
               params.password = rows[0].password;
               return callback(null, params);

            });
         }

         function getPiwikToken(params, callback) {
            var url = domain + 'index.php?module=API&method=UsersManager.getTokenAuth&format=JSON&userLogin='+login+'&md5Password='+params.password;
            request(url, function (error, response) {
               if (error) {
                  console.log('error');
               } else {
                  piwikToken = JSON.parse(response.body);
                  params.piwikToken = piwikToken.value;
                  console.log(piwikToken.value);
                  return callback(null, params);
               }
            });
         }

         function getIdSite(params, callback) {
            connection.query('SELECT idsite FROM piwik_site WHERE name = ?', login, function(err, rows) {
               if (err) {
                  return callback(err);
               }
               idsite = rows[0].idsite;
               params.idsite = rows[0].idsite;
               return callback(null, params);
               console.log(idsite);
            });
         }

         function appTrackerResults(params, callback) {
            var appUrl = domain+'index.php?module=API&method=OpeniAppTracker.trackByApp&format=JSON&token_auth='+params.piwikToken+'&idSite='+params.idsite+'&period=month&date=today';
            request(appUrl, function (error, response, body) {
               if (error) {
                  throw error;
               }

               params.appResults = _.values(JSON.parse(body));
               callback(null, params);

            });
         }

         function companyTrackerResults(params, callback) {
            var companyUrl = domain+'index.php?module=API&method=OpeniCompanyTracker.trackByCompany&format=JSON&token_auth='+params.piwikToken+'&idSite='+params.idsite+'&period=day&date=today';
            request(companyUrl, function (error, response, body) {
               if (error) {
                  throw error;
               }

               params.companyResults = _.values(JSON.parse(body));
               callback(null, params);

            });
         }

         function objTrackerResults(params, callback) {
            var objUrl = domain+'index.php?module=API&method=OpeniObjectTracker.getContentNames&format=JSON&token_auth='+params.piwikToken+'&idSite='+params.idsite+'&period=month&date=today';
            request(objUrl, function (error, response, body) {
               if (error) {
                  throw error;
               }

               params.objResults = _.values(JSON.parse(body));
               callback(null, params);

            });
         }

         function locTrackerResults(params, callback) {
            var locUrl = domain+'index.php?module=API&method=OpeniLocationTracker.trackByLocation&format=JSON&token_auth='+params.piwikToken+'&idSite='+params.idsite+'&period=month&date=today';
            request(locUrl, function (error, response, body) {
               if (error) {
                  throw error;
               }

               params.locResults = _.values(JSON.parse(body));
               callback(null, params);

            });
         }

         function visitTrackerResults(params, callback) {
            var visitUrl = domain+'index.php?module=API&method=API.get&format=JSON&idSite='+params.idsite+'&period=day&date=2015-02-07,today&expanded=1&token_auth='+params.piwikToken+'&filter_limit=30&columns=nb_visits';
            request(visitUrl, function (error, response, body) {
               if (error) {
                  throw error;
               }

               params.visitResults = JSON.parse(body);
               //console.log(JSON.parse(body));
               callback(null, params);

            });
         }

         async.waterfall([
               async.apply(getPassword, params),
               getPiwikToken,
               getIdSite,
               appTrackerResults,
               companyTrackerResults,
               objTrackerResults,
               locTrackerResults,
               visitTrackerResults
            ],
            function(err, result){
               if (err) {
                  console.log('Error: ' + err);
                  //connection.end();
               } else {
                  if (result) {
                     console.log(params);
                     //connection.end(function(err) {
                     //   if (err) {
                     //      console.log(err);
                     //   }
                     //});
                     auth.readClients(req.signedCookies.session, function(err, body)
                     {
                        res.render('charts', {user : decoded.user_id, 'clients': body.result, appResults: params.appResults, companyResults: params.companyResults, objResults: params.objResults, locResults: params.locResults, visitResults: params.visitResults});
                     });
                  }
               }
            });

         //var appUrl = domain+'index.php?module=API&method=OpeniAppTracker.trackByApp&format=JSON&token_auth='+piwikToken+'&idSite='+idSite+'&period=month&date=today';
         //console.log(appUrl);

         //auth.readClients(req.signedCookies.session, function(err, body)
         //{
         //   res.render('charts', {user : decoded.user_id, 'clients': body.result, appResults: params.appResults, companyResults: params.companyResults, objResults: params.objResults, locResults: params.locResults, visitResults: params.visitResults});
         //});
      }
   });


});

module.exports = router;



//exports.apps = function(req, res) {
//
//   function appTrackerResults(callback) {
//      request(appUrl, function (error, response, body) {
//         if (error) {
//            throw error;
//         }
//
//         appResults = _.values(JSON.parse(body));
//         callback(null);
//
//      });
//   }
//
//
//   function companyTrackerResults(callback) {
//      request(companyUrl, function (error, response, body) {
//         if (error) {
//            throw error;
//         }
//
//         companyResults = _.values(JSON.parse(body));
//         callback(null);
//
//      });
//   }
//
//   function objTrackerResults(callback) {
//      request(objUrl, function (error, response, body) {
//         if (error) {
//            throw error;
//         }
//
//         objResults = _.values(JSON.parse(body));
//         callback(null);
//
//      });
//   }
//
//   function locTrackerResults(callback) {
//      request(locUrl, function (error, response, body) {
//         if (error) {
//            throw error;
//         }
//
//         locResults = _.values(JSON.parse(body));
//         callback(null);
//
//      });
//   }
//
//   function visitTrackerResults(callback) {
//    var visitUrl = domain+'index.php?module=API&method=API.get&format=JSON&idSite=6&period=day&date=2015-02-07,today&expanded=1&token_auth='+token_auth+'&filter_limit=30&columns=nb_visits';
//      request(visitUrl, function (error, response, body) {
//         if (error) {
//            throw error;
//         }
//
//         visitResults = JSON.parse(body);
//         //console.log(JSON.parse(body));
//         callback(null);
//
//      });
//   }
//
//
//   async.series([
//         appTrackerResults,
//         companyTrackerResults,
//         objTrackerResults,
//         locTrackerResults,
//         visitTrackerResults
//      ],
//      function(err, result){
//         if (err) {
//            console.log('Error: ' + err);
//         } else {
//            if (result) {
//               res.render('charts', {appResults: appResults, companyResults: companyResults, objResults: objResults, locResults: locResults, visitResults: visitResults});
//            }
//         }
//      });
//};
