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

function login_app(){
    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: "https://site212251.tw.cs.unibo.it/user/login",
        headers: { },
        data: { username: $("#username").val(), password: $("#password").val()},
        success: function (data, status, xhr) {
            console.log("successo login")
            window.location.replace("https://site212251.tw.cs.unibo.it/app");
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                console.log("login fallito");
                alert("username/password errati")
            }
        }
    });
}

function register(){
    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: "https://site212251.tw.cs.unibo.it/user",
        headers: { },
        data: { username: $("#username").val(), password: $("#password").val(), email: $("#email").val(), nome: $("#nome").val(), cognome: $("#cognome").val()},
        success: function (data, status, xhr) {
            console.log("successo registrazione")
            window.location.replace("https://site212251.tw.cs.unibo.it/login");
        },
        error: function (xhr, status, error) {
            let reason = xhr.responseJSON.risultato
            console.log(reason)
            if (xhr.status === 400) {
                console.log("registrazione fallita");
                if(reason === "username esistente")
                    alert("Lo username scelto non è disponibile")
                else if(reason === "email esistente")
                    alert("L'indirizzo email inserito è già in uso")
            }
        }
    });
}

function register_app(){
    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: "https://site212251.tw.cs.unibo.it/user",
        headers: { },
        data: { username: $("#username").val(), password: $("#password").val(), email: $("#email").val(), nome: $("#nome").val(), cognome: $("#cognome").val()},
        success: function (data, status, xhr) {
            console.log("successo registrazione")
            window.location.replace("https://site212251.tw.cs.unibo.it/app-login");
        },
        error: function (xhr, status, error) {
            let reason = xhr.responseJSON.risultato
            console.log(reason)
            if (xhr.status === 400) {
                console.log("registrazione fallita");
                if(reason === "username esistente")
                    alert("Lo username scelto non è disponibile")
                else if(reason === "email esistente")
                    alert("L'indirizzo email inserito è già in uso")
            }
        }
    });
}