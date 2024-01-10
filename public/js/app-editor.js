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

function resetQuota() {
    charCount_g.textContent = initialQuota_g;
    charCount_s.textContent = initialQuota_s;
    charCount_m.textContent = initialQuota_m;

    charCount_g.classList.remove('negative');
    charCount_s.classList.remove('negative');
    charCount_m.classList.remove('negative');

    button.classList.remove('button-disabled');
}

