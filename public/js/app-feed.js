function aggiungi_squeal(squeals, LOG = true) {
  let n_squeal = squeals.length;

  let contenitore = document.getElementById('squeal_contenitore');

  for (let i = 0; i < n_squeal; i++) {
    //setup
    let id = "squeals[" + i + "].post_id";

    //squeal
    let htmlCode = '<div class="card" id="' + squeals[i].post_id + '">  <div class="card-content">    <div class="card-info valign-wrapper">      <div class="col s3 center-align">        <img src="https://via.placeholder.com/60x60" alt="Foto profilo di chi ha creato lo squeal" class="profile-image circle" id="squeal_img_utente' + i + '">      </div>      <div class="col s9 info_utente">        <span class="nome_utente" id="squeal_nome' + i + '">Nome Utente</span>        <br>        <a class="text-muted tag-username btn-flat" id="squeal_tag' + i + '" onclick="ricerca_squeal(this)">username</a>        <br>        <span class="text-muted timestamp" id="squeal_timestamp' + i + '">10 minuti fa</span>      </div>    </div>    <p id="squeal_testo' + i + '" class="sq_testo">Questo è il testo dello squeal</p>  </div>  <div class="card-tabs">    <ul class="tabs tabs-fixed-width">      <li class="tab"><a class="active" href="#reazioni' + i + '">Reazioni</a></li>      <li class="tab"><a href="#commenti' + i + '">Commenti</a></li>      <li class="tab" id="tab' + i + '"><a href="#destinatari' + i + '">Destinatari</a></li>    </ul>  </div>  <div class="card-content grey lighten-4">    <div id="reazioni' + i + '">      <div class="reazioni btn-group">  <div class="positive">     <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, adoro, ' + id + ')">          <i class="fab fa-sketch reazioni-icone"></i>          <span class="n-reazioni" id="squeal_sketch' + i + '">500</span>        </a>        <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, mi_piace, ' + id + ')">          <i class="fas fa-heart reazioni-icone"></i>          <span class="n-reazioni" id="squeal_heart' + i + '">500</span>        </a>        <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, concordo, ' + id + ')">          <i class="fas fa-thumbs-up reazioni-icone"></i>          <span class="n-reazioni" id="squeal_like' + i + '">500</span>        </a>    </div> <div class="negative">    <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, sono_contrario, ' + id + ')">          <i class="fas fa-thumbs-down reazioni-icone"></i>          <span class="n-reazioni" id="squeal_dislike' + i + '">500</span>        </a>        <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, odio, ' + id + ')">          <i class="fas fa-heart-crack reazioni-icone"></i>          <span class="n-reazioni" id="squeal_disheart' + i + '">500</span>        </a>          <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, mi_disgusta, ' + id + ')">          <i class="fas fa-poo reazioni-icone"></i>          <span class="n-reazioni" id="squeal_poo' + i + '">500</span>        </a>  </div>    </div>      <div class="info-post" id="squeal_info' + i + '">        <span class="visual" id="squeal_visual' + i + '">          <i class="fa-solid fa-eye icona-visual"></i>          500        </span>      </div>    </div>    <div id="commenti' + i + '">      <div id="squeal_comment' + i + '">          </div>    </div>    <div id="destinatari' + i + '">      <div id="squeal_destinatari' + i + '">          </div>    </div>  </div></div>';
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
        lista_destinatari.insertAdjacentHTML('beforeend', '<div onclick="ricerca_squeal(this)">' + squeals[i].destinatari[j] + '</div>');
      }
    } else if (squeals[i].tipo_destinatari == "utenti" ) {
      lista_destinatari.insertAdjacentHTML('beforeend', '<div onclick="ricerca_squeal(this)">' + CURRENT_USER + '</div>');
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
    if (LOG) {
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
    }

    //aggiungi commenti
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
        contenitore_commenti.insertAdjacentHTML('beforeend', '<div class="chip comment"><img src="https://via.placeholder.com/48x48" alt="Foto profilo del creatore del commento" class="comment-profile-image" id="c_img_utente' + id_c + '"> <div class="comment-content"> <div class="comment-username" id="c_username' + id_c + '" onclick="ricerca_squeal(this)">  </div> <p class="comment-text" id="c_text' + id_c + '">  </p> </div></div> <br><br>');
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
  }

  //tabs card squeal init
  M.AutoInit();

  //FINE SQUEAL
}

