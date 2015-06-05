'use strict'

var when 				= require('when'),
	uuid 				= require('node-uuid'),
	nodemailer 			= require('nodemailer');

// ---------------------------------------------------------------------------
/*
 *	-= SMTP connection Pooling example =-
 * If you need to send a large amout of e-mails via smtp.
 * This smtp pooling would be a good solution.
 */
 /*
 var smtpPool 	= require('nodemailer-smtp-pool');

 var transport = nodemailer.createTransport(smtpPool({
    host: 'localhost',
    port: 25,
    auth: {
        user: 'username',
        pass: 'password'
    },
    // use up to 5 parallel connections
    maxConnections: 5,
    // do not send more than 10 messages per connection
    maxMessages: 10,
    // no not send more than 5 messages in a second
    rateLimit: 5
}));
*/

// ---------------------------------------------------------------------------
/*
 *					-= sendmail tranport for nodemailer =-
 *	If you want to send the verification mails via the sendmail command. 
 *	Example givin below.
 */
/*
var sendmailTransport 	= require('nodemailer-sendmail-transport');

var transporter = nodemailer.createTransport(sendmailTransport({
    path: '/usr/share/sendmail',
    args: [
    	"-f",
    	"verify@peat-platform.org"
    ]
}));
*/


// ---------------------------------------------------------------------------

var senderMail = 'verify.test.openi@gmail.com';

// create reusable transporter object using SMTP transport. 
// NB! No need to recreate the transporter object. You can use 
// the same transporter object for all e-mails
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: senderMail,
        pass: '0p3n1Pe4t'
    }
}); 
 

/*
 *	create unique hash and timestamp for activation email. Sign user with "activated = false".
 */
var generateVerificationSet = function( username, usermail ) 
{
      return when.promise(function(resolve, reject) {
		var verificationSet = 
		{
			activated : false,						// activation flag 
			user : username,						// username of user
			mail : usermail,							// user mail adress
			timestamp : new Date().getTime(),		// actual time in milis
			token : uuid.v4() 						// Simple generation of RFC4122 UUIDS, v4 = (random) id, v1 = (timebased) id
		};

		// TODO !!!  Write 2 DB -> ( user, mail, timestamp, token, activated ); !!! 

		if( /* write 2 DB is ready */ true )
		{
			resolve( verificationSet );	
		} else {
			reject( /*nastyError*/ );
		}
	});      
};

/*
 * build up and send mail to registered user email with unique activation url.
 */
var sendVerificationMail = function( verificationSet ) 
{
	// unique verification url for mail verification / account activation
	var userVerificationURL = 'localhost:3000' + '/verify/'+verificationSet.token;

	// An example users object with formatted email function
	var verifyUser = {
		email: verificationSet.mail,
		subject: '✔ Please verify your email - PEAT platform',
		html: 	'<b>Hello '+verificationSet.user+' ✔</b>,'+
				'</br>'+
				'<p>Please Confirm your E-mail by clicking the link below.</p>'+
				'<a href="'+userVerificationURL+'">'+userVerificationURL+'</a>' // html body,
	};


	transporter.sendMail({
		from: 'Peat-platform Verification<'+senderMail+'>',		// sender address
		to: verifyUser.email,									// receiver mail
		subject: verifyUser.subject,							// mail subject
		html: verifyUser.html									// html body
	}, function(err, info) {
		if (err) {
			console.log(err);
		} else {
			console.log('Message sent: ' + info.response);
		}
	});
}

module.exports.generateVerificationSet = generateVerificationSet;
module.exports.sendVerificationMail = sendVerificationMail;