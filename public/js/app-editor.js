function cambia_campo(opzione) {
    $("#contenuto_testo").attr("hidden", "true");
    $("#contenuto_immagine").attr("hidden", "true");
    $("#contenuto_posizione").attr("hidden", "true");
    $("#contenuto_ghigliottina").attr("hidden", "true");
    $(".icona-scelta").removeClass("attiva");

    if (opzione == "Testo") {
        //resetQuota()
        $("#contenuto_testo").attr("hidden", false);
        $(".icona-scelta.fas.fa-font").addClass("attiva");
        if ($(".icona-scelta.fas.fa-font").hasClass("attiva")) {
            aggiornaQuota("Testo");
        }
    } else if (opzione == "Immagine") {
        //resetQuota()
        $("#contenuto_immagine").attr("hidden", false);
        $(".icona-scelta.fas.fa-image").addClass("attiva");
        if ($(".icona-scelta.fas.fa-image").hasClass("attiva")&& inputImage.files && inputImage.files[0]) {
            aggiornaQuota("Immagine");
        }
    } else if (opzione == "Posizione") {
        //resetQuota()
        $("#contenuto_posizione").attr("hidden", false);
        $(".icona-scelta.fas.fa-map-marker-alt").addClass("attiva");
        if ($(".icona-scelta.fas.fa-map-marker-alt").hasClass("attiva")) {
            aggiornaQuota("Posizione");
        }
    } else if (opzione == "Ghigliottina") {
        //resetQuota()
        $("#contenuto_ghigliottina").attr("hidden", false);
        $(".icona-scelta.fas.fa-star").addClass("attiva");
        if ($(".icona-scelta.fas.fa-star").hasClass("attiva")) {
            aggiornaQuota("Ghigliottina");
        }
        toggleCorpoGhigliottina();
    }
}

//DESTINATARI
function mostraCampo(tipo) {
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
    chip_n = 0;
    while (chip_arr[0].chipsData.length != 0) {
        chip_arr[0].deleteChip(0);
    }
}

async function check_destinatari(a) {
    if (document.getElementById("icona-canali").classList.length == 2) {
        console.log("canali");
        console.log(a);
        //nome destinatario da cercare (per ora gestisco solo canali) = a
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
                console.log(true);
                return true;
            },
            error: function (xhr, status, e){
                chip_arr[0].deleteChip(chip_n);
                alert("Il canale selezionato non esiste o l'utente non ha permessi di scrittura");
                return false;
            }
        });
    } else {
        console.log("utenti");
        console.log(a);
        //nome utente da cercare = a
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
                console.log(true);
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
    //nome destinatario da cercare (per ora gestisco solo canali) = a
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
    //nome utente da cercare = a
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
    // Verifica se ci sono destinatari selezionati
    //let arr = window.location.href.split('?');
    if (document.getElementById("campo-bacheca").hidden) { //caso bacheca
        if (!(chip_arr[0].chipsData.length > 0)) { //caso risposta o no destinatari
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
            //console.log(parole)
            formData.append("parole", parole)

            formData.append("soluzione", document.getElementById("parolaDaIndovinare").value)
        }

        fetch("/squeal", {
            method: "POST",
            body: formData,
        })
        .then((response) => {
            if (response.ok) {
                // The initial request was successful
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
    var post_originale
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
    document.getElementById("squeal-contenuto").innerHTML = `<img src="https://site212251.tw.cs.unibo.it/uploads/${post.corpo}" alt="immagine dello squeal">`
    } else if(post.contenuto == "map"){
    document.getElementById("squeal-contenuto").innerHTML = `<img src="${post.corpo}" alt="mappa dello squeal">`;
    }

    //aggiungi commenti
    var lista_commenti;
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
            contenitore_commenti.insertAdjacentHTML('beforeend', '<div class="chip comment"><img src="https://via.placeholder.com/48x48" alt="Foto profilo del creatore del commento" class="comment-profile-image" id="c_img_utente' + c + '"> <div class="comment-content"> <div class="comment-username" id="c_username' + c + '">  </div> <p class="comment-text" id="c_text' + c + '">  </p> </div></div>');
            let c_img_utente = 'c_img_utente' + c;
            document.getElementById(c_img_utente).src = `https://site212251.tw.cs.unibo.it/uploads/${lista_commenti[c].img}`
            let id_tag = 'c_username' + c;
            document.getElementById(id_tag).innerHTML = lista_commenti[c].utente;
            let id_testo = 'c_text' + c;
            if (lista_commenti[c].contenuto == "testo") {
            document.getElementById(id_testo).innerHTML = lista_commenti[c].corpo;
            } else if(lista_commenti[c].contenuto == "img"){
            document.getElementById(id_testo).innerHTML = `<img src="https://site212251.tw.cs.unibo.it/uploads/${lista_commenti[c].corpo}" alt="immagine del commento">`
            } else if(lista_commenti[c].contenuto == "map"){
            document.getElementById(id_testo).innerHTML = `<img src="${lista_commenti[c].corpo}" alt="mappa del commento">`;
            }
        }
    } else {
        contenitore_commenti.innerHTML = "Nessuno ha ancora commentato";
    }
}

//GHIGLIOTTINA
function updateIntervalloVal() {
    var intervalloInput = document.getElementById('intervallo');
    var intervalloVal = document.getElementById('intervallo-val');
    var textarea = document.getElementById('Textarea');

    intervalloVal.textContent = intervalloInput.value + " min";
    if (intervalloInput.value == 1) {
      textarea.value = 'Ho avviato una nuova partita di #ghigliottina! Le parole saranno pubblicate ogni ' + intervalloInput.value + ' minuto.';
    } else {
      textarea.value = 'Ho avviato una nuova partita di #ghigliottina! Le parole saranno pubblicate ogni ' + intervalloInput.value + ' minuti.';
    }
}

function toggleCorpoGhigliottina() {
    var textarea = document.getElementById('Textarea-g');
    var intervalloInput = document.getElementById('intervallo');

    textarea.value = 'Ho avviato una nuova partita di #ghigliottina!\nLe parole saranno pubblicate ogni ' + intervalloInput.value + ' minuti.';
    textarea.readOnly = true;
}
