function switch_settings(param){
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

function seleziona_canale(tipo, nome){
  if (tipo === 'nuovo') {
    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/channel`,
        headers: { },
        data: {nome: nome, userid: CURRENT_USER, descrizione: '', ufficiale: 'false'},
        success: function (data, status, xhr) {
          redirectToSettings();
        },
        error: function (xhr, status, error) {
            if (xhr.status === 403) {
                alert("Nome del canale già esistente");
            }
        }
    });
  } else {
    var deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-danger";
    deleteButton.onclick = function() {
      cancella_canale(nomeCanale);
    };
    var trashIcon = document.createElement("i");
    trashIcon.className = "fa-solid fa-trash-can";
    deleteButton.appendChild(trashIcon);
    $.ajax({
        type: 'GET',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/channel/${nome}`,
        headers: { },
        success: function (data, status, xhr) {
            console.log('data: ', data);
            $("#canale_selezionato").removeAttr("hidden")

            $("#canale_selezionato_nome").text(nome)
            document.getElementById("canale_selezionato_nome").appendChild(deleteButton);
            $("#canale_selezionato_img").attr("src", `https://site212251.tw.cs.unibo.it/uploads/${data.data.img}`)
            $("#new_descrizione").val(data.data.descrizione)

            data.data.mod.forEach((el) => {
                $("#modlist_ul").append(`<li id="li_${el}" onclick="rimuovi_mod('${el}')">${el}  <i class="fa-solid fa-trash-can"></i></li>`)
            })
            /*mods = mods.slice(0, -1)
            console.log(mods)
            console.log(data.data.mod)
            $("#modlist").val(mods)*/
        }
    });
  }
}

function update_channel(){
    const formData = new FormData(document.getElementById("form_modifica_canale"))

    let modlist = document.getElementById("modlist_ul").getElementsByTagName("li");
    let modstring = ""
    for(let i=0; i<modlist.length; i++){
        modstring += modlist[i].innerHTML+","
    }
    modstring = modstring.slice(0, -1)
    formData.set("modlist", modstring)

    let nome = $("#canale_selezionato_nome").text()
    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/channel/${nome}`,
        headers: { },
        data: formData,
        processData: false,
        contentType: false,
        success: function (data, status, xhr) {
            console.log(data)
            redirectToSettings();
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

function aggiungi_mod(){
    let nome = $("#new_mod").val()
    $.ajax({
        type: 'GET',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/user/${nome}`,
        headers: { },
        success: function (data, status, xhr) {
            $("#new_mod").val("")
            $("#modlist_ul").append(`<li id="li_${nome}" onclick="rimuovi_mod('${nome}')">${nome}</li>`)
        },
        error: function (xhr, status, error) {
            if (xhr.status === 404) {
                alert("L'utente inserito non esiste");
            }
        }
    });
}

function rimuovi_mod(nome){
    let el = "#li_"+nome
    $(el).remove()
}

// Funzione per popolare dinamicamente la lista degli acquisti nella pagina HTML
function popolaListaAcquisti(acquisti) {
    var acquistiList = document.getElementById('acquisti-list');

    // Popola la lista degli acquisti
    acquisti.forEach(function (acquisto) {
        var listItem = document.createElement('li');
        listItem.innerHTML = `
                <div class="acquisto">
                    <div class="info">
                        <div class="quantita">Quota aggiunta: <span class="numero">${acquisto.quantita}</span> <span class="caratteri">caratteri</span></div>
                        <div class="timestamp"><i class="fas fa-calendar"></i> ${timeConverter(acquisto.timestamp)}</div>
                    </div>
                    <div class="spesa">
                        <i class="fas fa-shopping-cart"></i>
                        <div class="ammontare">${calcolaAmmontare(acquisto.quantita)} €</div>
                    </div>
                </div>
            `;
        acquistiList.appendChild(listItem);
    });
}

function calcolaAmmontare(quantita) {
    if (quantita === 120) {
        return '0,99';
    } else if (quantita === 240) {
        return '1,99';
    } else if (quantita === 480) {
        return '4,99';
    } else {
        return '';
    }
}

function popolaFollowers(followers) {
    var followerlist = document.querySelector(".follower-list-utenti");

    for (var i = 0; i < followers.length; i++) {
      var utente = followers[i].username;
      var listItem = document.createElement("li");
      listItem.setAttribute("data-id", utente);
      listItem.innerHTML = `
        <div>
          <i class="fas fa-user"></i>
          <span>${utente}</span>
        </div>
      `;
      followerlist.appendChild(listItem);
    }
  }

  function popolaSeguiti(follow_utenti, follow_canali) {
    // Popola la lista degli utenti seguiti
    var followListUtenti = document.querySelector(".follow-list-utenti");
    var followListCanali = document.querySelector(".follow-list-canali");

    for (var i = 0; i < follow_utenti.length; i++) {
      var utente = follow_utenti[i];
      var listItem = document.createElement("li");
      listItem.setAttribute("data-id", utente);
      listItem.innerHTML = `
        <div>
          <i class="fas fa-user"></i>
          <span>${utente}</span>
        </div>
        <button class="remove-btn" onclick="removeFollowing('${utente}', 'utente')">
          <i class="fa-solid fa-x"></i>
        </button>
      `;
      followListUtenti.appendChild(listItem);
    }

    for (var j = 0; j < follow_canali.length; j++) {
      var canale = follow_canali[j];
      var listItemCanale = document.createElement("li");
      listItem.setAttribute("data-id", canale);
      listItemCanale.innerHTML = `
        <div>
          <i class="fas fa-users"></i>
          <span>${canale}</span>
        </div>
        <button class="remove-btn" onclick="removeFollowing('${canale}', 'canale')">
          <i class="fa-solid fa-x"></i>
        </button>
      `;
      followListCanali.appendChild(listItemCanale);
    }
  }

  function removeFollowing(target, tipo) {
    console.log(target);
    console.log(tipo);

    $.ajax({
      type: 'POST',
      dataType: "json",
      url: `https://site212251.tw.cs.unibo.it/user/${CURRENT_USER}/follow`,
      headers: {},
      data: { target: target, tipo: tipo },
      success: function (data, status, xhr) {
        // Cerco e rimuovo l'elemento dalla lista
        var elemento = $(`.follower-list li[data-id="'${target}'"]`);
        elemento.remove();
      }

    });
  }

  function previewImage(input) {
    var file = input.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $('#currentImg').attr('src', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

//QUOTA
function compra_quota() {
    let qnt;
    if (document.getElementById("img_120").classList[2] == "active") {
      qnt = 120;
    } else if (document.getElementById("img_240").classList[2] == "active") {
      qnt = 240;
    } else if (document.getElementById("img_480").classList[2] == "active") {
      qnt = 480;
    }
    
    let data = {"target": CURRENT_USER, "qnt": qnt, "acquisto": true}
  
    fetch("/user/" + CURRENT_USER + "/quota", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((response) => {
      alert("Acquisto avvenuto con successo")
      //chiudo elem non fatto
  
      let new_quota = parseInt(get_cookie_by_name("quota_g"))+qnt
      //aggiorno il cookie quota
      set_cookie("quota_g", new_quota)
      //aggiorno navbar
      $("#charCount_giorno_vis").text(new_quota)
    })
  }

//PULSANTE MIO PROFILO NAVBAR
function mio_profilo() {
  window.location.replace(`https://site212251.tw.cs.unibo.it/app-search?user`);
}