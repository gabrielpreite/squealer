function cambia_campo(opzione) {
    $("#contenuto_testo").attr("hidden", "true");
    $("#contenuto_immagine").attr("hidden", "true");
    $("#contenuto_posizione").attr("hidden", "true");
    $("#contenuto_ghigliottina").attr("hidden", "true");

    let icone = document.querySelectorAll(".post-tipo");
    icone.forEach(function (icona) {
      icona.classList.remove("attiva");
    });

    if (opzione == "Testo") {
        resetQuota()
        $("#contenuto_testo").attr("hidden", false);
        $("#Textarea").attr("disabled", false);
        $("#Textarea-g").attr("disabled", true);
        icone[0].classList.add("attiva");
        aggiornaQuota("Testo");
    } else if (opzione == "Immagine") {
        resetQuota()
        $("#contenuto_immagine").attr("hidden", false);
        icone[1].classList.add("attiva");
        aggiornaQuota("Immagine");
    } else if (opzione == "Posizione") {
        resetQuota()
        $("#contenuto_posizione").attr("hidden", false);
        icone[2].classList.add("attiva");
        aggiornaQuota("Posizione");
    } else if (opzione == "Ghigliottina") {
        resetQuota()
        $("#contenuto_ghigliottina").attr("hidden", false);
        $("#Textarea-g").attr("disabled", false);
        $("#Textarea").attr("disabled", true);
        icone[3].classList.add("attiva");
        aggiornaQuota("Ghigliottina");
        toggleCorpoGhigliottina();
    }
}

//DESTINATARI
function mostraCampo(tipo) {
    //tutto invisibile
    document.getElementById("campo-dest").hidden = true;
    document.getElementById("campo-bacheca").hidden = true;

    let icone = document.querySelectorAll(".tipo-icona");
    icone.forEach(function (icona) {
      icona.classList.remove("attiva");
    });

    if (tipo === "canali") {
        document.getElementById("campo-dest").hidden = false;
        document.getElementById("icona-canali").classList.add("attiva");

    } else if (tipo === "utenti") {
        document.getElementById("campo-dest").hidden = false;
        document.getElementById("icona-utenti").classList.add("attiva");

    } else if (tipo === "bacheca") {
        document.getElementById("campo-bacheca").hidden = false;
        document.getElementById("icona-bacheca").classList.add("attiva");

    }
    chip_n = 0;
    while (chip_arr[0].chipsData.length != 0) {
        chip_arr[0].deleteChip(0);
    }
}

function aggiungi_dest() {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    which: 13,
    keyCode: 13,
  });
  document.getElementById("destinatari").dispatchEvent(event);
}

async function check_destinatari(a) {
    if (document.getElementById("icona-canali").classList.length == 2) {

        if (!a.startsWith('$')) {
            a = "$".concat(a)
        }
        $.ajax({
            type: 'GET',
            dataType: "json",
            url: `https://site212251.tw.cs.unibo.it/channel/${a}/auth?userid=${CURRENT_USER}`,
            headers: {
            },
            success: function (data, status, xhr) {//canale esiste e utente ha i permessi
                chip_n = chip_n + 1;
                return true;
            },
            error: function (xhr, status, e){
                chip_arr[0].deleteChip(chip_n);
                alert("Il canale selezionato non esiste o l'utente non ha permessi di scrittura");
                return false;
            }
        });
    } else {
        //nome utente da cercare
        if (a.startsWith('@')) {
            a = a.substring(1)
        } else if (a == get_cookie_by_name("username")) {
            chip_arr[0].deleteChip(chip_n);
            alert("Non è possibile inserire il proprio username tra i destinatari");
            return;
        }
        $.ajax({
            type: 'GET',
            dataType: "json",
            url: `https://site212251.tw.cs.unibo.it/user/${a}`,
            headers: {
            },
            success: function (data, status, xhr) {//canale esiste e utente ha i permessi
                chip_n = chip_n + 1;
                return true;
            },
            error: function (xhr, status, e){
                chip_arr[0].deleteChip(chip_n);
                alert("L'utente selezionato non esiste");
                return false;
            }
        });
    }
}

function check_destinatari_canali(a) {
    //nome destinatario da cercare
    if (!a.startsWith('$')) {
      a = "$".concat(a)
    }
    $.ajax({
        type: 'GET',
        dataType: "json",
        url: `${window.location.origin}/channel/${a}/auth?userid=${CURRENT_USER}`,
        headers: {
        },
        success: function (data, status, xhr) {//canale esiste e utente ha i permessi
            return true;
        },
        error: function (xhr, status, e){
            alert("Il canale selezionato non esiste o l'utente non ha permessi di scrittura");
            return false;
        }
    });
}

