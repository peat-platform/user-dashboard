
var DASHBOARD = (function() {

    /*
     *  Functionality of the logout-button in the navbar
     */
    //$('#btn-logout-nav').click(function(){
    //    logout();
    //    //$( "#logout-confirm-dialog" ).dialog( "open" );
    //});
    //
    //function logout(){
    //    var domain = location.host;
    //    alert(domain);
    //    $.ajax({
    //        type: "POST",
    //        url: "/user/logout"
    //    })
    //    .done(function( ) {
    //        alert('logged out');
    //        window.location.href = '/';
    //    });
    //}

    // example funtions for a dialog box and notifications

    /*$('#logout-confirm-dialog').dialog({
            title: "Confirm Logout",
            modal: true,
            autoOpen: false,
            width: 530,
            height: 230,
            buttons: [
                {
                    text: "Confirm Logout",
                    click: function() {
                        // POST logout to dashboard
                        logout();
                        $( this ).dialog( "close" );
                    }
                },
                {
                    text: "Cancel",
                    click: function() {
                        $( this ).dialog( "close" );
                    }
                }
            ]
    });

    function logout(){
        $.ajax({
            url:"logout",
            type: "POST",
        }).done(function(data,textStatus,xhr) {
            alert("POST logout done! wait for notifications.");
            DASHBOARD.notify("Successfully deployed","success");
        }).fail(function(xhr,textStatus,err) {
            if (xhr.responseText) {
                DASHBOARD.notify("<strong>Error</strong>: "+xhr.responseText,"error");
            } else {
                DASHBOARD.notify("<strong>Error</strong>: no response from server","error");
            }
        }).always(function() {
            // ? what about always
        });
    }*/



    /*
     *   next function block ...
     */



    // it's important to return {};
    // because of all other scripts 
    // who will extend var DASHBOARD
    // like /ui/notifications.js
    return {};
})();