//RICERCA SQUEAL...
function ricerca_squeal(elem) {
  let query;
  let tipo;
  if (elem === null) {
    query = document.getElementById("query").value;
    tipo = document.getElementById("tipo").value;

    //check query vuota
    if (query.length == 0) {
      alert("Inserisci qualcosa da cercare");
      return false;
    }
    //check varie cose
    if (tipo == "user") {
      if (query[0] == "@") {
        let length = query.length;
        query = query.slice(1,length);
      }
    } else if (tipo == "channel") {
      if (query[0] != "$") {
        query = "$" + query;
      }
    }
  } else {
    query = elem.innerHTML;
    tipo = query[0];

    if (tipo == " ") {
      tipo = query[1];
      query = query.substring(2);
    }
    if (tipo == "$") {
      tipo = "channel";
    } else if (tipo == "#") {
      tipo = "keyword"
    } else {
      if (tipo == "@") {
        let length = query.length;
        query = query.slice(1,length);
      }
      tipo = "user";
    }
  }

  let all_info;
  $.ajax({
    type: 'POST',
    dataType: "json",
    async: false,
    url: `https://site212251.tw.cs.unibo.it/squeal/by_${tipo}`,
    headers: { },
    data: { query: query, target: CURRENT_USER },
    success: function (data, status, xhr) {
      console.log('data: ', data);
      all_info = data.data;
    }
  });
  if (all_info.post === undefined) {
    return console.log("error");
  }

  rimpiazza_squeals(all_info.post, document.getElementById("filtro").value);
  if(tipo !== "keyword") { aggiungi_info(all_info.meta); }

  return all_info;
}

function aggiungi_info(meta){
  let container = document.getElementById("info_contenitore");
  container.innerHTML = '';
  container.hidden = false;
  let htmlInfo = `<div class="card" id="info_utente">
                    <div class="card-content">
                      <div class="card-info valign-wrapper">
                        <div class="col s2 center-align">
                          <img src="https://site212251.tw.cs.unibo.it/uploads/${meta["info"]["img"]}" alt="Foto profilo" class="profile-image circle" id="info_img">
                        </div>
                        <div class="col s6" id="info_info">
                          <span class="nome_utente" id="info_nome">${meta["info"]["nome"]}</span>

                        </div>
                        <div class="col s4 right-align" id="info_btn">

                        </div>
                      </div>
                      <p id="info_descrizione"></p>
                    </div>
                  </div>`;

  container.insertAdjacentHTML('beforeend', htmlInfo);

  if (meta["tipo"] == "utente") { // caso ricerca utente
    document.getElementById("info_info").insertAdjacentHTML('beforeend', `<br> <a class="text-muted tag-username btn-flat" id="info_username">@${meta["info"]["username"]}</a>`);

    document.getElementById("info_descrizione").innerHTML = meta["info"]["bio"];

    if (meta["info"]["username"] != CURRENT_USER) { 
      if (meta["info"]["is_follower"]) {
        document.getElementById("info_btn").innerHTML = `<div class="follow_button"><button class="btn btn-outline-primary" id="pulsante-segui" onclick="toggle_follow('${meta["info"]["username"]}', 'utente')">Unfollow</button><div id="num_follower">${meta["info"]["num_followers"]} follower(s)</div></div>`
      } else {
        document.getElementById("info_btn").innerHTML = `<div class="follow_button"><button class="btn btn-primary" id="pulsante-segui" onclick="toggle_follow('${meta["info"]["username"]}', 'utente')">Follow</button><div id="num_follower">${meta["info"]["num_followers"]} follower(s)</div></div>`
      }

      document.getElementById("info_btn").insertAdjacentHTML ('beforeend', `<div class="row" id="riga5"><div class="pulsante_chat"><button class="btn btn-chat" id="pulsante-chat" onclick="inizia_chat('${meta["info"]["username"]}', apri)"><i class="fa-regular fa-message"></i> Chat</button></div></div>`);
    }
  } else if (meta["tipo"] == "canale") { //caso ricerca canale
    document.getElementById("info_descrizione").innerHTML = meta["info"]["descrizione"];

    if(meta["info"]["is_follower"]){
      document.getElementById("info_btn").innerHTML = `<div class="follow_button"><button class="btn btn-outline-primary" id="pulsante-segui" onclick="toggle_follow('${meta["info"]["nome"]}', 'canale')">Unfollow</button><div id="num_follower">${meta["info"]["num_followers"]} follower(s)</div></div>`
    } else {
      document.getElementById("info_btn").innerHTML = `<div class="follow_button"><button class="btn btn-primary" id="pulsante-segui" onclick="toggle_follow('${meta["info"]["nome"]}', 'canale')">Follow</button><div id="num_follower">${meta["info"]["num_followers"]} follower(s)</div></div>`
    }
  }
}

