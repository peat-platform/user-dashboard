

$(window).load(function(){

   $(".viewPermissions").click(function(){

      var but = $(this)
      but.prop('disabled', true);

      var api_key  = but.attr("api_key")
      var cid      = but.attr("cid")

      var url = "/user/permissions/?api_key=" + api_key + "&cid=" + cid

      $(location).attr('href', url);
   })
})

