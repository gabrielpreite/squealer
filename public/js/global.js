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
    document.cookie = key+"="+value 
}