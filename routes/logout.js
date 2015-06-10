var request = require('request');
var auth = require('../libs/auth');
var express = require('express');
var router = express.Router();

module.exports = function (cmd_args) {

   return function (req, res, next) {

      console.log('............');
      if ( !req.signedCookies.session ) {
         res.redirect('/');
         return;
      }

      auth.deleteSession(req.signedCookies.session, function (err, body) {
         if ( err ) {
            res.clearCookie('session', { maxAge: 1800000/* 30min */, httpOnly: true, path: '/user', signed: true });
            res.clearCookie('api_key', { maxAge: 1800000/* 30min */, httpOnly: true, path: '/user', signed: true });
            res.clearCookie('cloudlet', { maxAge: 1800000/* 30min */, httpOnly: true, path: '/user', signed: true });
            res.clearCookie('cloudletID', { maxAge: 1800000/* 30min */, httpOnly: true, path: '/user', signed: true });
            res.clearCookie('secret', { maxAge: 1800000/* 30min */, httpOnly: true, path: '/user', signed: true });
            res.redirect('/user');
            return;
         }
         console.log('delete cookie stuff');
         res.clearCookie('session', { maxAge: 1800000/* 30min */, httpOnly: true, path: '/user', signed: true });
         res.clearCookie('api_key', { maxAge: 1800000/* 30min */, httpOnly: true, path: '/user', signed: true });
         res.clearCookie('cloudlet', { maxAge: 1800000/* 30min */, httpOnly: true, path: '/user', signed: true });
         res.clearCookie('cloudletID', { maxAge: 1800000/* 30min */, httpOnly: true, path: '/user', signed: true });
         res.clearCookie('secret', { maxAge: 1800000/* 30min */, httpOnly: true, path: '/user', signed: true });
         res.redirect('/user');
      });
   };
};
