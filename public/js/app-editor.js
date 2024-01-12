function cambia_campo(opzione) {
    var switchToggle = document.getElementById('switchToggle');
    var textarea = document.getElementById('Textarea');

    $("#contenuto_testo").attr("hidden", "true")
    $("#contenuto_immagine").attr("hidden", "true")
    $("#contenuto_posizione").attr("hidden", "true")
    $(".icona-scelta").removeClass("attiva");

    if (opzione == "Testo") {
        //resetQuota()
        $("#contenuto_testo").attr("hidden", false)
        $(".icona-scelta.fas.fa-font").addClass("attiva");
        if ($(".icona-scelta.fas.fa-font").hasClass("attiva")) {
            aggiornaQuota("Testo");
        }
    } else if (opzione == "Immagine") {
        //resetQuota()
        $("#contenuto_immagine").attr("hidden", false)
        $(".icona-scelta.fas.fa-image").addClass("attiva");
        if ($(".icona-scelta.fas.fa-image").hasClass("attiva")&& inputImage.files && inputImage.files[0]) {
            aggiornaQuota("Immagine");
        }
    } else if (opzione == "Posizione") {
        //resetQuota()
        $("#contenuto_posizione").attr("hidden", false)
        $(".icona-scelta.fas.fa-map-marker-alt").addClass("attiva");
        if ($(".icona-scelta.fas.fa-map-marker-alt").hasClass("attiva")) {
            aggiornaQuota("Posizione");
        }
    }
}

//DESTINATARI
function mostraCampo(tipo) {
    var destinatariInseritiDiv = document.getElementById("destinatari-inseriti");

    // Nascondi tutti i campi inizialmente
    document.getElementById("campo-canali").hidden = true;
    document.getElementById("campo-utenti").hidden = true;
    document.getElementById("lista_destinatari").hidden = false;
    document.getElementById("campo-bacheca").hidden = true;

    // Rimuovi la classe 'attiva' da tutte le icone
    var icone = document.querySelectorAll(".tipo-icona");
    icone.forEach(function (icona) {
      icona.classList.remove("attiva");
    });

    // Mostra il campo corrispondente al tipo selezionato
    if (tipo === "canali") {
      document.getElementById("campo-canali").hidden = false;
      document.getElementById("lista_destinatari").hidden = true;
      destinatariInseritiDiv.innerHTML = "";
      array_dest_utenti = [];
      document.getElementById("icona-canali").classList.add("attiva");

    } else if (tipo === "utenti") {
      document.getElementById("campo-utenti").hidden = false;
      document.getElementById("lista_destinatari").hidden = true;
      destinatariInseritiDiv.innerHTML = "";
      array_dest_canali = [];
      document.getElementById("icona-utenti").classList.add("attiva");

    } else if (tipo === "bacheca") {
      document.getElementById("lista_destinatari").hidden = true;
      document.getElementById("campo-bacheca").hidden = false;
      destinatariInseritiDiv.innerHTML = "";
      array_dest_utenti = [];
      array_dest_canali = [];
      document.getElementById("icona-bacheca").classList.add("attiva");

    }
  }


  function check_destinatari_canali() {
    var a = $("#cerca_destinatari_canali").val();//nome destinatario da cercare (per ora gestisco solo canali)
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

        //rimuovo $ iniziale per visualizzazione in lista
        a = a.substring(1)
        if (!array_dest_canali.includes(a)) {
            // Aggiungi il destinatario al riquadro dei destinatari inseriti
            $("#destinatari-inseriti").append(`
              <div class="inserito-item name-${a}">
              <div class="left-content">
                <i class="fas fa-users"></i>
                <p>${a}</p>
              </div>
              <div class="right-content">
                <p class="rimuovi" onclick="rimuovi_destinatario('${a}', array_dest_canali)"><i class="fas fa-times"></i></p>
              </div>
              </div>
            `);
            document.getElementById("lista_destinatari").hidden = false;
            array_dest_canali.push(a); // Aggiungi all'array
            $("#cerca_destinatari_canali").val(""); // Resetta il campo
          }
      },
      error: function (xhr, status, e){
        alert("Il canale selezionato non esiste o l'utente non ha permessi di scrittura")
      }
    });
  }

  function check_destinatari_utenti() {
    var a = $("#cerca_destinatari_utenti").val();//nome utente da cercare
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
        if (!array_dest_utenti.includes(a)) {
          // Aggiungi il destinatario al riquadro dei destinatari inseriti
          $("#destinatari-inseriti").append(`
            <div class="inserito-item name-${a}">
            <div class="left-content">
              <i class="fas fa-users"></i>
              <p>${a}</p>
            </div>
            <div class="right-content">
              <p class="rimuovi" onclick="rimuovi_destinatario('${a}', array_dest_utenti)"><i class="fas fa-times"></i></p>
              </div>
            </div>
          `);
          document.getElementById("lista_destinatari").hidden = false;
          array_dest_utenti.push(a); // Aggiungi all'array
          $("#cerca_destinatari_utenti").val(""); // Resetta il campo
        }
      },
      error: function (xhr, status, e){
        alert("L'utente selezionato non esiste")
      }
    });
  }

  function rimuovi_destinatario(nome, array_dest) {
    $(`#destinatari-inseriti .name-${nome}`).remove();

    // Rimuovi il destinatario dall'array
    const index = array_dest.indexOf(nome);
    if (index !== -1) {
      array_dest.splice(index, 1);
    }
    var destinatariInseritiDiv = document.getElementById("destinatari-inseriti");
    var listaDestinatariDiv = document.getElementById("lista_destinatari");

    // Verifica se il div "destinatari-inseriti" è vuoto
    if (destinatariInseritiDiv.innerHTML.trim() == "") {
      // Imposta "hidden" su true per "lista_destinatari"
      listaDestinatariDiv.hidden = true;
    } else {
      // Altrimenti, imposta "hidden" su false per "lista_destinatari"
      listaDestinatariDiv.hidden = false;
    }
  }

  function check_post() {
    // Verifica se ci sono destinatari selezionati
    let arr = window.location.href.split('?');
    if (!((arr.length > 1 && arr[1] !== '') || (!document.getElementById("campo-bacheca").hidden))) { //caso risposta o bacheca, no destinatari
      if ($("#destinatari-inseriti").children().length == 0) {
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
    // Altri controlli se necessari, come il testo, immagini o posizione
    return true;
  }