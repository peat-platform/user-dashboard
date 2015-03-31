/**
 * Created by dconway on 20/03/15.
 */

var request = require('request');

var base = 'https://' + '127.0.0.1' + ':443/api/v1';
//var base = '/api/v1';

function crud(method, uri, body, authorization, cb)
{
   request({
      method: method,
      uri: uri,
      json: body,
      headers: (authorization != null ? {'Authorization': authorization} : {}),
      strictSSL: false
   }, function (err, res, body)
   {
      if(body && body.error)
         err = body.error;
      cb(err, body);
   });
}
/*
* Gets the users subscriptions that have been created in their cloudlet.
 */
function getSubscriptions(session, cb)
{
   crud('GET', base + '/subscription', null, session, cb);
}

/*
* Gets a list of subscriptions that relate direction to the users cloudlet.
* i.e. cloudletId in subscription is users cloudletID.
 */
function getSubscribers(session, cb)
{
   console.log(base + '/subscribers');
   crud('GET', base + '/subscribers', null, session, cb);
}


module.exports.getSubscriptions = getSubscriptions;
module.exports.getSubscribers   = getSubscribers;
module.exports.base = base;