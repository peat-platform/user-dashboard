var typePatternMatch         = new RegExp(/^t_[a-z0-9]{32}-[0-9]{1,10000}$/);

var isTypeId = function(path){

   return typePatternMatch.test(path);

};

function getTypes2(dat) {

   var types = {};
   dat.forEach(function (obj) {
      if (null === obj){
         return;
      }
      types[obj["@reference"]] = obj
      types[obj["@id"]]        = obj
   });

   return types;
}


var isArr = function(obj){
   return Object.prototype.toString.call( someVar ) === '[object Array]'
}


var isObj = function(obj){
   return typeof obj === 'object'
}

var objToHTML2 = function(obj){
   var html = "<ul>";
   for (var i in obj){
      var name = i;
      var val  = obj[i]
      html += "<li>" + name + "</li><ul>"
      for (var j = 0; j < val.length; j++){
         if (isObj(val[j])){
            html += objToHTML(val[j])
         }
         else{
            html += "<li>" + val[j] + "</li>"
         }
      }
      html += '</ul>'
   }
   html += "</ul>"
   return html
}


var objToHTML = function(val){
   var html = "";

   html += "<li>" + val["@reference"] + "</li><ul>"

   for (var j = 0; j < val["@context"].length; j++){
      if (isObj(val["@context"][j]['@openi_type'])){
         html += objToHTML(val["@context"][j]['@openi_type'])
      }
      else{
         html += "<li>" + val["@context"][j]['@context_id'] + "</li>"
      }
   }
   html += '</ul>'

   return html
}


var typeHasSubType = function(type){
   for (var i = 0; i < type['@context'].length; i++){

      if ( isTypeId(type['@context'][i]['@openi_type']) ){
         return true;
      }
   }
   return false;
}


var allSubTypesInProcessed = function(type, processed){
   for (var i = 0; i < type['@context'].length; i++){

      var primType = type['@context'][i]['@openi_type']

      if (isTypeId(primType) && undefined === processed[primType]){
         return false
      }
   }
   return true;
}


var getProps = function(type){
   var props = []
   for (var i = 0; i < type['@context'].length; i++){
      props.push(type['@context'][i]['@context_id'])
   }
   return props;
}


var organiseTypes = function(types, showjson, key){

   var sanityCheck = 0;
   var processed   = {}

   var trucking = true;

   while (trucking && sanityCheck++ < 200){

      trucking = false;

      for (var name in types){

         if (!isTypeId(name)){
            delete types[name]
            continue;
         }

         var type = types[name]

         if (typeHasSubType(type)){
            trucking = true;
            if(allSubTypesInProcessed(type, processed)){
               for (var i = 0; i < type['@context'].length; i++){
                  var entry = type['@context'][i]
                  var cname = entry['@openi_type']
                  if(isTypeId(cname)){
                     if (undefined !== processed[cname]){
                        types[name]['@context'][i]['@openi_type'] = types[cname]
                        var id                                    = entry['@openi_type']
                        delete types[cname]
                        delete showjson[cname]
                     }
                  }
               }
            }
         }
         else{
            processed[name] = getProps(type)
         }
      }
   }
}


var printObjectMembers = function(types, key){

   var html = "<ul>"

   for (var name in types) {
      if (key === name) {
         var type = types[name]
         html += objToHTML(type)
      }
   }

   html += "</ul>"

   return html
}

var extractMembers2 = function(type){

   var arr = []
   for(c in type['@context']){
      var entry = type['@context'][c];

      if (isTypeId(entry['@openi_type'])){
         var n = entry['@context_id']
         var o = { n : ["a", "b", "c"] }
         arr.push(o)
      }
      else{
         arr.push(entry['@context_id'])
      }
   }

   return arr;
}

var extractMembers = function(type){

   var arr = []
   for(var c in type['@context']){
      var entry = type['@context'][c];
      arr.push(entry['@context_id'])
   }

   return arr;
}


