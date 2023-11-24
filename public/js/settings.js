function switch_settings(param){
    let settings = ["profilo", "account", "acquisti", "smm", "follow", "popolarita"]

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

// STORICO ACQUISTI

document.addEventListener('DOMContentLoaded', function() {
    // Effettua la chiamata API per ottenere le informazioni sull'utente
    fetch(`/user/${CURRENT_USER}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.risultato === 'successo') {
                // L'utente è stato trovato, puoi accedere agli acquisti
                var acquisti = data.data.acquisti;
                popolaListaAcquisti(acquisti);
            } else {
                // L'utente non è stato trovato o si è verificato un altro errore
                console.error('Errore nel recupero delle informazioni utente:', data.errore);
            }
        })
        .catch(error => {
            console.error('Si è verificato un errore nella richiesta:', error);
        });
});

// Funzione per popolare dinamicamente la lista degli acquisti nella pagina HTML
function popolaListaAcquisti(acquisti) {
    var acquistiList = document.getElementById('acquisti-list');

    // Popola la lista degli acquisti
    acquisti.forEach(function(acquisto) {
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
