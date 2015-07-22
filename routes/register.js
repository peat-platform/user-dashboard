var request = require('request');
var auth = require('../libs/auth');
var express = require('express');
var router = express.Router();

// GET route to get the register site
router.get('/', function(req, res)
{
  res.render('register');
});

// POST route to register
module.exports = function(cmd_args) {

  return function (req, res, next) {

    if ( !req.body.username || !req.body.password ) {
      res.render('login', { error: 'Missing username and/or password', register: true });
      //res.render('error', {error : 'Missing username and/or password'});
      //res.send('respond with a resource');
      return;
    }


    if ( req.body.password.length < 8 || req.body.password.length > 80 ) {
      res.render('login', { error: 'The password length must be between 6 and 80 characters.' });
      return;
    }

    auth.createUser(req.body.username, req.body.password, function (err, body) {
      if ( err ) {
        res.render('login', { error: 'An account with that username already exists.', register: true });
        //res.redirect(400,'/');
        return;
      }

      auth.createSession(req.body.username, req.body.password, function (err, body) {
        if ( err ) {
          console.error("Create Session Error: " + err);
          res.redirect(400, '/');
          return;
        }
        res.cookie('session', body.session, {
          maxAge  : 1800000/* 30min */,
          httpOnly: true,
          path    : '/user',
          signed  : true
        });
        res.redirect('/user');
      });
    });
  };
};

