var selectedCloudlet = '';



$('.column-left ul li a').click(function(){

   var id   = $(this).html();
   var auth = $("#session").val();

   selectedCloudlet = id;

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
            console.log(id)
         }

         $("ul#id_list li a").click(display_object_function)
      },
      error: function (data) {
         console.log(data)
      }
   });

});

var display_object_function = function(){

   var id   = $(this).html();
   var auth = $("#session").val();

   $.ajax({
      url: '/api/v1/objects/' + selectedCloudlet + id ,
      type: 'GET',
      data: {},
      headers: {
         "Content-Type"  : "application/json",
         "Authorization" : auth
      },
      dataType: 'json',
      success: function (data) {
         console.log(data);
         //$("#data").html("asdf")
         $("#data").html(JSON.stringify(data, undefined, 2))
      },
      error: function (data) {
         console.err(data)
      }
   });

};