function toggle_follow(target, tipo){
  $.ajax({
    type: 'POST',
    dataType: "json",
    url: `https://site212251.tw.cs.unibo.it/user/${CURRENT_USER}/follow`,
    headers: { },
    data: { target: target, tipo: tipo },
    success: function (data, status, xhr) {
      let num_foll = parseInt($("#num_follower").text().split(" ")[0])
      //console.log(data.risultato)
      if (data.risultato == "added"){
        $("#pulsante-segui").text("Unfollow")
        $("#pulsante-segui").removeClass("btn-primary")
        $("#pulsante-segui").addClass("btn-outline-primary")
        $("#num_follower").text(String(num_foll+1)+" follower(s)")
      } else if (data.risultato == "removed") {
        $("#pulsante-segui").text("Follow")
        $("#pulsante-segui").removeClass("btn-outline-primary")
        $("#pulsante-segui").addClass("btn-primary")
        $("#num_follower").text(String(num_foll-1)+" follower(s)")
      }
    }
  });
}

function ricarica() {
  location.reload();
}

//Svuota il feed
function svuota_pagina() {
  document.getElementById('squeal_contenitore').innerHTML = '';
}

//Ordina Squeal
function ordina_squeals(posts, filtro) {
  if (filtro == "data") {
    posts.sort(function(a, b){return b.timestamp - a.timestamp});
  } else if (filtro == "visual") {
    posts.sort(function(a, b){return b.visualizzazioni - a.visualizzazioni});
  } else if (filtro == "impression") {
    posts.sort(function(a, b) {
      let reaz_a = a.reazioni.positive.adoro.length + a.reazioni.positive.mi_piace.length + a.reazioni.positive.concordo.length - a.reazioni.negative.mi_disgusta.length - a.reazioni.negative.odio.length - a.reazioni.negative.sono_contrario.length;
      let reaz_b = b.reazioni.positive.adoro.length + b.reazioni.positive.mi_piace.length + b.reazioni.positive.concordo.length - b.reazioni.negative.mi_disgusta.length - b.reazioni.negative.odio.length - b.reazioni.negative.sono_contrario.length;
      return reaz_b - reaz_a;
    });
  }
  return posts;
}

function rimpiazza_squeals(posts, filtro) {
  svuota_pagina();
  //rimuovi_info();

  let posts_ordinati = ordina_squeals(posts, filtro);

  aggiungi_squeal(posts_ordinati);
}


