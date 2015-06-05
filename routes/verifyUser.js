var request 	= require('request');
var express 	= require('express');
var router 		= express.Router();

// GET route to get a user activated with the system
router.get('/:token', function(req, res)
{
	var username			= undefined,						// user from db
		usermail			= undefined,						// user mail from db
		token 				= req.params.token,				// verification code
		dbVerificationHash	= undefined, 						// verification code from db
		actualTime			= new Date().getTime(),			// timestamp of verification request
		dbTimestamp		= undefined;						// timestamp from db 

	if( token !== dbVerificationHash) 
	{ // ERROR: wrong hash
		res.render('verify', {error : 'No verification prozess found.', user : username});
		return;
	}

	if( (actualTime - dbTimestamp) > 900000 /* 15min */ ) 
	{ // ERROR: verification code expired
		res.render('verify', {error : 'Your verification code is expired.', user : username});
		return;
	}

	// TODO update user verification status in DB !!!
	// set:
	//	 activated = true;

	res.render('verify', { user : username });
});

module.exports = router;

