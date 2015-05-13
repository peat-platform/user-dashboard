/**
 * Created by sspatharioti on 3/6/2015.
 */


$(" #logout").click(function () {


    var link = document.getElementById("redlink");
    //alert(link.innerHTML);
    location.replace(link.innerHTML);

});