/*======================*/
/* get permissions page */
/*======================*/
var renderPerms = function(app_perms) {

   if (app_perms.result[0].hasOwnProperty("permissions")) {

      var app_perms = app_perms.result[0]

      //console.log(JSON.stringify(app_perms, null, 2))

      //prepare html string based on manifest
      var app_perms_html = '';
      var showjson       = {};
      var showjsonObj    = {}
      //USE getTypes for BASE 64

      if (app_perms.hasOwnProperty("types")) {

         var typesById = getTypes2(app_perms.types)

         app_perms.permissions.forEach(function (obj) {

            var type = typesById[obj.ref];

            if (undefined === type) {
               if (obj.type === "object"){
                  if (showjsonObj[obj.ref] === undefined) {
                     showjsonObj[obj.ref] = {}
                     showjsonObj[obj.ref].id    = obj.ref
                     showjsonObj[obj.ref].arr   = []
                  }
                  showjsonObj[obj.ref].arr.push(obj.access_type);
               }
               return;
            }

            var name = type['@reference']
            var id   = type['@id']

            if (typeof showjson[type['@id']] == 'undefined') {
               showjson[type['@id']] = {};
               showjson[type['@id']].name  = name
               showjson[type['@id']].id    = id
               showjson[type['@id']].arr   = []
               showjson[type['@id']].level = 'APP'
            }

            showjson[type['@id']].arr.push(obj.access_type);

            if (showjson[type['@id']].level === 'APP') {
               showjson[type['@id']].level = obj.access_level
            }

         });

         organiseTypes(typesById, showjson)

         var type_title = "<div class='acc_title'><h4>Data Types</h4></div>"

         for (var key in showjson) {

            if (type_title) {
               app_perms_html += type_title
               type_title = false
            }

            var entry = showjson[key]

            app_perms_html += '<div class="contA panel panel-default"><div class="panel-body"><div style="font-weight: bold">' + entry.name + '</div>';
            app_perms_html += (('APP' === showjson[key].level) ? '' : '<div>This app wants access to data in your account that are created by other apps.</div>' )
            app_perms_html += '<div class="permissionsDetails">';
            app_perms_html += '"' + entry.name + '" data entries contain the following information: ';

            //app_perms += organiseTypes(typesById, showjson, key)
            app_perms_html += printObjectMembers(typesById, key)

            app_perms_html += '<div class="type_access_requested">Type of access requested by this app:';
            app_perms_html += '<div class="opts">';

            var c    = -1 !== entry.arr.indexOf("CREATE")
            var r    = -1 !== entry.arr.indexOf("READ")
            var u    = -1 !== entry.arr.indexOf("UPDATE")
            var d    = -1 !== entry.arr.indexOf("DELETE")

            var datac = {id:entry.id, level : entry.level, action : "CREATE", type : "type" }
            var datar = {id:entry.id, level : entry.level, action : "READ",   type : "type" }
            var datau = {id:entry.id, level : entry.level, action : "UPDATE", type : "type" }
            var datad = {id:entry.id, level : entry.level, action : "DELETE", type : "type" }

            app_perms_html += '<input type="checkbox" name="perms" value=\'' + JSON.stringify(datac) + '\' ' + ((c) ? " checked " : "") +  '> CREATE <br/>';
            app_perms_html += '<input type="checkbox" name="perms" value=\'' + JSON.stringify(datar) + '\' ' + ((r) ? " checked " : "") +  '> READ   <br/>';
            app_perms_html += '<input type="checkbox" name="perms" value=\'' + JSON.stringify(datau) + '\' ' + ((u) ? " checked " : "") +  '> UPDATE <br/>';
            app_perms_html += '<input type="checkbox" name="perms" value=\'' + JSON.stringify(datad) + '\' ' + ((d) ? " checked " : "") +  '> DELETE <br/>';

            app_perms_html += '</div></div>';

            app_perms_html += '</div></div></div>';
         }

         var se_title = "<div class='acc_title'><h4>Service Enablers</h4></div>"

         for (var i = 0; i < app_perms.permissions.length; i++) {

            var perm = app_perms.permissions[i]

            if ('service_enabler' === perm.type) {

               if (se_title) {
                  app_perms_html += se_title
                  se_title = false
               }

               for (var j = 0; j < app_perms.service_enablers.length; j++) {
                  var se = app_perms.service_enablers[j]

                  if (se.name === perm.ref) {
                     //var datac = {id:entry.id, level :entry.level, action : "CREATE", type : "type" }
                     app_perms_html += '<div class="serviceEnablers panel panel-default"><div class="panel-body">'
                     app_perms_html += "<div style='font-weight: bold'><input type='checkbox' value='" + JSON.stringify(perm) + "' checked='checked'> " + se.name + "</div>"
                     app_perms_html += "<div class='permissionsDetails' style='display: block'>" + se.description + "</div>"
                     app_perms_html += "</div></div>"
                  }
               }
            }
         }

         var obj_title = "<div class='acc_title'><h4>Object Overrides</h4></div>"

         for (var id in showjsonObj){

            var entry = showjsonObj[id]

            if (obj_title) {
               app_perms_html += obj_title
               obj_title = false
            }


            app_perms_html += '<div class="contA panel panel-default"><div class="panel-body">'
            app_perms_html += "<div style='font-weight: bold'>" + id + "</div>"

            app_perms_html += '<div class="type_access_requested">Type of access requested by this app:';
            app_perms_html += '<div class="opts">';

            var c    = -1 !== entry.arr.indexOf("CREATE")
            var r    = -1 !== entry.arr.indexOf("READ")
            var u    = -1 !== entry.arr.indexOf("UPDATE")
            var d    = -1 !== entry.arr.indexOf("DELETE")

            var datac = {id:entry.id, level :"CLOUDLET", action : "CREATE", type : "object" }
            var datar = {id:entry.id, level :"CLOUDLET", action : "READ",   type : "object" }
            var datau = {id:entry.id, level :"CLOUDLET", action : "UPDATE", type : "object" }
            var datad = {id:entry.id, level :"CLOUDLET", action : "DELETE", type : "object" }

            app_perms_html += '<input type="checkbox" name="perms" value=\'' + JSON.stringify(datac) + '\' ' + ((c) ? " checked " : "") +  '> CREATE <br/>';
            app_perms_html += '<input type="checkbox" name="perms" value=\'' + JSON.stringify(datar) + '\' ' + ((r) ? " checked " : "") +  '> READ   <br/>';
            app_perms_html += '<input type="checkbox" name="perms" value=\'' + JSON.stringify(datau) + '\' ' + ((u) ? " checked " : "") +  '> UPDATE <br/>';
            app_perms_html += '<input type="checkbox" name="perms" value=\'' + JSON.stringify(datad) + '\' ' + ((d) ? " checked " : "") +  '> DELETE <br/>';
            app_perms_html += '<br/>'
            app_perms_html += '<input type="checkbox" name="remove_override" value=\'' + id + '\'> Remove Object Override <br/>';

            app_perms_html += "</div></div></div></div>"

         }

         for (var i = 0; i < app_perms.permissions.length; i++) {

            var perm = app_perms.permissions[i]

            if ('object' === perm.type){

            }
         }

         app_perms_html

         return app_perms_html;
      }
   }
}


module.exports.renderPerms = renderPerms;