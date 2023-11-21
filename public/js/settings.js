function switch_settings(param){
    let settings = ["profilo", "account", "acquisti", "smm", "follow", "popolarita"]

    settings.forEach((el) =>{ //nascondo tutte le sezioni
        $("#"+el).attr("hidden", "true")
    })

    //visualizzo solo quella richiesta
    $("#"+param).removeAttr("hidden")

    switch(param){
        case "profilo":
            console.log(param)
            break
        case "account":
            console.log(param)
            break
        case "acquisti":
            console.log(param)
            break
        case "smm":
            console.log(param)
            break
        case "follow":
            console.log(param)
            break
        case "popolarita":
            console.log(param)
            break
    }
}