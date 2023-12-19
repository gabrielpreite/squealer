function login(){
    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: "https://site212251.tw.cs.unibo.it/user/login",
        headers: { },
        data: { username: $("#username").val(), password: $("#password").val()},
        success: function (data, status, xhr) {
            console.log("successo login")
            window.location.replace("https://site212251.tw.cs.unibo.it/");
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                console.log("login fallito");
                alert("username/password errati")
            }
        }
    });
}