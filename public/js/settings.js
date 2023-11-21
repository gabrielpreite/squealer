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

    fetch(`/user/${CURRENT_USER}/managed_by`, {
        method: "POST",
        body: formData,
    })
    .then((response) => {
        if (response.ok) {
        // The initial request was successful
        //window.location.replace("https://site212251.tw.cs.unibo.it/settings");
        } else {
        throw new Error("Network response was not ok.");
        }
    })
}