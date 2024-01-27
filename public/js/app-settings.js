function switch_settings(param){
    let settings = ["profilo", "account", "acquisti", "smm", "follow", "popolarita", "canali", "funz"]

    settings.forEach((el) =>{ //nascondo tutte le sezioni
        $("#"+el).attr("hidden", "true")
    })

    if (param == "smm" || param == "canali") {
      if (get_cookie_by_name("tipo") == "base") {
        //visualizzo funz non disponibile
        $("#funz").removeAttr("hidden");
      } else {
        //visualizzo solo quella richiesta
        $("#"+param).removeAttr("hidden");
      }
    } else {
      //visualizzo solo quella richiesta
      $("#"+param).removeAttr("hidden");
    }
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
        window.location.replace("https://site212251.tw.cs.unibo.it/app-settings");
        } else {
        throw new Error("Network response was not ok.");
        }
    })
}

function check_info() {
  if (document.getElementById("newName").value == '') {
    alert("Inserisci un nome");
    return false;
  }

  if (document.getElementById("newSurname").value == '') {
    alert("Inserisci un cognome");
    return false;
  }

  return true;
}

function check_form() {
  if (document.getElementById("newEmail").value != '') {
    //check formato mail corretto (RFC 2822 standard email validation)
    var mailformat = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    if (!document.getElementById("newEmail").value.match(mailformat)) {
      alert("La nuova mail inserita non è valida");
      return false;
    }
  } else if (document.getElementById("newEmail").value == '') {
    return false;
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
            redirectToSettings_app();
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
            redirectToSettings_app();
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
    let nome_canale = document.getElementById("nomeCanaleInput").value;
    if (!nome_canale.startsWith("$")) {
      nome_canale = "$" + nome_canale;
    }
    nome_canale = nome_canale.toLowerCase();
    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/channel`,
        headers: { },
        data: {nome: nome_canale, userid: CURRENT_USER, descrizione: '', ufficiale: 'false'},
        success: function (data, status, xhr) {
          redirectToSettings_app();
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
    deleteButton.className = "btn red right";
    deleteButton.onclick = function() {
      cancella_canale(nome);
    };
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
              chip_arr[0].addChip({
                tag: el,
              });
            })
        }
    });
  }
}

function update_channel(){
    const formData = new FormData(document.getElementById("form_modifica_canale"))

    let x = 0;
    let modstring = "";
    chip_arr[0].chipsData.forEach(function (){
      modstring = chip_arr[0].chipsData[x].tag + ",";
      x = x + 1;
    });
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
            redirectToSettings_app();
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
        redirectToSettings_app();
      },
      error: function (xhr, status, error) {
          if (xhr.status === 404) {
              alert("Canale già non esistente");
          }
      }
  });
}

function aggiungi_mod(nome){
    $.ajax({
        type: 'GET',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/user/${nome}`,
        headers: { },
        success: function (data, status, xhr) {
          chip_n = chip_n + 1;
        },
        error: function (xhr, status, error) {
          chip_arr[0].deleteChip(chip_n);
          if (xhr.status === 404) {
            alert("L'utente inserito non esiste");
          }
        }
    });
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
        <div class="chip">
          <i class="fas fa-user"></i>
          ${utente}
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
        <div class="chip">
          <i class="fas fa-user"></i>
          ${utente}
          <i class="close material-icons" onclick="removeFollowing('${utente}', 'utente')">close</i>
        </div>
      `;
      followListUtenti.appendChild(listItem);
    }

    for (var j = 0; j < follow_canali.length; j++) {
      var canale = follow_canali[j];
      var listItemCanale = document.createElement("li");
      listItem.setAttribute("data-id", canale);
      listItemCanale.innerHTML = `
        <div class="chip">
          <i class="fas fa-users"></i>
          ${canale}
          <i class="close material-icons" onclick="removeFollowing('${canale}', 'canale')">close</i>
        </div>
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

