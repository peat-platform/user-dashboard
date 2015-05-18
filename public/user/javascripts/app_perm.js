
/**
 * Created by nstasinos on 5/10/2014.
 */

function getURLparam(name) {
   if (name === (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search)) {
      return decodeURIComponent(name[1]);
   }
}


$(" #accept_permapp").click(function () {

   var dt = JSON.stringify({
      "all": 'yes'
   });

   $.ajax({
      type: "POST",
      url: "/auth/accept",
      contentType: "application/json",
      crossDomain: true,
      data: dt,
      success: function (res) {

         if (res.indexOf("OUST") == -1) {
            custAlert(res);
         }
         else {
            window.open(res, "_self");
         }
      },
      error: function (error) {
         console.log("failed with " + error.status);
      }

   });

});


$(" #cancel_permapp").click(function () {

   $.ajax({
      type: "POST",
      url: "/auth/cancel",
      contentType: "application/json",
      crossDomain: true,
      data: "",
      success: function (res) {

         if (res.indexOf("ERROR") != -1) {
            window.open(res, "_self")
         } else {
            window.open(res, "_self")
         }
      },
      error: function (error) {
         console.log("failed with " + error.status);
      }
   });

});

function custAlert(text) {
   $(".custAlert").text("").text(text);
   $("#alertBtn").click()
}

function setCookie(cname, cvalue, exdays) {
   var d = new Date();
   d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
   var expires = "expires=" + d.toUTCString();
   document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
   var name = cname + "=";
   var ca = document.cookie.split(';');
   for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' '){
         c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
         return c.substring(name.length, c.length);
      }
   }
   return "";
}


$(".moreDetails").click( function(){
      var but = $(this)
      if (but.html() === "More Details"){
         but.parent().find(".permissionsDetails").show();
         but.html("Hide Details")
      }
      else{
         but.parent().find(".permissionsDetails").hide();
         but.html("More Details")
      }
   }
);