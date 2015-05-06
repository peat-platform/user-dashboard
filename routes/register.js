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
router.post('/', function(req, res)
{
  if(!req.body.username || !req.body.password)
  {
     res.render('register', {error : 'Missing username and/or password'});
     //res.render('error', {error : 'Missing username and/or password'});
    //res.send('respond with a resource');
    return;
  }



   if (req.body.password.length < 8 || req.body.password.length > 80) {
      res.render('register', {error : 'The password length must be between 6 and 80 characters.'});
      return;
   }
  
  auth.createUser(req.body.username, req.body.password, function(err, body)
  {
    if(err)
    {
      console.error(err);
      res.redirect(400,'/');
      return;
    }

    auth.createSession(req.body.username, req.body.password, function(err, body)
    {
      if(err)
      {
        console.error(err);
        res.redirect(400,'/');
        return;
      }
      res.cookie('session', body.session, {maxAge: 1800000/* 30min */, httpOnly: true, path: '/user', signed: true});
      res.redirect('/user');
    });
  });
});

module.exports = router;
