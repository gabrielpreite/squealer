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

    // Ordina gli acquisti in base al timestamp
    acquisti.sort(function(a, b) {
        return a.timestamp - b.timestamp;
    });

    // Popola la lista degli acquisti
    acquisti.forEach(function(acquisto) {
        var listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="acquisto">
                <div class="timestamp">Data: ${timeConverter(acquisto.timestamp)}</div>
                <div class="quantita">Quantità: ${acquisto.quantita}</div>
            </div>
        `;
        acquistiList.appendChild(listItem);
    });
}