function check_destinatari_utenti(a) {
    //nome utente da cercare
    if (a.startsWith('@')) {
      a = a.substring(1)
    } else if (a == get_cookie_by_name("username")) {
      alert("Non è possibile inserire il proprio username tra i destinatari");
      return;
    }
    $.ajax({
        type: 'GET',
        dataType: "json",
        url: `${window.location.origin}/user/${a}`,
        headers: {
        },
        success: function (data, status, xhr) {//canale esiste e utente ha i permessi
            return true;
        },
        error: function (xhr, status, e){
            alert("L'utente selezionato non esiste");
            return false;
        }
    });
}

//CREAZIONE NUOVI POST
function check_post() {
    if (document.getElementById("campo-bacheca").hidden) { //caso bacheca
        if (document.getElementById("mostra-squeal").hidden == false) { //caso risposta

        } else if (!(chip_arr[0].chipsData.length > 0)) { //caso no destinatari
            alert("Nessun destinatario selezionato");
            return false;
        }
    }
    if(!$("#contenuto_testo").attr("hidden")) {//caso testo
      if (document.getElementById("Textarea").value == '') {
        alert("Nessun testo inserito");
        return false;
      }
    } else if (!$("#contenuto_immagine").attr("hidden")) {//caso img
      if (document.getElementById("img").files.length == 0) {
        alert("Nessuna immagine inserita");
        return false;
      }
    } else if (!$("#contenuto_posizione").attr("hidden")) {//caso map
      if (marker.position == undefined) {
        alert("Nessuna posizione inserita");
        return false;
      }
      mapeado(map, marker);
    }
    return true;
}

function add_post(){
    if(check_post() == true){
        const formData = new FormData(document.getElementById("crea_post"))

        formData.append("user_id", CURRENT_USER)

        if (!$("#contenuto_testo").attr("hidden")) {//caso testo
            formData.append("contenuto", "testo")
        } else if (!$("#contenuto_immagine").attr("hidden")) {//caso img
            formData.append("contenuto", "img")
        } else if (!$("#contenuto_posizione").attr("hidden")) {//caso map
            formData.append("contenuto", "map")
        } else if (!$("#contenuto_ghigliottina").attr("hidden")) {//caso map
          formData.append("contenuto", "testo")
        }

        let arr = window.location.href.split('?');
        if (arr.length > 1 && arr[1] !== '') { //caso risposta, nessun destinatario
            formData.append("post_id", arr[1].split("=")[1]);
            formData.append("destinatari", JSON.stringify([]))
        } else { //caso post originali, destinatari dipendono dalla scelta utente
            let array_dest = [];
            let x = 0;
            chip_arr[0].chipsData.forEach(function (){
                array_dest[x] = chip_arr[0].chipsData[x].tag;
                x = x + 1;
            });
            if(document.getElementById("icona-canali").classList.length == 2){//caso canali
                //aggiungo $ prima di ogni canale
                array_dest.forEach(function(nome, index, array) {
                    array[index] = "$" + nome;
                });
                formData.append("destinatari", JSON.stringify(array_dest))
                formData.append("tipo_destinatari", "canali")
            }else if(document.getElementById("icona-utenti").classList.length == 2){//caso utenti
                formData.append("destinatari", JSON.stringify(array_dest))
                formData.append("tipo_destinatari", "utenti")
            }else if(!$("#campo-bacheca").attr("hidden")){//caso bacheca
                formData.append("destinatari", JSON.stringify([]))
            }
        }

        //ghigliottina
        if (!$("#contenuto_ghigliottina").attr("hidden")){
            formData.append("ghigliottina", "true")

            formData.append("timer", document.getElementById("intervallo").value)

            parole = ""
            for(let i=1; i<5; i++){
              parole+=document.getElementById("parola"+i).value
              parole+=", "
            }
            parole+=document.getElementById("parola5").value

            formData.append("parole", parole)

            formData.append("soluzione", document.getElementById("parolaDaIndovinare").value)
        }

        fetch("/squeal", {
            method: "POST",
            body: formData,
        })
        .then((response) => {
            if (response.ok) {
                window.location.replace("https://site212251.tw.cs.unibo.it/app");
            } else {
                throw new Error("Network response was not ok.");
            }
        })
    }
}

//RISPOSTA
function interfaccia_risposta(post_id){
    //Nascondi il div destinatari
    document.getElementById("post-dest").hidden = true;

    //Nascondi ghigliottina
    document.getElementById("id-ghigliottina").hidden = true;

    //Mostra il div risposta
    document.getElementById("mostra-squeal").hidden = false;

    //prendo il post originale
    let post_originale;
    $.ajax({
      type: 'GET',
      dataType: "json",
      async: false,
      url: `https://site212251.tw.cs.unibo.it/squeal/${post_id}`,
      headers: { },
      success: function (data, status, xhr) {
        post_originale = data.data;
      }
    });

    // stampo il post con i commenti
    aggiungisqueal(post_originale, post_id);
}

