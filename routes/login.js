var request = require('request');
var jwt = require('jsonwebtoken');
var auth = require('../libs/auth');

var express = require('express');
var router = express.Router();

// GET route to get access to the login site
router.get('/', function(req, res)
{
  res.render('login');
});

// POST route to login
router.post('/', function(req, res)
{
  if(!req.body.username || !req.body.password)
  {
    res.redirect(400,'/');
    return;
  }

  auth.createSession(req.body.username, req.body.password, function(err, body)
  {
    if(err)
    {
      console.error(err);
      res.redirect(401,'/');
      return;
    }
     console.log(body);
    res.cookie('session', body.session, {maxAge: 1800000/* 30min */, httpOnly: true, path: '/user', signed: true});
    res.redirect(301,'/user');
  });


});

module.exports = router;
