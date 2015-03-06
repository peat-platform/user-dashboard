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

function createObject(session, cloudletID, cb)
{
	crud('POST', base + '/objects/' + cloudletID, null, session, cb);
}

function getObjectOfCloudlet(session, cloudletID, objectID, cb)
{
	crud('GET', base + '/objects/' + cloudletID +'/' + objectID, null, session, cb);
}

function getAllObjectsOfCloudlet(session, cloudletID, cb)
{
	crud('GET', base + '/objects/' + cloudletID, null, session, cb);
}

function updateObject(session, cloudletID, objectID, revision, cb)
{
	crud('PUT', base + '/objects/' + cloudletID +'/' + objectID, null, session, cb);
}

function deleteObjectFromCloudlet(session, cloudletID, objectID, cb)
{
	crud('DELETE', base + '/objects/' + cloudletID +'/' + objectID, null, session, cb);
}

module.exports.createObject = createObject;
module.exports.getObjectOfCloudlet = getObjectOfCloudlet;
module.exports.getAllObjectsOfCloudlet = getAllObjectsOfCloudlet;
module.exports.updateObject = updateObject;
module.exports.deleteObjectFromCloudlet = deleteObjectFromCloudlet;
module.exports.base = base;