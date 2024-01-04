function aggiungi_squeal(squeals) {
  let n_squeal = squeals.length;

  let contenitore = document.getElementById('squeal_contenitore');

  for (let i = 0; i < n_squeal; i++) {
    //setup
    let id = "squeals[" + i + "].post_id";

    //squeal
    let htmlCode = '<div class="card" id="' + squeals[i].post_id + '">  <div class="card-content">    <div class="card-info valign-wrapper">      <div class="col s3 center-align">        <img src="https://via.placeholder.com/60x60" alt="Foto profilo di chi ha creato lo squeal" class="profile-image circle" id="squeal_img_utente' + i + '">      </div>      <div class="col s9">        <span class="nome_utente" id="squeal_nome' + i + '">Nome Utente</span>        <br>        <a class="text-muted tag-username btn-flat" id="squeal_tag' + i + '" onclick="ricerca_squeal(this)">username</a>        <br>        <span class="text-muted timestamp" id="squeal_timestamp' + i + '">10 minuti fa</span>      </div>    </div>    <p id="squeal_testo' + i + '">Questo è il testo dello squeal</p>  </div>  <div class="card-tabs">    <ul class="tabs tabs-fixed-width">      <li class="tab"><a class="active" href="#reazioni' + i + '">Reazioni</a></li>      <li class="tab"><a href="#commenti' + i + '">Commenti</a></li>      <li class="tab"><a href="#destinatari' + i + '">Destinatari</a></li>    </ul>  </div>  <div class="card-content grey lighten-4">    <div id="reazioni' + i + '">      <div class="reazioni btn-group">        <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, adoro, ' + id + ')">          <i class="fab fa-sketch reazioni-icone"></i>          <span class="n-reazioni" id="squeal_sketch' + i + '">500</span>        </a>        <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, mi_piace, ' + id + ')">          <i class="fas fa-heart reazioni-icone"></i>          <span class="n-reazioni" id="squeal_heart' + i + '">500</span>        </a>        <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, concordo, ' + id + ')">          <i class="fas fa-thumbs-up reazioni-icone"></i>          <span class="n-reazioni" id="squeal_like' + i + '">500</span>        </a>        <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, sono_contrario, ' + id + ')">          <i class="fas fa-thumbs-down reazioni-icone"></i>          <span class="n-reazioni" id="squeal_dislike' + i + '">500</span>        </a>        <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, odio, ' + id + ')">          <i class="fas fa-heart-crack reazioni-icone"></i>          <span class="n-reazioni" id="squeal_disheart' + i + '">500</span>        </a>          <a class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, mi_disgusta, ' + id + ')">          <i class="fas fa-poo reazioni-icone"></i>          <span class="n-reazioni" id="squeal_poo' + i + '">500</span>        </a>      </div>      <div class="info-post" id="squeal_info' + i + '">        <span class="visual" id="squeal_visual' + i + '">          <i class="fa-solid fa-eye icona-visual"></i>          500        </span>      </div>    </div>    <div id="commenti' + i + '">      <div id="squeal_comment' + i + '">          </div>    </div>    <div id="destinatari' + i + '">      <div id="squeal_destinatari' + i + '">          </div>    </div>  </div></div>';
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
      document.getElementById(id_testo).innerHTML = `<img src="https://site212251.tw.cs.unibo.it/uploads/${squeals[i].corpo}" alt="immagine dello squeal">`
    } else if(squeals[i].contenuto == "map"){
      document.getElementById(id_testo).innerHTML = `<img src="${squeals[i].corpo}" alt="mappa dello squeal">`;
    }

    //destinatari
    let lista_destinatari = document.getElementById('squeal_destinatari' + i);
    let n_destinatari = squeals[i].destinatari.length;
    for (let j = 0; j < n_destinatari; j++) {
      lista_destinatari.insertAdjacentHTML('beforeend', '<div>' + squeals[i].destinatari[j] + '</div>');
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

    //commenti
    //let id_comment = 'squeal_comment' + i;
    //document.getElementById(id_comment).innerHTML = squeals[i].numRisposte;

    //aggiungi commenti
    let id_post = squeals[i].post_id;
    let id_comment = 'squeal_comment' + i;
    let contenitore_commenti = document.getElementById(id_comment);
    if (squeals[i].numRisposte > 0) {
      //let contenitore_commenti = document.getElementById("contenitore-commenti");
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
        contenitore_commenti.insertAdjacentHTML('beforeend', '<div class="chip comment"><img src="https://via.placeholder.com/48x48" alt="Foto profilo del creatore del commento" class="comment-profile-image" id="c_img_utente' + id_c + '"> <div class="comment-content"> <div class="comment-username" id="c_username' + id_c + '">  </div> <p class="comment-text" id="c_text' + id_c + '">  </p> </div></div>');
        let c_img_utente = 'c_img_utente' + id_c;
        document.getElementById(c_img_utente).src = `https://site212251.tw.cs.unibo.it/uploads/${lista_commenti[i][c].img}`
        let id_tag = 'c_username' + id_c;
        document.getElementById(id_tag).innerHTML = lista_commenti[i][c].utente;
        let id_testo = 'c_text' + id_c;
        if (lista_commenti[i][c].contenuto == "testo") {
          document.getElementById(id_testo).innerHTML = lista_commenti[i][c].corpo;
        } else if(lista_commenti[i][c].contenuto == "img"){
          document.getElementById(id_testo).innerHTML = `<img src="https://site212251.tw.cs.unibo.it/uploads/${lista_commenti[i][c].corpo}" alt="immagine del commento">`
        } else if(lista_commenti[i][c].contenuto == "map"){
          document.getElementById(id_testo).innerHTML = `<img src="${lista_commenti[i][c].corpo}" alt="mappa del commento">`;
        }
      }
    } else {
      contenitore_commenti.innerHTML = "Nessun commento da mostrare";
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

function aggiungi_info(meta){
  let container = $("#barra-destra")
  container.empty()
  container.removeAttr("hidden")

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

function ricarica() {
  location.reload();
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

  aggiungi_squeal(posts_ordinati);
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
    contenitore_commenti.insertAdjacentHTML('beforeend', '<div class="comment"><img src="https://via.placeholder.com/48x48" alt="Foto profilo del creatore del commento" class="comment-profile-image" id="c_img_utente' + c + '"> <div class="comment-content"> <button class="comment-username" id="c_username' + c + '">  </button> <p class="comment-text" id="c_text' + c + '">  </p> </div></div>');
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
          lista_commenti[c].corpo = lista_commenti[c].corpo.replace(nome,'<a class="btn_nomi disabled">' + nome + '</a>');
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
