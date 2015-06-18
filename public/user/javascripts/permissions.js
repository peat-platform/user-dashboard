
$("#modifyPermsButton").click(function(){
   var but = $(this)
   var id  = but.attr("key")
   var cid = but.attr("cid")

   $('#exampleModal').find('.modal-title').text('Modify Permissions')
   $('#exampleModal').find('.modal-body').html("By altering these permissions your app may not function as the creator intended. " +
      "Are you sure you want to Continue?")


   $('#exampleModal .okay-button').html("Modify")

   var updatedPerms = []

   $('#exampleModal .okay-button').click(function(){

      $('#exampleModal .okay-button').click(function(){})

      $(".opts input").each(function(){
         var inp = $(this)
         if (inp.prop( "checked")){
            var p = JSON.parse(inp.val())

            updatedPerms.push({
               "ref"          : p.id,
               "type"         : p.type,
               "access_level" : p.level,
               "access_type"  : p.action
            })
         }
         else{
            //console.log("not", inp.val())
         }
      })

      var perms = {modify : true, permissions : updatedPerms}

      $.ajax({
         url: "/user/permsupdate?api_key=" + id + "&cid=" + cid,
         type: 'POST',
         data: JSON.stringify(perms),
         contentType: 'application/json; charset=utf-8',
         dataType: 'json',
         success: function(result){
            if (result.status === "ok"){
               $(location).attr('href', "/user/apps");
            }
            $('#exampleModal').modal('hide');
         }
      })
   })

   $('#exampleModal').modal('show');

})


$("#resetPermsButton").click(function(){
   var but = $(this)
   var id  = but.attr("key")
   var cid = but.attr("cid")

   $('#exampleModal').find('.modal-title').text('Reset Permissions')
   $('#exampleModal').find('.modal-body').html("Reset permissions to the application default. Are you sure you want to continue?")

   $('#exampleModal .okay-button').html("Reset")

   $('#exampleModal .okay-button').click(function(){
      $('#exampleModal .okay-button').click(function(){})
      $('#exampleModal').modal('hide');

      var perms = {reset : true}

      $.post("/user/permsupdate?api_key=" + id + "&cid=" + cid, perms, function(result){
         if (result.status === "ok"){
            $(location).attr('href', "/user/apps");
         }
         $('#exampleModal').modal('hide');
      });
   })

   $('#exampleModal').modal('show');

})


$("#revokePermsButton").click(function(){

   var but = $(this)
   var id  = but.attr("key")
   var cid = but.attr("cid")

   $('#exampleModal').find('.modal-title').text('Revoke Permissions')
   $('#exampleModal').find('.modal-body').html("By revoking these permissions your app may suffer from reduced functionality. " +
      "Are you sure you want to Continue?")

   $('#exampleModal .okay-button').html("Revoke")

   $('#exampleModal .okay-button').click(function(){

      $('#exampleModal .okay-button').click(function(){})

      //var perms = {"permissions" : []}
      var perms = {revoke : true}

      $.post("/user/permsupdate?api_key=" + id + "&cid=" + cid, perms, function(result){
         if (result.status === "ok"){
            $(location).attr('href', "/user/apps");
         }
         $('#exampleModal').modal('hide');
      });

   })

   $('#exampleModal').modal('show');
})

