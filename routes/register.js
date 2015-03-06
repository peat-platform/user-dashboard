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
    res.redirect(400,'/');
    //res.send('respond with a resource');
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
