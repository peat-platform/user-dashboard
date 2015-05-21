var request = require('request');

var base = 'https://' + '127.0.0.1' + ':443/api/v1/crud';

function crud(method, uri, body, cb, auth)
{

   var h = (undefined === auth ) ? {'Authorization': '29f81fe0-3097-4e39-975f-50c4bf8698c7'} : {'Authorization': auth};

   request({
		method: method,
		uri: uri,
		json: body,
		headers: h,
		strictSSL: false
	}, function (err, res, body)
	{
		if(body && body.error)
			err = body.error;
		cb(err, body);
	});
}

function readUserCloudlets(auth, cb){
	var cl = "https://127.0.0.1/api/v1/objects?group_level=3&reduce=true&alltypes=true";

	crud('GET', cl, null, cb, auth)
}

function create(db, json, cb)
{
	crud('POST', base + '/' + db, json, cb);
}

function createNamed(db, id, json, cb)
{
	crud('POST', base + '/' + db + '/' + id, json, cb);
}

function read(db, id, cb)
{
	crud('GET', base + '/' + db + '/' + id, null, cb);
}

function update(db, id, json, cb)
{
	crud('PUT', base + '/' + db + '/' + id, json, cb);
}

function remove(db, id, cb)
{
	crud('DELETE', base + '/' + db + '/' + id, null, cb);
}

function patch(db, id, json, cb)
{
	crud('PATCH', base + '/' + db + '/' + id, json, cb);
}

function upsert(db, id, json, cb)
{
	crud('POST', base + '/upsert/' + db + '/' + id, json, cb);
}

function query(query, cb)
{
	crud('POST', base + '/query', query, cb);
}

module.exports.crud = crud;
module.exports.create = create;
module.exports.createNamed = createNamed;
module.exports.read = read;
module.exports.readUserCloudlets = readUserCloudlets;
module.exports.update = update;
module.exports.remove = remove;
module.exports.patch = patch;
module.exports.upsert = upsert;
module.exports.query = query;
module.exports.base = base;