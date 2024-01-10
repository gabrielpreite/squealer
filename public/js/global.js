//funzioni globali
import Vue from 'vue'

function get_cookie_by_name(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
        return match[2]
    }
    else{
        return undefined
    }
}

function refresh_quota(){
    $.ajax({
        type: 'GET',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/user/${CURRENT_USER}/quota`,
        headers: { },
        success: function (data, status, xhr) {
          set_cookie("quota_g", data["data"]["quota"]["g"])
          set_cookie("quota_s", data["data"]["quota"]["s"])
          set_cookie("quota_m", data["data"]["quota"]["m"])
        }
    });
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

function logout() {
    window.location.href = "/logout";
}

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp);
    var year = a.getFullYear();
    var month = a.getMonth()+1;
    if (month < 10) {
        month = '0' + month;
    }
    var date = a.getDate();
    if (date < 10) {
        date = '0' + date;
    }
    var hour = a.getHours();
    if (hour < 10) {
        hour = '0' + hour;
    }
    var min = a.getMinutes();
    if (min < 10) {
        min = '0' + min;
    }
    var time = date + '/' + month + '/' + year + ' ' + hour + ':' + min;
    return time;
}

function convertiTimestampInData(unixTimestamp) {
  const data = new Date(unixTimestamp);

  const anno = data.getFullYear();
  const mese = String(data.getMonth() + 1).padStart(2, '0');
  const giorno = String(data.getDate()).padStart(2, '0');

  const dataNelFormatoDesiderato = `${anno}-${mese}-${giorno}`;

  return dataNelFormatoDesiderato;
}
