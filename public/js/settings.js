function switch_settings(param){ //  DEPRECATA
    let settings = ["profilo", "account", "acquisti", "smm", "follow", "popolarita", "canali"]

    settings.forEach((el) =>{ //nascondo tutte le sezioni
        $("#"+el).attr("hidden", "true")
    })

    //visualizzo solo quella richiesta
    $("#"+param).removeAttr("hidden")
}

function update_smm(){
    const formData = new FormData(document.getElementById("update_smm"))

    if(formData.get("current_smm") === "Non ci sono SMM che gestiscono il tuo account")
        formData.set("current_smm", "null")
    if(formData.get("new_smm") === "")
        formData.set("new_smm", "null")

    //console.log(formData)

    fetch(`/user/${CURRENT_USER}/managed_by`, {
        method: "POST",
        body: formData,
    })
    .then((response) => {
        if (response.ok) {
        // The initial request was successful
        window.location.replace("https://site212251.tw.cs.unibo.it/settings");
        } else {
        throw new Error("Network response was not ok.");
        }
    })
}

function check_form() {
    if (document.getElementById("newEmail").value != '') {
        //check formato mail corretto (RFC 2822 standard email validation)
        var mailformat = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        if (!document.getElementById("newEmail").value.match(mailformat)) {
            alert("La nuova mail inserita non è valida");
            return false;
        }
    }

    //check password uguali
    if (document.getElementById("newPassword").value != document.getElementById("newCPassword").value) {
        alert("La nuova password e la conferma non corrispondono");
        return false;
    }

    return true;
}

function form_info() {
    const formData = new FormData(document.getElementById("form_info"))

    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/user/${CURRENT_USER}/settings`,
        headers: { },
        data: formData,
        processData: false,
        contentType: false,
        success: function (data, status, xhr) {
            console.log('data: ', data);
            redirectToSettings();
            alert("Modifiche salvate");
        },
        error: function (xhr, status, error) {
            if (xhr.status === 404) {
                alert("Errore username");
            }
        }
    });
}

function form_psw() {
    const formData = new FormData(document.getElementById("form_psw"))

    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/user/${CURRENT_USER}/settings`,
        headers: { },
        data: formData,
        processData: false,
        contentType: false,
        success: function (data, status, xhr) {
            console.log('data: ', data);
            redirectToSettings();
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert("La password inserita non è corretta");
            }
        }
    });
}

function cancella_canale(nome) {
  $.ajax({
      type: 'DELETE',
      dataType: "json",
      async: false,
      url: `https://site212251.tw.cs.unibo.it/channel/${nome}`,
      headers: { },
      success: function (data, status, xhr) {
        redirectToSettings();
      },
      error: function (xhr, status, error) {
          if (xhr.status === 404) {
              alert("Canale già non esistente");
          }
      }
  });
}