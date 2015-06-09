var request = require('request');
var jwt = require('jsonwebtoken');
var auth = require('../libs/auth');

var express = require('express');
var router = express.Router();

// GET route to get access to the login site


module.exports = function (cmd_args) {

   router.get('/', function (req, res) {
      res.render('login');
   });

   router.post('/', function (req, res) {
      if ( !req.body.username || !req.body.password ) {
         res.render('login', { 'error': 'Incorrect credentials, please try again.' });
         return;
      }

      auth.createSession(req.body.username, req.body.password, function (err, body) {
         if ( err ) {
            console.error(err);
            res.render('login', { 'error': 'Login failure, please try again.' });
            return;
         }
         res.cookie('session', body.session, {
            maxAge  : 1800000/* 30min */,
            httpOnly: true,
            path    : '/user',
            signed  : true
         });
         res.redirect(301, '/user');
      });
   });

   return router
};
