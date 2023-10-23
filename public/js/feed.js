function aggiungi_squeal(squeals, meta) {
  var n_squeal = squeals.length;

  var contenitore = document.getElementById('squeal_contenitore');

  for (var i = 0; i < n_squeal; i++) {
    //setup
    var id = "squeals[" + i + "]._id";

    //squeal
    var htmlCode = '<div class="card squeal" id="' + squeals[i]._id + '">  <div class="card-header">    <img src="https://via.placeholder.com/60x60" alt="Profile Image" class="profile-image" id="squeal_img_utente' + i + '">    <div class="info_utente">      <span class="nome_utente" id="squeal_nome' + i + '">Nome Utente</span>      <span class="text-muted tag-username" id="squeal_tag' + i + '">username</span>      <span class="text-muted timestamp" id="squeal_timestamp' + i + '">10 minuti fa</span>    </div>    <div class="recipients-dropdown destinatari">      <button class="btn btn-destinatari dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" id="btn-destinatari' + i + '">        <i class="fa-solid fa-users destinatari-icona"></i>      </button>            <div class="dropdown-menu" aria-labelledby="destinatari" id="squeal_destinatari' + i + '">         <a class="dropdown-item" href="#">Alice</a>         <a class="dropdown-item" href="#">Bob</a>         <a class="dropdown-item" href="#">Charlie</a>         <!-- Aggiungi altri destinatari qui -->       </div>     </div>  </div>  <div class="card-body">    <p id="squeal_testo' + i + '"> </p>  </div>  <div class="card-footer">    <div class="row reazioni btn-group">      <div class="col reazioni-left">        <label class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, adoro, ' + id + ')">          <i class="fab fa-sketch reazioni-icone"> </i>          <span class="n-reazioni" id="squeal_sketch' + i + '"> 500 </span>        </label>        <label class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, mi_disgusta, ' + id + ')">          <i class="fas fa-poo reazioni-icone"> </i>          <span class="n-reazioni" id="squeal_poo' + i + '"> 500 </span>        </label>      </div>      <div class="col reazioni-mid">        <label class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, mi_piace, ' + id + ')">          <i class="fas fa-heart reazioni-icone">  </i>          <span class="n-reazioni" id="squeal_heart' + i + '"> 500 </span>        </label>        <label class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, odio, ' + id + ')">          <i class="fas fa-heart-crack reazioni-icone"> </i>          <span class="n-reazioni" id="squeal_disheart' + i + '"> 500 </span>        </label>      </div>      <div class="col reazioni-right">        <label class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, concordo, ' + id + ')">          <i class="fas fa-thumbs-up reazioni-icone"> </i>          <span class="n-reazioni" id="squeal_like' + i + '"> 500 </span>        </label>        <label class="btn btn-reazioni btn-group' + i + '" onclick="premibottone(this, sono_contrario, ' + id + ')">          <i class="fas fa-thumbs-down reazioni-icone"> </i>          <span class="n-reazioni" id="squeal_dislike' + i + '"> 500 </span>        </label>      </div>      <div class="col commenti">        <label class="btn btn-reazioni btn-group' + i + '">          <i class="fa-solid fa-comments reazioni-icone"></i>          <span class="n-reazioni" id="squeal_comment' + i + '"> 500 </span>        </label>      </div>    </div>    <div class="info-post" id="squeal_info' + i + '">      <span class="visual" id="squeal_visual' + i + '">        <i class="fa-solid fa-eye icona-visual"></i>        500      </span>    </div>  </div></div>';
    contenitore.insertAdjacentHTML('beforeend', htmlCode);

    //info utente
    var id_nome = 'squeal_nome' + i;
    var id_tag = 'squeal_tag' + i;
    var id_timestamp = 'squeal_timestamp' + i;
    document.getElementById(id_nome).innerHTML = squeals[i].nome;
    document.getElementById(id_tag).innerHTML = squeals[i].utente;
    document.getElementById(id_timestamp).innerHTML = squeals[i].timestamp;

    //corpo squeal
    var id_testo = 'squeal_testo' + i;
    if(squeals[i].contenuto == "testo"){
      document.getElementById(id_testo).innerHTML = squeals[i].corpo;
    } else if(squeals[i].contenuto == "img"){
      document.getElementById(id_testo).innerHTML = `<img src="http://site212251.tw.cs.unibo.it/uploads/${squeals[i].corpo}" alt="immagine_squeal">`
    }
    //destinatari
    if (squeals[i].tipo_destinatari != null) {
      var id_destinatari = 'btn-destinatari' + i;
      if (squeals[i].tipo_destinatari == "canali"){
        var bottone_destinatari_canali = '<i class="fa-solid fa-users destinatari-icona"></i>'
        document.getElementById(id_destinatari).innerHTML = bottone_destinatari_canali;
      } else if (squeals[i].tipo_destinatari == "utenti") {
        var bottone_destinatari_utenti = '<i class="fa-solid fa-user destinatari-icona"></i>'
        document.getElementById(id_destinatari).innerHTML = bottone_destinatari_utenti;
      }
      var lista_destinatari = document.getElementById('squeal_destinatari' + i);
      var n_destinatari = squeals[i].destinatari.length;
      for (var j = 0; j < n_destinatari; j++) {
        lista_destinatari.insertAdjacentHTML('beforeend', '<a class="dropdown-item" href="#" onclick="nomeprovvisorio()">' + squeals[i].destinatari[j] + '</a>');
      }
    }

    //reazioni
    var id_sketch = 'squeal_sketch' + i;
    document.getElementById(id_sketch).innerHTML = squeals[i].reazioni.positive.adoro.length;
    var id_poo = 'squeal_poo' + i;
    document.getElementById(id_poo).innerHTML = squeals[i].reazioni.negative.mi_disgusta.length;
    var id_heart = 'squeal_heart' + i;
    document.getElementById(id_heart).innerHTML = squeals[i].reazioni.positive.mi_piace.length;
    var id_disheart = 'squeal_disheart' + i;
    document.getElementById(id_disheart).innerHTML = squeals[i].reazioni.negative.odio.length;
    var id_like = 'squeal_like' + i;
    document.getElementById(id_like).innerHTML = squeals[i].reazioni.positive.concordo.length;
    var id_dislike = 'squeal_dislike' + i;
    document.getElementById(id_dislike).innerHTML = squeals[i].reazioni.negative.sono_contrario.length;

    //console.log("fv");
    //get_cookie_by_name("username")
    
    //aggiungo le reaction gia' inserite
    //come user (smm) o come account gestito (se esiste il cookie)
    let target_user = get_cookie_by_name("username")
    let managed = get_cookie_by_name("managed")
    if(!(managed === undefined))
      target_user = managed

    if (squeals[i].reazioni.positive.adoro.includes(target_user)) {
      var nreazioni0 = document.getElementById(id_sketch);
      var premuto0 = nreazioni0.parentNode;
      premuto0.style.color= "#00AFFF";
      premuto0.checked = true;
    } else if (squeals[i].reazioni.negative.mi_disgusta.includes(target_user)) {
      var nreazioni1 = document.getElementById(id_poo);
      var premuto1 = nreazioni1.parentNode;
      premuto1.style.color= "#8B4513";
      premuto1.checked = true;
    } else if (squeals[i].reazioni.positive.mi_piace.includes(target_user)) {
      var nreazioni2 = document.getElementById(id_heart);
      var premuto2 = nreazioni2.parentNode;
      premuto2.style.color= "#FF0000";
      premuto2.checked = true;
    } else if (squeals[i].reazioni.negative.odio.includes(target_user)) {
      var nreazioni3 = document.getElementById(id_disheart);
      var premuto3 = nreazioni3.parentNode;
      premuto3.style.color= "#FF0000";
      premuto3.checked = true;
    } else if (squeals[i].reazioni.positive.concordo.includes(target_user)) {
      var nreazioni4 = document.getElementById(id_like);
      var premuto4 = nreazioni4.parentNode;
      premuto4.style.color= "#007FFF";
      premuto4.checked = true;
    } else if (squeals[i].reazioni.negative.sono_contrario.includes(target_user)) {
      var nreazioni5 = document.getElementById(id_dislike);
      var premuto5 = nreazioni5.parentNode;
      premuto5.style.color= "#007FFF";
      premuto5.checked = true;
    }

    //etichette
    var id_visual = 'squeal_visual' + i;
    document.getElementById(id_visual).innerHTML = '<i class="fa-solid fa-eye visual-icona"></i>' + squeals[i].visualizzazioni;
    if (squeals[i].categoria == "popolare"){
      var Et_popolarita = document.getElementById('squeal_info' + i);
      Et_popolarita.insertAdjacentHTML('beforeend', '<span class="label-squeal popolare"> Popolare </span>');
    } else if (squeals[i].categoria == "impopolare"){
      var Et_popolarita = document.getElementById('squeal_info' + i);
      Et_popolarita.insertAdjacentHTML('beforeend', '<span class="label-squeal impopolare"> Impopolare </span>');
    } else if (squeals[i].categoria == "controverso"){
      var Et_popolarita = document.getElementById('squeal_info' + i);
      Et_popolarita.insertAdjacentHTML('beforeend', '<span class="label-squeal controverso"> Controverso </span>');
    }
    if (squeals[i].automatico){
      var Et_auto = document.getElementById('squeal_info' + i);
      Et_auto.insertAdjacentHTML('beforeend', '<span class="label-squeal auto"> Auto </span>');
    }
    /*if (!squeals[i].pubblico){ // deprecato
      var Et_pubblico = document.getElementById('squeal_info' + i);
      Et_pubblico.insertAdjacentHTML('beforeend', '<span class="label-squeal pubblico"> Privato </span>');
    }*/
  }
  //FINE SQUEAL
}

//RICERCA SQUEAL...
function ricerca_squeal() {
  //check query vuota
  if (document.getElementById("query").value.length == 0) { 
    alert("Inserisci qualcosa da cercare");  	
    return false; 
  }

  //check tipo document.getElementById("tipo").value

  //check filtro document.getElementById("filtro").value


  var query = document.getElementById("query").value;
  var tipo = document.getElementById("tipo").value;
  var filtro = document.getElementById("filtro").value;

  var all_info;
  $.ajax({
    type: 'POST',
    dataType: "json",
    async: false,
    url: `https://site212251.tw.cs.unibo.it/search`,
    headers: { },
    body: { query: query, tipo: tipo, filtro: filtro },
    success: function (data, status, xhr) {
      console.log('data: ', data);
      all_info = data;
    }
  });







  
  aggiungi_squeal(all_info.post, all_info.meta);

  return true;
}