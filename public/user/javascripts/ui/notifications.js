
DASHBOARD.notify = (function() {
    var currentNotifications = [];
    var c = 0;
    return function(msg,type,fixed,timeout) {
        if (currentNotifications.length > 4) {
            var ll = currentNotifications.length;
            for (var i = 0;ll > 4 && i<currentNotifications.length;i+=1) {
                var n = currentNotifications[i];
                if (!n.fixed) {
                    window.clearTimeout(n.timeoutid);
                    n.close();
                    ll -= 1;
                }
            }
        }
        var n = document.createElement("div");
        n.id="dashboard-notification-"+c;
        n.className = "alert";
        n.fixed = fixed;
        if (type) {
            n.className = "alert alert-"+type;
        }
        n.style.display = "none";
        n.innerHTML = msg;
        $("#notifications").append(n);
        $(n).slideDown(300);
        n.close = function() {
            var nn = n;
            return function() {
                currentNotifications.splice(currentNotifications.indexOf(nn),1);
                $(nn).slideUp(300, function() {
                        nn.parentNode.removeChild(nn);
                });
            };
        }();
        if (!fixed) {
            n.timeoutid = window.setTimeout(n.close,timeout||3000);
        }
        currentNotifications.push(n);
        c+=1;
        return n;
    }
})();