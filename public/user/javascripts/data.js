var selectedCloudlet = '';



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
      $.ajax({
         url: '/api/v1/types/' + typeId,
         type: 'GET',
         data: {},
         headers: {
            "Content-Type"  : "application/json"
         },
         dataType: 'json',
         success: function (data) {
            obj.html(data['@reference'])
         },
         error: function (data) {
            obj.html(typeId)
         }
      });
   })
})


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
         $("#data").html(JSON.stringify(data, undefined, 2))
      },
      error: function (data) {
         console.log(data)
      }
   });

};