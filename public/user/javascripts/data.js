var selectedCloudlet = '';

var typeCache = {}


$('#typesmain ul li a').click(function(){

   var id    = $(this).attr('name');
   var auth  = $("#session").val();
   var cloud = $("#cloudlet").val();

   $("#displayContainer").hide()
   $("#id_list").html("");

   $.ajax({
      url: '/api/v1/objects?type=' + id + "&id_only=true&limit=100",
      type: 'GET',
      data: {},
      headers: {
         "Content-Type"  : "application/json",
         "Authorization" : auth
      },
      dataType: 'json',
      success: function (data) {
         for ( var i = 0; i < data.result.length; i++){
            var id = data.result[i]['@id'][1];
            $("#id_list").append('<li><a href="#" name="' + id + '"></a></li>' );
         }

         updateEntryIds();
         $("ul#id_list li a").click(display_object_function)
         clickFirstIfSingle("#id_list li a")
      },
      error: function (data) {
         console.log(data)
      }
   });

   return false
});


var idToStr = function(id){
   var hex       = id.substring(1,13).replace('-', '')
   var timeStamp = parseInt(hex, 16)
   var date      = new Date(timeStamp)
   var dateStr   = date.toLocaleString()

   return "Entry: " + dateStr.substring(0, dateStr.length -3)
}


var updateEntryIds = function(){
   $("#id_list li a").each(function(){
      var elm       = $(this);
      var id        = elm.attr('name')
      var display   = idToStr(id)
      elm.html(display)
   })
}


var clickFirstIfSingle = function(id){
   var arr = $(id)
   if (1 === arr.length){
      arr[0].click()
   }
}


$(window).load(function(){
   $('#typesmain ul li a').each(function(){
      var obj    = $(this)
      var typeId = obj.attr('name')

      if (undefined !== typeCache[typeId]){
         return typeCache[typeId]
      }

      $.ajax({
         url: '/api/v1/types/' + typeId,
         type: 'GET',
         data: {},
         headers: {
            "Content-Type"  : "application/json"
         },
         dataType: 'json',
         success: function (data) {
            typeCache[typeId] = data
            obj.html(data['@reference'])
         },
         error: function (data) {
            obj.html(typeId)
         }
      });
   })

   clickFirstIfSingle('#typesmain ul li a')
})

var typeMemberToContext = function(type){
   var mapping = {}
   for (var i = 0; i < type['@context'].length; i++){
      var ce = type['@context'][i]
      mapping[ce['@property_name']] = ce['@context_id']
   }
   return mapping;
}

var getEditButtonHTML = function(obj_id, app_cid, app_id, perms){
   return '<div class="btn-group btn-group-sm">' +
   '<button type="button" class="btn editPermsButton" data="' + obj_id + "+" + app_cid + "+" + app_id + '" perms="' +
      perms +
   '" >Modify</button></div>'
}

var display_object_function = function(){

   var id    = $(this).attr('name');
   var auth  = $("#session").val();
   var cloud = $("#cloudlet").val();

   $.ajax({
      url: '/user/ajax/objects/' + cloud + "/" + id ,
      type: 'GET',
      data: {},
      headers: {
         "Content-Type"  : "application/json",
         "Authorization" : auth
      },
      dataType: 'json',
      success: function (resp) {
         //$("#data").html("asdf")
         var data  = resp.obj
         var meta  = resp.meta
         var perms = resp.perms


         $("#displayContainer").show()

         var type         = typeCache[data['@openi_type']]
         var type_mapping = typeMemberToContext(type)

         $("#displayedEntryTitle").html(type['@reference'] + " (" + idToStr(id) + ")")
         $("#displayedEntryTitle").attr('name', id)

         $('#data_table tbody').html('')
         $('#data_table_meta tbody').html('')
         $('#data_table_perms tbody').html('')

         for ( var i in data['@data']){
            $('#data_table > tbody:last').append('<tr><td>' + type_mapping[i] +'</td><td>'+ data['@data'][i] +'</td></tr>');
         }
         $('#data_table').bootstrapTable()


         for ( var i in meta){
            $('#data_table_meta > tbody:last').append('<tr><td>' + meta[i].key +'</td><td>'+ meta[i].value +'</td></tr>');
         }
         $('#data_table_meta').bootstrapTable()

         for ( var i in perms){
            $('#data_table_perms > tbody:last').append('<tr><td>' + perms[i].key +'</td><td>'+ perms[i].value +'</td><td>'+ getEditButtonHTML(id, perms[i].cid, perms[i].id, perms[i].value) +'</td></tr>');
         }

         $('#data_table_perms').bootstrapTable()

         $('.editPermsButton').click(function(){
            var button = $(this)
            var data   = button.attr('data')
            var perms  = button.attr('perms')

            var dataP = data.split("+")

            var obj_id = dataP[0]
            var cid_id = dataP[1]
            var app_id = dataP[2]

            var perms = perms.split(",")

            //console.log(obj_id, cid_id, app_id)
            //console.log(perms)

            var c = $.inArray("create", perms)
            var r = $.inArray("read",   perms)
            var u = $.inArray("update", perms)
            var d = $.inArray("delete", perms)

            var p = "<ul>"
            p += '<li><input style="list-style:none;" type="checkbox" name="create" value="create" checked="' + c + '"> create</li>'
            p += '<li><input style="list-style:none;" type="checkbox" name="read"   value="read"   checked="' + r + '"> read</li>'
            p += '<li><input style="list-style:none;" type="checkbox" name="update" value="update" checked="' + u + '"> update</li>'
            p += '<li><input style="list-style:none;" type="checkbox" name="delete" value="delete" checked="' + d + '"> delete</li>'
            p += "</ul>"

            $('#modifyModal').find('.modal-title').text('Modify Permissions')
            $('#modifyModal').find('.modal-body').html("Modifying permissions for a specific object may negatively effect your " +
               "user experience with that application. Please continue with caution.<br/><br/><br/>" + p)
            $('#modifyModal').find('.okay-button').html("Save")

            $('#modifyModal').modal('show');

         })
      },
      error: function (data) {
         console.log(data)
      }
   });

   return false
};


$("#deleteEntryButton").click(function(){
   var objId = $("#displayedEntryTitle").attr('name')

   $('#exampleModal').find('.modal-title').text('Delete Entry ' + idToStr(objId))
   $('#exampleModal').find('.modal-body').html("Deleting data outside of its application may negatively effect your " +
      "user experience with that application. Are you sure you want to delete this Data Entry?")
   $('#exampleModal').find('.okay-button').html("Delete")
   $('#exampleModal').modal('show');
})


$('#modifyModal .okay-button').click(function() {

   $('#modifyModal').modal('hide');
   console.log("Persist Changes")
   //check if different.
   //grab apt data then persist to backend.
});


$('#exampleModal .okay-button').click(function() {

   var objId = $("#displayedEntryTitle").attr('name')
   var auth  = $("#session").val();

   $.ajax({
      url: '/api/v1/objects/' + objId,
      type: 'DELETE',
      data: {},
      headers: {
         "Content-Type"  : "application/json",
         "Authorization" : auth
      },
      dataType: 'json',
      success: function (data) {
         $("#displayContainer").hide()
         $("#id_list li a[name='" + objId + "']").parent().remove()
         $('#exampleModal').modal('hide');
      },
      error: function (data) {
         //console.log(data)
         $('#exampleModal').modal('hide');
      }
   });


   $('#exampleModal').modal('hide');

});