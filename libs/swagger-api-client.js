/*************************************************
*												 *
*	This script is just a test script to dyn-	 *
*	amicly fetch and access the API endpoints	 *
*	of the OPENi project. But without CORS on 	 *
*	API server-side this script has no access.	 *
*												 *
*************************************************/

var client = require("swagger-client")

var swagger = new client.SwaggerClient({
url: 'https://localhost/api-spec/v1/simple_auth',
success: function() {
  console.log( 'swagger works!' );
},
failure: function() {
  console.log( 'error in swagger client' );
}
});

module.exports.login = swagger.apis.simple_auth.login({username:'sse',password:'1qay2wsx'});