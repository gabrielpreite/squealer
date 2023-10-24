//funzioni globali

function get_cookie_by_name(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
        return match[2]
    }
    else{
        return undefined
    }
}

function set_cookie(key, value) {
    var now = new Date()
    var time = now.getTime() 
                            //ore     giorni
    var expireTime = time + 1000*3600*24*14
    now.setTime(expireTime)
    document.cookie = key+"="+value+"; expires="+now.toUTCString()
}

function delete_cookie(key) {
    document.cookie = key+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC"
}

function redirectToEditor() {
    window.location.href = "/editor";
}

function redirectToSettings() {
    window.location.href = "/settings";
}

function redirectToHome() {
    window.location.href = "/";
}

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp);
    var year = a.getFullYear();
    var month = a.getMonth();
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + '/' + month + '/' + year + ' ' + hour + ':' + min;
    return time;
}