//SINGOLO SQUEAL POPOLARITA'
function aggiungi_squeal_singolo(squeals, cont, i) {
  //let contenitore = document.getElementById('');
  let contenitore = cont;

  //setup
  let id = "squeals[" + i + "].post_id";

  //squeal
  let htmlCode = '<div class="card" id="' + squeals[i].post_id + '">  <div class="card-content">    <div class="card-info valign-wrapper">      <div class="col s3 center-align">        <img src="https://via.placeholder.com/60x60" alt="Foto profilo di chi ha creato lo squeal" class="profile-image circle" id="squeal_img_utente' + i + '">      </div>      <div class="col s9 info_utente">        <span class="nome_utente" id="squeal_nome' + i + '">Nome Utente</span>        <br>        <a class="text-muted tag-username btn-flat" id="squeal_tag' + i + '">username</a>        <br>        <span class="text-muted timestamp" id="squeal_timestamp' + i + '">10 minuti fa</span>      </div>    </div>    <p id="squeal_testo' + i + '" class="sq_testo">Questo è il testo dello squeal</p>  </div>  <div class="card-tabs">    <ul class="tabs tabs-fixed-width">      <li class="tab"><a class="active" href="#reazioni' + i + '">Reazioni</a></li>      <li class="tab"><a href="#commenti' + i + '">Commenti</a></li>      <li class="tab" id="tab' + i + '"><a href="#destinatari' + i + '">Destinatari</a></li>    </ul>  </div>  <div class="card-content grey lighten-4">    <div id="reazioni' + i + '">      <div class="reazioni btn-group">  <div class="positive">     <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, adoro, ' + id + ')">          <i class="fab fa-sketch reazioni-icone"></i>          <span class="n-reazioni" id="squeal_sketch' + i + '">500</span>        </a>        <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, mi_piace, ' + id + ')">          <i class="fas fa-heart reazioni-icone"></i>          <span class="n-reazioni" id="squeal_heart' + i + '">500</span>        </a>        <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, concordo, ' + id + ')">          <i class="fas fa-thumbs-up reazioni-icone"></i>          <span class="n-reazioni" id="squeal_like' + i + '">500</span>        </a>    </div> <div class="negative">    <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, sono_contrario, ' + id + ')">          <i class="fas fa-thumbs-down reazioni-icone"></i>          <span class="n-reazioni" id="squeal_dislike' + i + '">500</span>        </a>        <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, odio, ' + id + ')">          <i class="fas fa-heart-crack reazioni-icone"></i>          <span class="n-reazioni" id="squeal_disheart' + i + '">500</span>        </a>          <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, mi_disgusta, ' + id + ')">          <i class="fas fa-poo reazioni-icone"></i>          <span class="n-reazioni" id="squeal_poo' + i + '">500</span>        </a>  </div>    </div>      <div class="info-post" id="squeal_info' + i + '">        <span class="visual" id="squeal_visual' + i + '">          <i class="fa-solid fa-eye icona-visual"></i>          500        </span>      </div>    </div>    <div id="commenti' + i + '">      <div id="squeal_comment' + i + '">          </div>    </div>    <div id="destinatari' + i + '">      <div id="squeal_destinatari' + i + '">          </div>    </div>  </div></div>';
  contenitore.insertAdjacentHTML('beforeend', htmlCode);

  //info utente
  let id_nome = 'squeal_nome' + i;
  let id_tag = 'squeal_tag' + i;
  let id_timestamp = 'squeal_timestamp' + i;
  let id_squeal_img_utente = 'squeal_img_utente' + i;
  document.getElementById(id_nome).innerHTML = squeals[i].nome;
  document.getElementById(id_tag).innerHTML = squeals[i].utente;
  document.getElementById(id_timestamp).innerHTML = timeConverter(squeals[i].timestamp);
  document.getElementById(id_squeal_img_utente).src = `https://site212251.tw.cs.unibo.it/uploads/${squeals[i].img}`

  //corpo squeal
  let id_testo = 'squeal_testo' + i;
  if(squeals[i].contenuto == "testo"){
    document.getElementById(id_testo).innerHTML = squeals[i].corpo;
  } else if(squeals[i].contenuto == "img"){
    document.getElementById(id_testo).innerHTML = `<img class="img_squeal" src="https://site212251.tw.cs.unibo.it/uploads/${squeals[i].corpo}" alt="immagine dello squeal">`
  } else if(squeals[i].contenuto == "map"){
    document.getElementById(id_testo).innerHTML = `<img class="img_squeal" src="${squeals[i].corpo}" alt="mappa dello squeal">`;
  }

  //destinatari
  let lista_destinatari = document.getElementById('squeal_destinatari' + i);
  let n_destinatari = squeals[i].destinatari.length;
  if (squeals[i].tipo_destinatari == "canali" ) {
    for (let j = 0; j < n_destinatari; j++) {
      lista_destinatari.insertAdjacentHTML('beforeend', '<div>' + squeals[i].destinatari[j] + '</div>');
    }
  } else if (squeals[i].tipo_destinatari == "utenti" ) {
    lista_destinatari.insertAdjacentHTML('beforeend', '<div>' + CURRENT_USER + '</div>');
  } else {
    document.getElementById('tab' + i).remove();
  }

  //reazioni
  let id_sketch = 'squeal_sketch' + i;
  document.getElementById(id_sketch).innerHTML = squeals[i].reazioni.positive.adoro.length;
  let id_poo = 'squeal_poo' + i;
  document.getElementById(id_poo).innerHTML = squeals[i].reazioni.negative.mi_disgusta.length;
  let id_heart = 'squeal_heart' + i;
  document.getElementById(id_heart).innerHTML = squeals[i].reazioni.positive.mi_piace.length;
  let id_disheart = 'squeal_disheart' + i;
  document.getElementById(id_disheart).innerHTML = squeals[i].reazioni.negative.odio.length;
  let id_like = 'squeal_like' + i;
  document.getElementById(id_like).innerHTML = squeals[i].reazioni.positive.concordo.length;
  let id_dislike = 'squeal_dislike' + i;
  document.getElementById(id_dislike).innerHTML = squeals[i].reazioni.negative.sono_contrario.length;

  //aggiungo le reaction gia' inserite
  if (squeals[i].reazioni.positive.adoro.includes(CURRENT_USER)) {
    let nreazioni0 = document.getElementById(id_sketch);
    let premuto0 = nreazioni0.parentNode;
    premuto0.style.color= "#00AFFF";
    premuto0.checked = true;
  } else if (squeals[i].reazioni.negative.mi_disgusta.includes(CURRENT_USER)) {
    let nreazioni1 = document.getElementById(id_poo);
    let premuto1 = nreazioni1.parentNode;
    premuto1.style.color= "#8B4513";
    premuto1.checked = true;
  } else if (squeals[i].reazioni.positive.mi_piace.includes(CURRENT_USER)) {
    let nreazioni2 = document.getElementById(id_heart);
    let premuto2 = nreazioni2.parentNode;
    premuto2.style.color= "#FF0000";
    premuto2.checked = true;
  } else if (squeals[i].reazioni.negative.odio.includes(CURRENT_USER)) {
    let nreazioni3 = document.getElementById(id_disheart);
    let premuto3 = nreazioni3.parentNode;
    premuto3.style.color= "#FF0000";
    premuto3.checked = true;
  } else if (squeals[i].reazioni.positive.concordo.includes(CURRENT_USER)) {
    let nreazioni4 = document.getElementById(id_like);
    let premuto4 = nreazioni4.parentNode;
    premuto4.style.color= "#007FFF";
    premuto4.checked = true;
  } else if (squeals[i].reazioni.negative.sono_contrario.includes(CURRENT_USER)) {
    let nreazioni5 = document.getElementById(id_dislike);
    let premuto5 = nreazioni5.parentNode;
    premuto5.style.color= "#007FFF";
    premuto5.checked = true;
  }

  //aggiungi commenti
  let lista_commenti = [];
  let id_post = squeals[i].post_id;
  let id_comment = 'squeal_comment' + i;
  let contenitore_commenti = document.getElementById(id_comment);
  if (squeals[i].numRisposte > 0) {
    $.ajax({
      type: 'GET',
      dataType: "json",
      async: false,
      url: `https://site212251.tw.cs.unibo.it/squeal/${id_post}/reply`,
      headers: { },
      success: function (data, status, xhr) {
        lista_commenti[i] = data.data;
      }
    });
    let n_commenti = lista_commenti[i].length;
    for (let c = 0; c < n_commenti; c++) {
      let id_c = String(i) + String(c);
      contenitore_commenti.insertAdjacentHTML('beforeend', '<div class="chip comment"><img src="https://via.placeholder.com/48x48" alt="Foto profilo del creatore del commento" class="comment-profile-image" id="c_img_utente' + id_c + '"> <div class="comment-content"> <div class="comment-username" id="c_username' + id_c + '">  </div> <p class="comment-text" id="c_text' + id_c + '">  </p> </div></div> <br><br>');
      let c_img_utente = 'c_img_utente' + id_c;
      document.getElementById(c_img_utente).src = `https://site212251.tw.cs.unibo.it/uploads/${lista_commenti[i][c].img}`
      let id_tag = 'c_username' + id_c;
      document.getElementById(id_tag).innerHTML = lista_commenti[i][c].utente;
      let id_testo = 'c_text' + id_c;
      if (lista_commenti[i][c].contenuto == "testo") {
        document.getElementById(id_testo).innerHTML = lista_commenti[i][c].corpo;
      } else if(lista_commenti[i][c].contenuto == "img"){
        document.getElementById(id_testo).innerHTML = `<img class="img_squeal" src="https://site212251.tw.cs.unibo.it/uploads/${lista_commenti[i][c].corpo}" alt="immagine del commento">`
      } else if(lista_commenti[i][c].contenuto == "map"){
        document.getElementById(id_testo).innerHTML = `<img class="img_squeal" src="${lista_commenti[i][c].corpo}" alt="mappa del commento">`;
      }
    }
  } else {
    contenitore_commenti.innerHTML = "<div> Nessuno ha ancora commentato </div> <br>";
  }
  contenitore_commenti.insertAdjacentHTML('beforeend', `<a class="btn" type="button" onclick="commenta('` + squeals[i].post_id + `')" title="Aggiungi commento"> Commenta </a>`);

  //etichette
  let id_visual = 'squeal_visual' + i;
  document.getElementById(id_visual).innerHTML = '<i class="fa-solid fa-eye visual-icona"></i>' + squeals[i].visualizzazioni;
  if (squeals[i].categoria == "popolare"){
    let Et_popolarita = document.getElementById('squeal_info' + i);
    Et_popolarita.insertAdjacentHTML('beforeend', '<span class="label-squeal popolare"> Popolare </span>');
  } else if (squeals[i].categoria == "impopolare"){
    let Et_popolarita = document.getElementById('squeal_info' + i);
    Et_popolarita.insertAdjacentHTML('beforeend', '<span class="label-squeal impopolare"> Impopolare </span>');
  } else if (squeals[i].categoria == "controverso"){
    let Et_popolarita = document.getElementById('squeal_info' + i);
    Et_popolarita.insertAdjacentHTML('beforeend', '<span class="label-squeal controverso"> Controverso </span>');
  }
  if (squeals[i].automatico){
    let Et_auto = document.getElementById('squeal_info' + i);
    Et_auto.insertAdjacentHTML('beforeend', '<span class="label-squeal auto"> Auto </span>');
  }
  if (squeals[i].suggerito){
    let Et_consigliato = document.getElementById('squeal_info' + i);
    Et_consigliato.insertAdjacentHTML('beforeend', '<span class="label-squeal consigliato"> Consigliato </span>');
  }

  //tabs card squeal init
  M.AutoInit();

  //FINE SQUEAL
}

//AGGIUNGI MOD
function aggiungi_chip_mod() {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    which: 13,
    keyCode: 13,
  });
  document.getElementById("destinatari").dispatchEvent(event);
}