//bottoni
function premibottone(button, reac, id) {
  if (button.checked) {
    button.style.color= "#777";
    button.checked = false;
    var Nreaz = button.querySelector(".n-reazioni");
    Nreaz.innerHTML = parseInt(Nreaz.innerHTML) - 1;
  } else {
    const buttonGroup = document.getElementsByClassName(button.className);
    const buttonArray = Array.from(buttonGroup);
    buttonArray.forEach((btnradio) => {
      if (button==btnradio){
        if (reac == "adoro"){
          button.style.color= "#00AFFF";
        } else if (reac == "mi_disgusta") {
          button.style.color= "#8B4513";
        } else if (reac == "mi_piace") {
          button.style.color= "#FF0000";
        } else if (reac == "odio") {
          button.style.color= "#FF0000";
        } else if (reac == "concordo") {
          button.style.color= "#007FFF";
        } else if (reac == "sono_contrario") {
          button.style.color= "#007FFF";
        }
        button.checked = true;
        let Nreaz = btnradio.querySelector(".n-reazioni");
        Nreaz.innerHTML = parseInt(Nreaz.innerHTML) + 1;
      } else if (btnradio.checked) {
        btnradio.style.color= "#777";
        btnradio.checked = false;
        let Nreaz = btnradio.querySelector(".n-reazioni");
        Nreaz.innerHTML = parseInt(Nreaz.innerHTML) - 1;
      }
    });
  }

  //chiamata update db
  $.ajax({
    type: 'POST',
    dataType: "json",
    async: false,
    url: `https://site212251.tw.cs.unibo.it/squeal/${id}/reaction`,
    data: {reac: reac, userid: CURRENT_USER},
    headers: { },
    success: function (data, status, xhr) {
      console.log('data: ', data);
    }
  });
}

//NOTIFICHE
function ricerca_notifica(notifica) {
  if (notifica.tipo == "follow") {
    let elem_notifica = document.createElement('div');
    elem_notifica.innerHTML = notifica.ref_id;
    ricerca_squeal(elem_notifica);
  } else if (notifica.tipo == "menzione" || notifica.tipo == "risposta" || notifica.tipo == "popolarita" || notifica.tipo == "privato") {
    let post_notifica;
    $.ajax({
      type: 'GET',
      dataType: "json",
      async: false,
      url: `https://site212251.tw.cs.unibo.it/squeal/${notifica.ref_id}`,
      headers: { },
      success: function (data, status, xhr) {
        post_notifica = data.data;
      }
    });
    if (notifica.tipo == "risposta") {
      if (post_notifica.risponde_a != null) {
        $.ajax({
          type: 'GET',
          dataType: "json",
          async: false,
          url: `https://site212251.tw.cs.unibo.it/squeal/${post_notifica.risponde_a}`,
          headers: { },
          success: function (data, status, xhr) {
            post_notifica = data.data;
          }
        });
      }
    }
    rimpiazza_squeals([post_notifica], "filtro");
    squeals = [post_notifica];
  }

  //leggi notifica
  $.ajax({
    type: 'POST',
    dataType: "json",
    async: false,
    url: `https://site212251.tw.cs.unibo.it/notification/${notifica.not_id}`,
    headers: { },
    success: function (data, status, xhr) {}
  });

  document.getElementById("squeal_contenitore").hidden = false;
  document.getElementById("info_contenitore").hidden = false;
  document.getElementById("title_contenitore").hidden = false;
  document.getElementById("notifiche_contenitore").hidden = true;

  //SIDE BAR
  var elems = document.querySelectorAll('.sidenav');
  var options = {
    edge: 'right',
  }
  var instances = M.Sidenav.init(elems, options);
}

//COMMENTI
function commenta(id) {
  window.location.replace(`https://site212251.tw.cs.unibo.it/app-editor?post_id=` + id);
}

//PULSANTE MIO PROFILO NAVBAR
function mio_profilo() {
  window.location.replace(`https://site212251.tw.cs.unibo.it/app-search?user`);
}

//PULSANTE COMPRA QUOTA
function btn_acquista_quota() {
  
}

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