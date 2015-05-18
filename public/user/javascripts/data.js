var selectedCloudlet = '';

var typeCache = {}


$('#typesmain ul li a').click(function(){

   var id    = $(this).attr('name');
   var auth  = $("#session").val();
   var cloud = $("#cloudlet").val();

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
            $("#id_list").append('<li><a href="#">' + id + '</a></li>' );
         }

         $("ul#id_list li a").click(display_object_function)
      },
      error: function (data) {
         console.log(data)
      }
   });

});


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
})

var typeMemberToContext = function(type){
   var mapping = {}
   for (var i = 0; i < type['@context'].length; i++){
      var ce = type['@context'][i]
      mapping[ce['@property_name']] = ce['@context_id']
   }
   return mapping;
}

var display_object_function = function(){

   var id   = $(this).html();
   var auth = $("#session").val();
   var cloud = $("#cloudlet").val();

   $.ajax({
      url: '/api/v1/objects/' + cloud + "/" + id ,
      type: 'GET',
      data: {},
      headers: {
         "Content-Type"  : "application/json",
         "Authorization" : auth
      },
      dataType: 'json',
      success: function (data) {
         //$("#data").html("asdf")
         $("#displayContainer").show()
         var type         = typeCache[data['@openi_type']]
         var type_mapping = typeMemberToContext(type)

         $("#displayedEntryTitle").html(type['@reference'] + " (" + id + ")")
         $("#displayedEntryTitle").attr('name', id)
         $('#data_table tbody').html('')
         for ( i in data['@data']){
            $('#data_table > tbody:last').append('<tr><td>' + type_mapping[i] +'</td><td>'+ data['@data'][i] +'</td></tr>');
         }
         $('#data_table').bootstrapTable()

         //$("#data").html(JSON.stringify(data['@data'], undefined, 2))
         //delete data['@data']
         //$("#meta_data").html(JSON.stringify(data, undefined, 2))
      },
      error: function (data) {
         console.log(data)
      }
   });

};


$("#deleteEntryButton").click(function(){
   var objId = $("#displayedEntryTitle").attr('name')

   $('#exampleModal').find('.modal-title').text('Delete ' + objId)
   $('#exampleModal').find('.modal-body').html("Deleting data outside of its application may negatively effect your " +
      "user experience with that application. Are you sure you want to delete this Data Entry?")

   $('#exampleModal').modal('show');
})


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
         $("#id_list li a:contains('" + objId + "')").parent().remove()
         $('#exampleModal').modal('hide');
      },
      error: function (data) {
         console.log(data)
         $('#exampleModal').modal('hide');
      }
   });


   $('#exampleModal').modal('hide');

});