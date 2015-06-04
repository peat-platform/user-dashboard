var request = require('request');
var auth = require('../libs/auth');
var express = require('express');

var userVerification = require('../libs/userVerificationLib');

var router = express.Router();

// GET route to get the register site
router.get('/', function(req, res)
{
	res.render('register');
});

// POST route to register
router.post('/', function(req, res)
{

	if(!req.body.username || !req.body.email || !req.body.password)
	{
		res.render('login', {error : 'Missing username, email and/or password', register : true});
		//res.render('error', {error : 'Missing username and/or password'});
		//res.send('respond with a resource');
		return;
	}



	if (req.body.password.length < 8 || req.body.password.length > 80) {
		res.render('login', {error : 'The password length must be between 8 and 80 characters.'});
		return;
	}

	if( !validateEmail(req.body.email) ) 
	{
		res.render('login', {error : 'The email you entered must be a valid email adress.'});
		return;
	}

	 /*          1. create unique hash and timestamp for activation email. Sign user with "activated = false".
		 *              (e.g. hash as unique user activation uri, timestamp for limited acceptance time for this hash, may 30min?)

		 *          2. build up and send mail to registered user email with unique activation url.
		 *              ( use nodemailer, configurate smtp or other transporttype, further mailoptions, ssl/starttls?, Mail render as HTML, Unicode ) */
		 console.log('\n' + req.body.email + '\n');

		 var rootDomain = req.protocol +'://'+ req.hostname;

		userVerification.generateVerificationSet( req.body.username, req.body.email )
		.then( function( verificationSet )
		{
			userVerification.sendVerificationMail
			( 
				verificationSet,														// verification credentials
				'Sebastian Schmidt<sebastian.schmidt.business@gmail.com>',	// from - sender mail
				req.body.email 														// to - user mail
			);
		});
	
	/*auth.createUser(req.body.username, req.body.password, function(err, body)
	{
		if(err)
		{
			res.render('login', {error : 'An account with that username already exists.', register : true});
			//res.redirect(400,'/');
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
			res.cookie('session', body.session, {maxAge: 1800000/* 30min /, httpOnly: true, path: '/user', signed: true});
			res.redirect('/user');
		});
	});*/
});

// validate email adress
function validateEmail(email) {
	// another email regex
	// [a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?

	// email regex
	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	return re.test(email);
}

module.exports = router;
