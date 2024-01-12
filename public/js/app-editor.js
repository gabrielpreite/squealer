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

    //tutto invisibile
    document.getElementById("campo-dest").hidden = true;
    document.getElementById("campo-bacheca").hidden = true;

    // Rimuovi la classe 'attiva' da tutte le icone
    var icone = document.querySelectorAll(".tipo-icona");
    icone.forEach(function (icona) {
      icona.classList.remove("attiva");
    });

    // Mostra il campo corrispondente al tipo selezionato
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
}

function check_destinatari(chip_txt) {
    if (document.getElementById("icona-canali").classList.length == 2) {
        if (check_destinatari_canali(chip_txt)) {
            chip_n = chip_n + 1;
        } else {
            chip_arr[0].deleteChip(chip_n);
        }
    } else {
        if (check_destinatari_utenti(chip_txt)) {
            chip_n = chip_n + 1;
        } else {
            chip_arr[0].deleteChip(chip_n);
        }
    }
}

function check_destinatari_canali(a) {
    //nome destinatario da cercare (per ora gestisco solo canali) = a
    if (!a.startsWith('$')) {
      a = "$".concat(a)
    }
    var ret;
    $.ajax({
      type: 'GET',
      dataType: "json",
      url: `${window.location.origin}/channel/${a}/auth?userid=${CURRENT_USER}`,
      headers: {
      },
      success: function (data, status, xhr) {//canale esiste e utente ha i permessi
        ret = true;
      },
      error: function (xhr, status, e){
        alert("Il canale selezionato non esiste o l'utente non ha permessi di scrittura");
        ret = false;
      }
    });
    return ret;
}

function check_destinatari_utenti(a) {
    //nome utente da cercare = a
    if (a.startsWith('@')) {
      a = a.substring(1)
    } else if (a == get_cookie_by_name("username")) {
      alert("Non è possibile inserire il proprio username tra i destinatari");
      return;
    }
    var ret;
    $.ajax({
      type: 'GET',
      dataType: "json",
      url: `${window.location.origin}/user/${a}`,
      headers: {
      },
      success: function (data, status, xhr) {//canale esiste e utente ha i permessi
        ret = true;
      },
      error: function (xhr, status, e){
        alert("L'utente selezionato non esiste");
        ret = false;
      }
    });
    return ret;
}

function rimuovi_destinatario(chip_rem) {
    console.log(chip_rem);
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