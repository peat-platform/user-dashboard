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

function getCloudlets(session, cb)
{
	crud('GET', base + '/cloudlets', null, session, cb);
}

function getAllCloudlets(offset, limit, cb)
{
	crud('GET', base + '/cloudlets/all?offset='+offset+'&limit='+limit, null, cb);
}

module.exports.getCloudlets = getCloudlets;
module.exports.getAllCloudlets = getAllCloudlets;
module.exports.base = base;