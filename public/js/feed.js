let arr_trend = []; //array per i trends

function aggiungi_squeal(squeals) {
  
  let n_squeal = squeals.length;

  let contenitore = document.getElementById('squeal_contenitore');

  for (let i = 0; i < n_squeal; i++) {
    //setup
    let id = "squeals[" + i + "].post_id";

    //squeal
    let htmlCode = '<div class="card squeal" id="' + squeals[i].post_id + '">  <div class="card-header">  <img src="https://via.placeholder.com/60x60" alt="Foto profilo di chi ha creato lo squeal" class="profile-image" id="squeal_img_utente' + i + '">  <div class="info_utente"><span class="nome_utente" id="squeal_nome' + i + '">Nome Utente</span>  <button class="text-muted tag-username" id="squeal_tag' + i + '" onclick="ricerca_squeal(this)">username</button>  <span class="text-muted timestamp" id="squeal_timestamp' + i + '">10 minuti fa</span></div>  <div class="recipients-dropdown destinatari"><button class="btn btn-destinatari dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="lista destinatari" id="btn-destinatari' + i + '"></button><div class="dropdown-menu" id="squeal_destinatari' + i + '"></div></div></div>  <div class="card-body"><p id="squeal_testo' + i + '"></p></div>  <div class="card-footer">  <div class="reazioni btn-group"><button class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, adoro, ' + id + ')" aria-label="adoro"><i class="fab fa-sketch reazioni-icone"></i><br><span class="n-reazioni" id="squeal_sketch' + i + '">500</span></button><button class="btn  btn-group' + i + '" onclick="premibottone(this, mi_piace, ' + id + ')" aria-label="mi piace"><i class="fas fa-heart reazioni-icone"></i><br><span class="n-reazioni" id="squeal_heart' + i + '">500</span></button>  <button class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, concordo, ' + id + ')" aria-label="concordo"><i class="fas fa-thumbs-up reazioni-icone"></i><br><span class="n-reazioni" id="squeal_like' + i + '">500</span></button>  <button class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, sono_contrario, ' + id + ')" aria-label="sono contrario"><i class="fas fa-thumbs-down reazioni-icone"></i><br><span class="n-reazioni" id="squeal_dislike' + i + '">500</span></button>  <button class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, odio, ' + id + ')" aria-label="odio"><i class="fas fa-heart-crack reazioni-icone"></i><br><span class="n-reazioni" id="squeal_disheart' + i + '">500</span></button>  <button class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, mi_disgusta, ' + id + ')" aria-label="mi disgusta"><i class="fas fa-poo reazioni-icone"></i><br><span class="n-reazioni" id="squeal_poo' + i + '">500</span></button>  <button class="btn btn-reazioni c btn-group' + i + '"  onclick="aggiungicommento(this, apri, '+id+')"  aria-label="commenta"><i class="fa-solid fa-comments reazioni-icone"></i><br><span class="n-reazioni" id="squeal_comment' + i + '">500</span></button></div>  <div class="info-post" id="squeal_info' + i + '"><span class="visual" id="squeal_visual' + i + '"><i class="fa-solid fa-eye icona-visual"></i>500</span></div></div></div>';
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
      let testo_squeal = squeals[i].corpo;
      //parole con @ all'inizio
      const at = /(?:^|\s)@(\w+)/g;
      let at_arr = squeals[i].corpo.match(at);
      arr_trend.push(...squeals[i].corpo.match(/#\w+/g) || []);
      let ht_arr = squeals[i].corpo.match(/#\w+/g) //match su hashtag
      //url in text
      const url = /\b(?:https?|ftp):\/\/[-\w+&@#/%?=~|$!:,.;]*[\w\-]+(?:\.[a-z]{2,})+(?:\/\S*)?\b/g;
      const url_arr = squeals[i].corpo.match(url);
      if(ht_arr != null){
        ht_arr.forEach(function(hashtag) {
          testo_squeal = testo_squeal.replace(hashtag,'<button class="btn_hashtag" onclick="ricerca_squeal(this)">' + hashtag + '</button>');
        });
      }
      if (at_arr != null) {
        at_arr.forEach(function(nome) {
          testo_squeal = testo_squeal.replace(nome,'<button class="btn_nomi" onclick="ricerca_squeal(this)">' + nome + '</button>');
        });
      }
      if (url_arr != null) {
        url_arr.forEach(function(link) {
          testo_squeal = testo_squeal.replace(link,'<a class="btn_link" href="' + link + '">' + link + '</a>');
        });
      }
      document.getElementById(id_testo).innerHTML = testo_squeal;
    } else if(squeals[i].contenuto == "img"){
      document.getElementById(id_testo).innerHTML = `<img src="https://site212251.tw.cs.unibo.it/uploads/${squeals[i].corpo}" alt="immagine dello squeal">`
    } else if(squeals[i].contenuto == "map"){
      document.getElementById(id_testo).innerHTML = `<img src="${squeals[i].corpo}" alt="mappa dello squeal">`;
    }
    //destinatari
    let id_destinatari = 'btn-destinatari' + i;
    if (squeals[i].tipo_destinatari == "canali"){
      let bottone_destinatari_canali = '<i class="fa-solid fa-users destinatari-icona"></i>'
      document.getElementById(id_destinatari).innerHTML = bottone_destinatari_canali;
    } else if (squeals[i].tipo_destinatari == "utenti") {
      let bottone_destinatari_utenti = '<i class="fa-solid fa-user destinatari-icona"></i>'
      document.getElementById(id_destinatari).innerHTML = bottone_destinatari_utenti;
    } else {
      document.getElementById(id_destinatari).hidden = true;
    }
    let lista_destinatari = document.getElementById('squeal_destinatari' + i);
    let n_destinatari = squeals[i].destinatari.length;
    for (let j = 0; j < n_destinatari; j++) {
      lista_destinatari.insertAdjacentHTML('beforeend', '<button class="dropdown-item" onclick="ricerca_squeal(this)">' + squeals[i].destinatari[j] + '</button>');
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
    let id_comment = 'squeal_comment' + i;
    document.getElementById(id_comment).innerHTML = squeals[i].numRisposte;

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
  //FINE SQUEAL
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

function aggiungi_info(meta){
  let container = $("#barra-destra")
  container.empty()
  container.removeAttr("hidden")

  document.getElementById("chat").hidden = true;

  let riga0 = `<div class="row" id="riga0"><button class="fa-solid fa-times icona-chiudi" onclick="ricarica()"></button></div>`
  container.append(riga0)

  if(meta["tipo"] == "utente") { // caso ricerca utente
    let riga1 = `<div class="row" id="riga1"></div>`
    container.append(riga1)
    $("#riga1").append(`<img class="img-rounded" id="bd_img" src="https://site212251.tw.cs.unibo.it/uploads/${meta["info"]["img"]}">`)

    let riga2 = `<div class="row" id="riga2"></div>`
    let riga4 = `<div class="row" id="riga4"></div>`

    let info = `<div class="info"><b>${meta["info"]["nome"]}</b><br>@${meta["info"]["username"]}</div>`

    let follow
    if(meta["info"]["is_follower"]){
      follow = `<div class="follow_button"><button class="btn btn-outline-primary" id="pulsante-segui" onclick="toggle_follow('${meta["info"]["username"]}', 'utente')">Unfollow</button><div id="num_follower">${meta["info"]["num_followers"]} follower(s)</div></div>`
    } else {
      follow = `<div class="follow_button"><button class="btn btn-primary" id="pulsante-segui" onclick="toggle_follow('${meta["info"]["username"]}', 'utente')">Follow</button><div id="num_follower">${meta["info"]["num_followers"]} follower(s)</div></div>`
    }
    container.append(riga2)
    $("#riga2").append(info)

    let riga3 = `<div class="row" id="riga3"><div class="card" id="search-bio">${meta["info"]["bio"]}</div></div>`
    container.append(riga3)

    container.append(riga4)
    $("#riga4").append(follow)

    if (meta["info"]["username"] !== CURRENT_USER) {
      let riga5 = `<div class="row" id="riga5"><div class="pulsante_chat"><button class="btn btn-chat" id="pulsante-chat" onclick="inizia_chat('${meta["info"]["username"]}', apri)"><i class="fa-regular fa-message"></i> Chat</button></div></div>`;
      container.append(riga5);
    }

  } else if(meta["tipo"] == "canale") { //caso ricerca canale
    let riga1 = `<div class="row" id="riga1"></div>`
    container.append(riga1)
    $("#riga1").append(`<img class="img-rounded" id="bd_img" src="https://site212251.tw.cs.unibo.it/uploads/${meta["info"]["img"]}">`)

    let riga2 = `<div class="row" id="riga2"></div>`

    let info = `<div class="info"><h3>${meta["info"]["nome"]}</h3></div>`

    let follow
    if(meta["info"]["is_follower"]){
      follow = `<div class="follow_button"><button class="btn btn-outline-primary" id="pulsante-segui" onclick="toggle_follow('${meta["info"]["nome"]}', 'canale')">Unfollow</button><div id="num_follower">${meta["info"]["num_followers"]} follower(s)</div></div>`
    } else {
      follow = `<div class="follow_button"><button class="btn btn-primary" id="pulsante-segui" onclick="toggle_follow('${meta["info"]["nome"]}', 'canale')">Follow</button><div id="num_follower">${meta["info"]["num_followers"]} follower(s)</div></div>`
    }

    container.append(riga2)
    $("#riga2").append(info)

    let riga3 = `<div class="row" id="riga3"><div class="card" id="search-bio">${meta["info"]["descrizione"]}</div></div>`
    container.append(riga3)

    let riga4 = `<div class="row" id="riga4"></div>`
    container.append(riga4)
    $("#riga4").append(follow)


  }
}

function rimuovi_info() {
  let container = $("#barra-destra")
  container.empty()
  container.attr("hidden")
}

function ricarica() {
  location.reload();
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

    if (tipo === " ") {
      tipo = query[1];
      query = query.substring(2);
    }
    else if (tipo === "$") {
      tipo = "channel";
    }
    else if (tipo === "#") {
      tipo = "keyword"
    }
    else {
      if (query[0] == "@") {
        let length = query.length;
        query = query.slice(1,length);
      }
      tipo = "user";
    }
  }
  //console.log("tipo search: "+tipo)

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

  squeals = all_info.post;
  return all_info;
}

//Svuota il feed e info
function svuota_pagina() {
  document.getElementById('squeal_contenitore').innerHTML = '';
  aggiungicommento('', 'chiudi');
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
  rimuovi_info();

  let posts_ordinati = ordina_squeals(posts, filtro);
  console.log(posts_ordinati)

  aggiungi_squeal(posts_ordinati);
}

// switch account e re-set quota
function switch_account(username){
  set_cookie("managed", username)
  //$("#managed-account-username").text(username)
  //$("#managed-account-username").attr("hidden")
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
  ricarica()
}

//bottoni
function premibottone(button, reac, id) {
  //console.log(button.querySelector(".n-reazioni"));
  if (button.checked) {
    button.style.color= "#777";
    button.checked = false;
    var Nreaz = button.querySelector(".n-reazioni");
    Nreaz.innerHTML = parseInt(Nreaz.innerHTML) - 1;
  } else {
    const buttonGroup = document.getElementsByClassName(button.className);
    const buttonArray = Array.from(buttonGroup);
    //console.log(buttonGroup);
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

function aggiungicommento(icon, azione, id) {
  let id_commento = document.querySelector('.aggiungi-commento');
  if (azione == "apri") {
      aggiungicommento('', 'chiudi');
      id_commento.id = id;
      // Cambia il colore dell'icona del commento a nero
      icon.style.color = 'black';
      // Nascondi il div "barra destra"
      document.getElementById("barra-destra").hidden = true;
      document.getElementById("chat").hidden = true;
      // Mostra il div "mostra-squeal"
      document.getElementById("mostra-commenti").hidden = false;
      //rimpiazza commenti
      rimpiazza_commenti(id);
  } else if (azione == "chiudi") {
    const c_Group = document.getElementsByClassName("c");
    const c_Array = Array.from(c_Group);
    id_commento.id = "";
    c_Array.forEach((c_btn) => {
      c_btn.style.color = '#777';
    });
    document.getElementById("barra-destra").hidden = false;
    document.getElementById("mostra-commenti").hidden = true;
  } else {
    window.location.replace(`https://site212251.tw.cs.unibo.it/editor?post_id=` + id);
  }
}

function rimpiazza_commenti(id) {
  //elimina tutto il contenuto del cont_commenti
  document.getElementById("contenitore-commenti").innerHTML = '';

  //aggiungi nuovi commenti
  let contenitore_commenti = document.getElementById("contenitore-commenti");
  let lista_commenti;
  $.ajax({
    type: 'GET',
    dataType: "json",
    async: false,
    url: `https://site212251.tw.cs.unibo.it/squeal/${id}/reply`,
    headers: { },
    success: function (data, status, xhr) {
      lista_commenti = data.data;
    }
  });
  let n_commenti = lista_commenti.length;
  for (let c = 0; c < n_commenti; c++) {
    contenitore_commenti.insertAdjacentHTML('beforeend', '<div class="comment"><img src="https://via.placeholder.com/48x48" alt="Foto profilo del creatore del commento" class="comment-profile-image" id="c_img_utente' + c + '"> <div class="comment-content"> <button class="comment-username" id="c_username' + c + '" onclick="ricerca_squeal(this)">  </button> <p class="comment-text" id="c_text' + c + '">  </p> </div></div>');
    let c_img_utente = 'c_img_utente' + c;
    document.getElementById(c_img_utente).src = `https://site212251.tw.cs.unibo.it/uploads/${lista_commenti[c].img}`
    let id_tag = 'c_username' + c;
    document.getElementById(id_tag).innerHTML = lista_commenti[c].utente;
    let id_testo = 'c_text' + c;
    if (lista_commenti[c].contenuto == "testo") {
      //parole con @ all'inizio
      const at = /(?:^|\s)@(\w+)/g;
      const at_arr = lista_commenti[c].corpo.match(at);
      if (at_arr != null) {
        at_arr.forEach(function(nome) {
          lista_commenti[c].corpo = lista_commenti[c].corpo.replace(nome,'<button class="btn_nomi" onclick="ricerca_squeal(this)">' + nome + '</button>');
        });
      }
      document.getElementById(id_testo).innerHTML = lista_commenti[c].corpo;
    } else if(lista_commenti[c].contenuto == "img"){
      document.getElementById(id_testo).innerHTML = `<img src="https://site212251.tw.cs.unibo.it/uploads/${lista_commenti[c].corpo}" alt="immagine del commento">`
    } else if(lista_commenti[c].contenuto == "map"){
      document.getElementById(id_testo).innerHTML = `<img src="${lista_commenti[c].corpo}" alt="mappa del commento">`;
    }
  }
}



//NOTIFICHE
function ricerca_notifica(notifica) {
  if(document.getElementById(notifica.not_id).classList.contains("not_letta")){ //segno come letta (classe)
    document.getElementById(notifica.not_id).classList.remove("not_letta")
    document.getElementById(notifica.not_id).classList.add("letta")
  }

  if (notifica.tipo == "follow") {
    let elem_notifica = document.createElement('div');
    elem_notifica.innerHTML = notifica.ref_id;
    ricerca_squeal(elem_notifica);
  } else if (notifica.tipo == "menzione" || notifica.tipo == "risposta" || notifica.tipo == "popolarita") {
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
    rimpiazza_commenti(post_notifica.post_id);
    squeals = [post_notifica];
    let pulsante = document.getElementsByClassName("btn btn-reazioni c btn-group0");
    aggiungicommento(pulsante[0], 'apri', squeals[0].post_id);
  } else if(notifica.tipo === "privato"){
    inizia_chat(notifica.testo.split(" ")[0], "apri")
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
}

function ricerca_post(id_post) {
  let post_notifica;
  $.ajax({
    type: 'GET',
    dataType: "json",
    async: false,
    url: `https://site212251.tw.cs.unibo.it/squeal/${id_post}`,
    headers: { },
    success: function (data, status, xhr) {
      post_notifica = data.data;
    }
  });
  rimpiazza_squeals([post_notifica], "filtro");
  rimpiazza_commenti(post_notifica.post_id);
  squeals = post_notifica;
  let pulsante = document.getElementsByClassName("btn btn-reazioni c btn-group0");
  aggiungicommento(pulsante[0], 'apri', squeals.post_id);
}

function scrollChatToBottom() {
    var chatContainer = document.getElementById('chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function inizia_chat(username, azione) {
  if (azione == 'apri') {
    document.getElementById("barra-destra").hidden = true;
    document.getElementById("chat").hidden = false;
    document.getElementById("chat_title").innerHTML = username;
    document.getElementById("messaggioInput").value = ""
    $("#messaggi_chat").empty()

    $.ajax({
      type: 'GET',
      dataType: "json",
      url: `https://site212251.tw.cs.unibo.it/user/chat/${username}`,
      headers: { },
      data: { current_user: CURRENT_USER,},
      success: function (data, status, xhr) {
        let messaggi = data["data"]["messaggi"]
        messaggi.forEach((el) => {
          if(el.user === CURRENT_USER){ //messaggio inviato
            $("#messaggi_chat").append(`<div class="message sent"><div class="message-content"><p>${el.text}</p></div></div>`)
          } else { // messaggio ricevuto
            $("#messaggi_chat").append(`<div class="message received"><div class="message-content"><p>${el.text}</p></div></div>`)
          }
        })
        scrollChatToBottom();
      },
      error: function (xhr, status, error) {
          if (xhr.status === 404 || xhr.status === 409) {

          }
      }
    });
  } else if (azione == 'chiudi') {
    document.getElementById("barra-destra").hidden = false;
    document.getElementById("chat").hidden = true;
    document.getElementById("messaggi_chat").innerHTML = ""
  }
}

function aggiungiMessaggio(){
  let target = document.getElementById("chat_title").innerHTML
  let contenuto = $("#messaggioInput").val()

  $.ajax({
    type: 'POST',
    dataType: "json",
    url: `https://site212251.tw.cs.unibo.it/user/chat/${target}`,
    headers: { },
    data: { current_user: CURRENT_USER, text: contenuto},
    success: function (data, status, xhr) {
      document.getElementById("messaggi_chat").innerHTML = ""
      inizia_chat(target, "apri")
    },
    error: function(xhr, status, error) {
        console.error("Error:", error);
    }
  });
}

function search_trend(keyword){
  let all_info;
  $.ajax({
    type: 'POST',
    dataType: "json",
    async: false,
    url: `https://site212251.tw.cs.unibo.it/squeal/by_keyword`,
    headers: { },
    data: { query: keyword, target: CURRENT_USER },
    success: function (data, status, xhr) {
      all_info = data.data;
    }
  });

  rimpiazza_squeals(all_info.post, "data");
  squeals = all_info.post;
}

function refresh_notifiche(){
  let notifiche;
  $.ajax({
    type: 'GET',
    dataType: "json",
    async: false,
    url: `https://site212251.tw.cs.unibo.it/notification/${CURRENT_USER}`,
    headers: { },
    success: function (data, status, xhr) {
      notifiche = data.data;
    }
  });

  //console.log("refresh notifications")
  //console.log("old last "+last_notifica_id)

  if(notifiche[0].timestamp > last_notifica_id){
    //console.log("FOUND NEW")
    let audio = new Audio('https://site212251.tw.cs.unibo.it/media/sounds/notification.mp3');
    audio.play();
    let lista_notifiche = document.getElementById('notificationsDropdown');

    var nots = notificationsDropdown.getElementsByTagName("a");
    for (var i = nots.length - 1; i >= 0; i--) {
      nots[i].parentNode.removeChild(nots[i]);
    }

    let n_notifiche = notifiche.length;
    let counter = 10
    for (var n = 0; n < n_notifiche; n++) {
      //costruzione notifica
      if(counter >= 0 || !notifiche[n].letta){
        let not_tipo = 'type="button" ';
        let not_id = 'id="' + notifiche[n].not_id + '" ';
        let not_class = 'class="dropdown-item ';
        if (notifiche[n].letta) {
          not_class = not_class + 'letta ';
        } else {
          not_class = not_class + 'not_letta ';
        }
        not_class = not_class + notifiche[n].tipo + '" ';
        let on_click = 'onclick="ricerca_notifica(notifiche[' + n + '])"';
  
        let notifica = '<a ' + not_tipo + not_id + not_class + on_click + '>' + notifiche[n].testo + '</a>';
        lista_notifiche.insertAdjacentHTML('beforeend', notifica);
        counter--
      }
    }
    last_notifica_id = notifiche[0].timestamp
    //console.log("new last "+last_notifica_id)
  }
}