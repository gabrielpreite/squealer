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
    var expireTime = time + 1000*36000
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