function aggiungisqueal(post, id) {
    document.getElementById("squeal-nome-utente").innerHTML = post.nome;
    document.getElementById("squeal-username").innerHTML = post.utente;
    document.getElementById("squeal-data").innerHTML = timeConverter(post.timestamp);
    document.getElementById("squeal-immagine-profilo").src = `https://site212251.tw.cs.unibo.it/uploads/${post.img}`

    //corpo squeal
    if(post.contenuto == "testo"){
    document.getElementById("squeal-contenuto").innerHTML = post.corpo;
    } else if(post.contenuto == "img"){
    document.getElementById("squeal-contenuto").innerHTML = `<img class="img_squeal" src="https://site212251.tw.cs.unibo.it/uploads/${post.corpo}" alt="immagine dello squeal">`
    } else if(post.contenuto == "map"){
    document.getElementById("squeal-contenuto").innerHTML = `<img class="img_squeal" src="${post.corpo}" alt="mappa dello squeal">`;
    }

    //aggiungi commenti
    let lista_commenti;
    let contenitore_commenti = document.getElementById("contenitore-commenti");
    if (post.numRisposte > 0) {
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
            contenitore_commenti.insertAdjacentHTML('beforeend', '<div class="chip comment"><img src="https://via.placeholder.com/48x48" alt="Foto profilo del creatore del commento" class="comment-profile-image" id="c_img_utente' + c + '"> <div class="comment-content"> <div class="comment-username" id="c_username' + c + '">  </div> <p class="comment-text" id="c_text' + c + '">  </p> </div></div> <br><br>');
            let c_img_utente = 'c_img_utente' + c;
            document.getElementById(c_img_utente).src = `https://site212251.tw.cs.unibo.it/uploads/${lista_commenti[c].img}`
            let id_tag = 'c_username' + c;
            document.getElementById(id_tag).innerHTML = lista_commenti[c].utente;
            let id_testo = 'c_text' + c;
            if (lista_commenti[c].contenuto == "testo") {
            document.getElementById(id_testo).innerHTML = lista_commenti[c].corpo;
            } else if(lista_commenti[c].contenuto == "img"){
            document.getElementById(id_testo).innerHTML = `<img class="img_squeal" src="https://site212251.tw.cs.unibo.it/uploads/${lista_commenti[c].corpo}" alt="immagine del commento">`
            } else if(lista_commenti[c].contenuto == "map"){
            document.getElementById(id_testo).innerHTML = `<img class="img_squeal" src="${lista_commenti[c].corpo}" alt="mappa del commento">`;
            }
        }
    } else {
        contenitore_commenti.innerHTML = "Nessuno ha ancora commentato";
    }
}

//GHIGLIOTTINA
function updateIntervalloVal() {
    let intervalloInput = document.getElementById('intervallo');
    let intervalloVal = document.getElementById('intervallo-val');
    let textarea_g = document.getElementById('Textarea-g');

    intervalloVal.textContent = intervalloInput.value + " min";
    if (intervalloInput.value == 1) {
      textarea_g.value = 'Ho avviato una nuova partita di #ghigliottina! Le parole saranno pubblicate ogni ' + intervalloInput.value + ' minuto.';
    } else {
      textarea_g.value = 'Ho avviato una nuova partita di #ghigliottina! Le parole saranno pubblicate ogni ' + intervalloInput.value + ' minuti.';
    }
}

function toggleCorpoGhigliottina() {
    let textarea_g = document.getElementById('Textarea-g');
    let intervalloInput = document.getElementById('intervallo');

    textarea_g.value = 'Ho avviato una nuova partita di #ghigliottina!\nLe parole saranno pubblicate ogni ' + intervalloInput.value + ' minuti.';
    textarea_g.readOnly = true;
}

//MAPPA
function initMap() {
    infoWindow = new google.maps.InfoWindow();
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 41.9028, lng: 12.4964 }, // Coordinate di Roma
      zoom: 5, // Livello di zoom 5
    });

    const locationButton = document.createElement("button");

    locationButton.type = "button";
    locationButton.textContent = "Trova la mia posizione";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(locationButton);

    marker = new google.maps.Marker({
      map,
      animation: google.maps.Animation.DROP,
    });

    map.addListener("click", (event) => {
      placeMarker(event.latLng);
    });

    locationButton.addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            map.panTo(pos);
            map.setZoom(13);
            marker.setPosition(pos);

            infoWindow.close();
          },
          () => {
            handleLocationError(true, infoWindow, map.getCenter());
          }
        );
      } else {
        handleLocationError(false, infoWindow, map.getCenter());
      }
      return false;
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Errore: il servizio di geolocalizzazione ha fallito."
      : "Errore: il tuo browser non supporta la geolocalizzazione."
  );
  infoWindow.open(map);
}

