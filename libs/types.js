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

function createType(propName, type, required, multiple, allowedValues, contextID, referenceURL, cb)
{
	crud('POST', base + '/types',	{
										"@context": [ //Developer specified array of object property description,
									  		{
										    	"@property_name": propName, // (String) name of the property in the object.
									    		"@data_type":     type, // the primitive type that the property will be validated against, see type
									    		"@required": required, // (true or false) specifies if the object can be created with or without this context entry.
									    		"@multiple": multiple, // (true or false) specifies if the property is an array or values or a single value.
									    		"@allowed_values": allowedValues, // this property limits the values that the property can be set to (e.g - [ "foo","bar","world"] )
									    		"@description": contextID // A context identifier for the property entry.
									  		}
										],
										"@reference": referenceURL, //Developer specified URL of the refernce type,
									}, cb);
}

function createMultipleTypes(session, id, cb)
{
	crud('PATCH', base + '/types', null, session, cb);
}

function listTypes(session)
{
	crud('GET', base + '/types', null, session, cb);
}

function getType(session, id, cb)
{
	crud('GET', base + '/types/' + id, null, session, cb);
}

function getTypesStats(session, id, cb)
{
	crud('GET', base + '/types/stats', null, session, cb);
}

module.exports.createType = createType;
module.exports.createMultipleTypes = createMultipleTypes;
module.exports.listTypes = listTypes;
module.exports.getType = getType;
module.exports.getTypesStats = getTypesStats;
module.exports.base = base;
