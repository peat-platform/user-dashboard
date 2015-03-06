var request = require('request');

var base = 'https://' + '127.0.0.1' + ':443/api/v1';

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

function search(with_property, property_filter, type, id_only, offset, limit, session, cb)
{
	crud('GET', base + '/search?with_property='+with_property
						+'&property_filter='+property_filter
						+'&type='+type+'&id_only='+id_only
						+'&offset='+offset+'&limit='+limit, null, session, cb);
}


module.exports.search = search;
module.exports.base = base;