var when 		= require('when'),
	uuid 		= require('node-uuid'),
	nodemailer = require('nodemailer');

/*
 *	-= SMTP connection Pooling example =-
 * if you need to send a large amout of e-mails.
 
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

// create reusable transporter object using SMTP transport 
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: '',
        pass: ''
    }
}); 
// NB! No need to recreate the transporter object. You can use 
// the same transporter object for all e-mails 

/*
 *		1. create unique hash and timestamp for activation email. Sign user with "activated = false".
 *              (e.g. hash as unique user activation uri, timestamp for limited acceptance time for this hash, may 30min?)
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
 *          2. build up and send mail to registered user email with unique activation url.
 *              ( use nodemailer, configurate smtp or other transporttype, further mailoptions, ssl/starttls?, Mail render as HTML, Unicode )
 */
var sendVerificationMail = function( verificationSet, senderMail, userMail ) 
{ 

	// unique verification url for mail verification / account activation
	var userVerificationURL = 'localhost:3000' + '/verify/'+verificationSet.token;

	console.log( userVerificationURL );

	// setup e-mail data with unicode symbols 
	var mailOptions = {
	    from: senderMail, // sender address 
	    to: userMail, // list of receivers 
	    subject: '✔ Please verify your email to enter the PEAT platform', // Subject line 
	    text: 'Hello verificationSet.user, please verify your email by using this link. userVerificationURL ', // plaintext body 
	    html: '<b>Hello verificationSet.user ✔</b> <a>'+userVerificationURL+'</a>' // html body 
	};
	 
	// send mail with defined transport object 
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        console.log(error);
	    }else{
	        console.log('Message sent: ' + info.response);
	    }
	});
}

module.exports.generateVerificationSet = generateVerificationSet;
module.exports.sendVerificationMail = sendVerificationMail;