function placeMarker(location) {
  if (marker) {
    marker.setMap(null);
  }

  marker = new google.maps.Marker({
    position: location,
    map: map,
    animation: google.maps.Animation.DROP,
  });

  infoWindow.close(); 
}

function mapeado(map, marker) {
  let staticMapUrl = "https://maps.googleapis.com/maps/api/staticmap";

  //Set the Google Map Center.
  staticMapUrl += "?center=" + map.getCenter().lat() + "," + map.getCenter().lng();

  //Set the Google Map Size.
  staticMapUrl += "&size=640x480&scale=2";

  //Set the Google Map Type. roadmap/satellite/hybrid/terrain
  staticMapUrl += "&maptype=hybrid";

  //Set the Google Map Zoom.
  staticMapUrl += "&zoom=" + map.zoom;

  //Loop and add Markers.
  staticMapUrl += "&markers=" + marker.position.lat() + "," + marker.position.lng();

  //Key
  staticMapUrl += "&key=" + "AIzaSyCtn7I5voEPaO8mICMoW4BiF8Q7D7uWHog";

  //Display the Image of Google Map.
  document.getElementById("Textarea").value = staticMapUrl;

  return staticMapUrl;
}

//QUOTA
function resetQuota() {
  charCount_g.textContent = initialQuota_g;
  charCount_s.textContent = initialQuota_s;
  charCount_m.textContent = initialQuota_m;

  charCount_g.classList.remove('negative');
  charCount_s.classList.remove('negative');
  charCount_m.classList.remove('negative');

  button.classList.remove('button-disabled');
}

function aggiornaQuota(opzione) {
  if(opzione == "Testo") {
      const charLength = textarea.value.length;
      remainingChars_g = initialQuota_g - charLength;
      remainingChars_s = initialQuota_s// - charLength;
      remainingChars_m = initialQuota_m// - charLength;
  } else if (opzione == "Immagine") {
      remainingChars_g = initialQuota_g - 120;
      remainingChars_s = initialQuota_s// - 120;
      remainingChars_m = initialQuota_m// - 120;
  } else if (opzione == "Posizione") {
      remainingChars_g = initialQuota_g - 120;
      remainingChars_s = initialQuota_s// - 120;
      remainingChars_m = initialQuota_m// - 120;
  } else if(opzione == "Ghigliottina") {
    const charLength = document.getElementById("Textarea-g").value.length;
    remainingChars_g = initialQuota_g - charLength;
    remainingChars_s = initialQuota_s// - charLength;
    remainingChars_m = initialQuota_m// - charLength;
  }

  charCount_g.textContent = remainingChars_g;
  charCount_s.textContent = remainingChars_s;
  charCount_m.textContent = remainingChars_m;

  if (remainingChars_g < 0) {
    charCount_g.classList.add('negative');
  } else {
    charCount_g.classList.remove('negative');
  }
  if (remainingChars_s < 0) {
    charCount_s.classList.add('negative');
  } else {
    charCount_s.classList.remove('negative');
  }
  if (remainingChars_m < 0) {
    charCount_m.classList.add('negative');
  } else {
    charCount_m.classList.remove('negative');
  }

  const remainingChars = [remainingChars_g, remainingChars_s, remainingChars_m];
  if (remainingChars.some((count) => count < 0)) {
    button.classList.add('disabled');
    button.classList.add("red")
    button.value = "Compra quota";
  } else {
    button.classList.remove('disabled');
    button.classList.remove("red");
    button.value = "Conferma";
  }
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

    let new_quota = parseInt(get_cookie_by_name("quota_g"))+qnt
    //aggiorno il cookie quota
    set_cookie("quota_g", new_quota)
    //aggiorno navbar
    $("#charCount_giorno").text(new_quota)
    $("#charCount_giorno_vis").text(new_quota)
    //aggiorno initialQ
    initialQuota_g = new_quota;
    //aggiornaquota
    if(!$("#contenuto_testo").attr("hidden")) {//caso testo
      aggiornaQuota("Testo");
    } else if (!$("#contenuto_immagine").attr("hidden")) {//caso img
      aggiornaQuota("Immagine");
    } else if (!$("#contenuto_posizione").attr("hidden")) {//caso map
      aggiornaQuota("Posizione");
    } else if (!$("#contenuto_ghigliottina").attr("hidden")) {//caso ghigliottina
      aggiornaQuota("Ghigliottina");
    }
  })
}

//PULSANTE MIO PROFILO NAVBAR
function mio_profilo() {
  window.location.replace(`https://site212251.tw.cs.unibo.it/app-search?user`);
}
