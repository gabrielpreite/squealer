var utenti = []
var squeals = []
var canali = []

// UTENTI

function cat_utenti(){
    $.ajax({
        type: 'GET',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/db/user`,
        headers: { },
        success: function (data, status, xhr) {
          utenti = data;
        }
    });
    
    document.getElementById("user_table").innerHTML = ""
    let tableBody = document.createElement("tbody");
    tableBody.insertAdjacentHTML("afterbegin", "<tr><th>Username</th><th>Redazione</th><th>Verificato</th><th>Professional</th><th>Popolarita</th></tr>")
    utenti.forEach((user) => {
        var row = document.createElement("tr");

        let cell = document.createElement("td");
        let cellText = document.createTextNode(user.username);
        cell.appendChild(cellText);
        row.appendChild(cell);

        let cell_red = document.createElement("td");
        let cellText_red = document.createTextNode(user.redazione_flag ? "Y" : "N");
        cell_red.appendChild(cellText_red)
        row.appendChild(cell_red);

        let cell_ver = document.createElement("td");
        let cellText_ver = document.createTextNode(user.verificato_flag ? "Y" : "N");
        cell_ver.appendChild(cellText_ver)
        row.appendChild(cell_ver);

        let cell_pro = document.createElement("td");
        let cellText_pro = document.createTextNode(user.professional_flag ? "Y" : "N");
        cell_pro.appendChild(cellText_pro)
        row.appendChild(cell_pro);

        let cell_pop = document.createElement("td");
        let cellText_pop = document.createTextNode(user.popolarita.valori[user.popolarita.valori.length-1]);
        cell_pop.appendChild(cellText_pop)
        row.appendChild(cell_pop);

        row.onclick = function() { seleziona_utente(user.username); };
        tableBody.appendChild(row)
    })
    document.getElementById("user_table").appendChild(tableBody)
    document.getElementById("mid_user").removeAttribute("hidden")
    document.getElementById("mid_squeal").setAttribute("hidden", "true")
    document.getElementById("mid_canali").setAttribute("hidden", "true")

    document.getElementById("right_user").setAttribute("hidden", "")
    document.getElementById("right_squeal").setAttribute("hidden", "")
    document.getElementById("right_canali").setAttribute("hidden", "")
}

function compare_utenti(a, b){
    if(a.popolarita.valori[a.popolarita.valori.length-1] < b.popolarita.valori[b.popolarita.valori.length-1]){
        return -1
    } else if(a.popolarita.valori[a.popolarita.valori.length-1] > b.popolarita.valori[b.popolarita.valori.length-1]){
        return 1
    } else {
        return 0
    }
}

function sort_utenti(){
    let tipo = document.getElementById("user_filtro_tipo").value
    let query
    let new_utenti = []

    if(tipo === "nome"){ //solo quelli che matchano sul nome
        query = document.getElementById("user_query_nome").value
        utenti.forEach((el) => {
            if(el.username === query){
                new_utenti.push(el)
            }
        })
    } else if(tipo === "tipo") { //solo quelli che hanno flag redazione|verificato|professional(_flag)
        query = document.getElementById("user_query_tipo").value
        utenti.forEach((el) => {
            if(el[query+"_flag"] === true){
                new_utenti.push(el)
            }
        })
    } else if(tipo === "popolarita"){ //ordine crescente|decrescente
        query = document.getElementById("user_query_popolarita").value
        new_utenti = utenti
        new_utenti.sort(compare_utenti)
        if(query === "decrescente")
            new_utenti.reverse()
    }

    document.getElementById("user_table").innerHTML = ""
    let tableBody = document.createElement("tbody");
    tableBody.insertAdjacentHTML("afterbegin", "<tr><th>Username</th><th>Redazione</th><th>Verificato</th><th>Professional</th><th>Popolarita</th></tr>")
    new_utenti.forEach((user) => {
        var row = document.createElement("tr");

        let cell = document.createElement("td");
        let cellText = document.createTextNode(user.username);
        cell.appendChild(cellText);
        row.appendChild(cell);

        let cell_red = document.createElement("td");
        let cellText_red = document.createTextNode(user.redazione_flag ? "Y" : "N");
        cell_red.appendChild(cellText_red)
        row.appendChild(cell_red);

        let cell_ver = document.createElement("td");
        let cellText_ver = document.createTextNode(user.verificato_flag ? "Y" : "N");
        cell_ver.appendChild(cellText_ver)
        row.appendChild(cell_ver);

        let cell_pro = document.createElement("td");
        let cellText_pro = document.createTextNode(user.professional_flag ? "Y" : "N");
        cell_pro.appendChild(cellText_pro)
        row.appendChild(cell_pro);
        
        let cell_pop = document.createElement("td");
        let cellText_pop = document.createTextNode(user.popolarita.valori[user.popolarita.valori.length-1]);
        cell_pop.appendChild(cellText_pop)
        row.appendChild(cell_pop);
        
        row.onclick = function() { seleziona_utente(user.username); };
        tableBody.appendChild(row)
    })
    document.getElementById("user_table").appendChild(tableBody)
}

function cambia_query_user(){
    document.getElementById("user_query_nome").setAttribute("hidden", "true")
    document.getElementById("user_query_nome").classList.add("hidden-text-input")
    document.getElementById("user_query_tipo").setAttribute("hidden", "true")
    document.getElementById("user_query_popolarita").setAttribute("hidden", "true")

    let scelta = document.getElementById("user_filtro_tipo").value
    document.getElementById("user_query_"+scelta).removeAttribute("hidden")
    if(scelta === "nome"){
        document.getElementById("user_query_nome").classList.remove("hidden-text-input")
    }
}

function seleziona_utente(username){
    let user
    $.ajax({
        type: 'GET',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/user/`+username,
        headers: { },
        success: function (data, status, xhr) {
            user = data.data;
            console.log(data)
            document.getElementById("right_user").removeAttribute("hidden")
            document.getElementById("right_squeal").setAttribute("hidden", "")
            document.getElementById("right_canali").setAttribute("hidden", "")
            //console.log(user.abilitato_flag)
            document.getElementById("selected_user_username").innerHTML = user.username
            document.getElementById("abilitato_user_switch").checked = user.abilitato_flag
            document.getElementById("quota_g").value = user.quota.g
            document.getElementById("quota_s").value = user.quota.s
            document.getElementById("quota_m").value = user.quota.m
        }
    });
}

function applica_utenti(){
    let username = document.getElementById("selected_user_username").innerHTML
    //console.log(username)
    let quota = {"g": document.getElementById("quota_g").value, "s": document.getElementById("quota_s").value, "m": document.getElementById("quota_m").value}
    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: "https://site212251.tw.cs.unibo.it/user/"+username+"/quota",
        headers: { },
        data: { mod: true, q_g: quota.g, q_s: quota.s, q_m: quota.m},
        success: function (data, status, xhr) {
            //console.log("quota aggiornata")
        }
    });

    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: "https://site212251.tw.cs.unibo.it/user/"+username+"/abilitato",
        headers: { },
        data: {set_to: document.getElementById("abilitato_user_switch").checked},
        success: function (data, status, xhr) {
            //console.log("utente (dis)abilitato")
        }
    });
}

// SQUEAL

function cat_squeal(){
    $.ajax({
        type: 'GET',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/db/squeal?replies=false`,
        headers: { },
        success: function (data, status, xhr) {
          squeals = data;
        }
    });
    
    document.getElementById("squeal_table").innerHTML = ""
    let tableBody = document.createElement("tbody");
    tableBody.insertAdjacentHTML("afterbegin", "<tr><th>Mittente</th><th>Destinatari</th><th>Data</th><th>Anteprima</th></tr>")
    squeals.forEach((squeal) => {
        var row = document.createElement("tr");

        let cell_mit = document.createElement("td");
        let cellText_mit = document.createTextNode(squeal.utente);
        cell_mit.appendChild(cellText_mit);
        row.appendChild(cell_mit);

        let cell_des = document.createElement("td");
        let cellText_des = document.createTextNode(squeal.destinatari.toString());
        cell_des.appendChild(cellText_des)
        row.appendChild(cell_des);

        let cell_dat = document.createElement("td");
        let d = new Date(squeal.timestamp)
        let cellText_dat = document.createTextNode(d.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }));
        cell_dat.appendChild(cellText_dat)
        row.appendChild(cell_dat);

        let cell_pre = document.createElement("td");
        let cellText_pre = document.createTextNode(squeal.corpo.slice(0, 25)+"...");
        cell_pre.appendChild(cellText_pre)
        row.appendChild(cell_pre);

        row.onclick = function() { seleziona_squeal(squeal.post_id); };
        tableBody.appendChild(row)
    })
    document.getElementById("squeal_table").appendChild(tableBody)
    document.getElementById("mid_user").setAttribute("hidden", "true")
    document.getElementById("mid_squeal").removeAttribute("hidden")
    document.getElementById("mid_canali").setAttribute("hidden", "true")

    document.getElementById("right_user").setAttribute("hidden", "")
    document.getElementById("right_squeal").setAttribute("hidden", "")
    document.getElementById("right_canali").setAttribute("hidden", "")
}

function cambia_query_squeal(){
    document.getElementById("squeal_query_mittente").classList.add("hidden-text-input")
    document.getElementById("squeal_query_data_inizio").classList.add("hidden-text-input")
    document.getElementById("squeal_query_data_fine").classList.add("hidden-text-input")
    document.getElementById("squeal_query_destinatario").classList.add("hidden-text-input")

    let scelta = document.getElementById("squeal_filtro_tipo").value
    if(scelta === "mittente" || scelta === "destinatario"){
        document.getElementById("squeal_query_"+scelta).classList.remove("hidden-text-input")
    } else {
        document.getElementById("squeal_query_data_inizio").classList.remove("hidden-text-input")
        document.getElementById("squeal_query_data_fine").classList.remove("hidden-text-input")
    }
}

function seleziona_squeal(post_id){
    let squeal
    $.ajax({
        type: 'GET',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/squeal/`+post_id,
        headers: { },
        success: function (data, status, xhr) {
            squeal = data.data;
            //console.log(squeal)
            document.getElementById("right_user").setAttribute("hidden", "")
            document.getElementById("right_squeal").removeAttribute("hidden")
            document.getElementById("right_canali").setAttribute("hidden", "")
            
            document.getElementById("selected_squeal_post_id").innerHTML = squeal.post_id
            document.getElementById("mittente_squeal").innerHTML = squeal.utente
            document.getElementById("destinatari_squeal").value = squeal.destinatari.toString()
            let d = new Date(squeal.timestamp)
            document.getElementById("data_squeal").innerHTML = d.toLocaleString('it-IT', { timeZone: 'Europe/Rome' })
            document.getElementById("contenuto_squeal").innerHTML = squeal.corpo

            document.getElementById("#_con").value = squeal.reazioni.positive.concordo.length
            //document.getElementById("list_con").value = squeal.reazioni.positive.concordo.toString()

            document.getElementById("#_mip").value = squeal.reazioni.positive.mi_piace.length
            //document.getElementById("list_mip").value = squeal.reazioni.positive.mi_piace.toString()

            document.getElementById("#_ado").value = squeal.reazioni.positive.adoro.length
            //document.getElementById("list_ado").value = squeal.reazioni.positive.adoro.toString()

            document.getElementById("#_son").value = squeal.reazioni.negative.sono_contrario.length
            //document.getElementById("list_son").value = squeal.reazioni.negative.sono_contrario.toString()

            document.getElementById("#_mid").value = squeal.reazioni.negative.mi_disgusta.length
            //document.getElementById("list_mid").value = squeal.reazioni.negative.mi_disgusta.toString()

            document.getElementById("#_odi").value = squeal.reazioni.negative.odio.length
            //document.getElementById("list_odi").value = squeal.reazioni.negative.odio.toString()
        }
    });
}

function sort_squeal(){
    let tipo = document.getElementById("squeal_filtro_tipo").value
    let query
    let new_squeals = []

    if(tipo === "mittente"){ //solo quelli che matchano sul mittente
        query = document.getElementById("squeal_query_mittente").value
        squeals.forEach((el) => {
            if(el.utente === query){
                new_squeals.push(el)
            }
        })
    } else if(tipo === "data") { //solo quelli che rientrano tra le due date
        let inizio = new Date(document.getElementById("squeal_query_data_inizio").value).getTime()
        let fine_date = new Date(document.getElementById("squeal_query_data_fine").value)
        fine_date.setTime(fine_date.getTime() + (22 * 60 * 60 * 1000)) //+22 ore (fine giornata)
        let fine = fine_date.getTime() 
        squeals.forEach((el) => {
            if(el.timestamp <= fine && el.timestamp >= inizio){
                new_squeals.push(el)
            }
        })
    } else if(tipo === "destinatario"){ //solo quelli che matchano sul destinatario
        query = document.getElementById("squeal_query_destinatario").value
        squeals.forEach((el) => {
            if(el.destinatari.includes(query)){
                new_squeals.push(el)
            }
        })
    }

    //console.log(new_squeals)

    document.getElementById("squeal_table").innerHTML = ""
    let tableBody = document.createElement("tbody");
    tableBody.insertAdjacentHTML("afterbegin", "<tr><th>Mittente</th><th>Destinatari</th><th>Data</th><th>Anteprima</th></tr>")
    new_squeals.forEach((squeal) => {
        var row = document.createElement("tr");

        let cell_mit = document.createElement("td");
        let cellText_mit = document.createTextNode(squeal.utente);
        cell_mit.appendChild(cellText_mit);
        row.appendChild(cell_mit);

        let cell_des = document.createElement("td");
        let cellText_des = document.createTextNode(squeal.destinatari.toString());
        cell_des.appendChild(cellText_des)
        row.appendChild(cell_des);

        let cell_dat = document.createElement("td");
        let d = new Date(squeal.timestamp)
        let cellText_dat = document.createTextNode(d.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }));
        cell_dat.appendChild(cellText_dat)
        row.appendChild(cell_dat);

        let cell_pre = document.createElement("td");
        let cellText_pre = document.createTextNode(squeal.corpo.slice(0, 25)+"...");
        cell_pre.appendChild(cellText_pre)
        row.appendChild(cell_pre);

        row.onclick = function() { seleziona_squeal(squeal.post_id); };
        tableBody.appendChild(row)
    })
    document.getElementById("squeal_table").appendChild(tableBody)
}

function applica_squeal(){
    let post_id = document.getElementById("selected_squeal_post_id").innerHTML
    let dest = document.getElementById("destinatari_squeal").value
    
    let reac = {}
    reac.positive = {}
    reac.negative = {}

    let squeal
    $.ajax({
        type: 'GET',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/squeal/`+post_id,
        headers: { },
        success: function (data, status, xhr) {
            squeal = data.data;
        }
    });

    let n_con = parseInt(document.getElementById("#_con").value)
    let n_mip = parseInt(document.getElementById("#_mip").value)
    let n_ado = parseInt(document.getElementById("#_ado").value)
    let n_son = parseInt(document.getElementById("#_son").value)
    let n_mid = parseInt(document.getElementById("#_mid").value)
    let n_odi = parseInt(document.getElementById("#_odi").value)

    // concordo
    if(n_con === 0){
        reac.positive.concordo = Array(0)
    } else if(n_con > squeal.reazioni.positive.concordo.length){ // aumento
        reac.positive.concordo = squeal.reazioni.positive.concordo
        reac.positive.concordo = reac.positive.concordo.concat(Array(n_con-squeal.reazioni.positive.concordo.length).fill("a"))
    } else if(n_con <= squeal.reazioni.positive.concordo.length){ // diminuisco
        reac.positive.concordo = squeal.reazioni.positive.concordo.slice(0, n_con)
    }
    // mi_piace
    if(n_mip === 0){
        reac.positive.mi_piace = Array(0)
    } else if(n_mip > squeal.reazioni.positive.mi_piace.length){ // aumento
        reac.positive.mi_piace = squeal.reazioni.positive.mi_piace
        reac.positive.mi_piace = reac.positive.mi_piace.concat(Array(n_mip-squeal.reazioni.positive.mi_piace.length).fill("a"))
    } else if(n_mip <= squeal.reazioni.positive.concordo.length){ // diminuisco
        reac.positive.mi_piace = squeal.reazioni.positive.mi_piace.slice(0, n_mip)
    }
    // adoro
    if(n_ado === 0){
        reac.positive.adoro = Array(0)
    } else if(n_ado > squeal.reazioni.positive.adoro.length){ // aumento
        reac.positive.adoro = squeal.reazioni.positive.adoro
        reac.positive.adoro = reac.positive.adoro.concat(Array(n_ado-squeal.reazioni.positive.adoro.length).fill("a"))
    } else if(n_ado <= squeal.reazioni.positive.adoro.length){ // diminuisco
        reac.positive.adoro = squeal.reazioni.positive.adoro.slice(0, n_ado)
    }

    // sono_contrario
    if(n_son === 0){
        reac.negative.sono_contrario = Array(0)
    } else if(n_son > squeal.reazioni.negative.sono_contrario.length){ // aumento
        reac.negative.sono_contrario = squeal.reazioni.negative.sono_contrario
        reac.negative.sono_contrario = reac.negative.sono_contrario.concat(Array(n_son-squeal.reazioni.negative.sono_contrario.length).fill("a"))
    } else if(n_son <= squeal.reazioni.negative.sono_contrario.length){ // diminuisco
        reac.negative.sono_contrario = squeal.reazioni.negative.sono_contrario.slice(0, n_son)
    }
    // mi_disgusta
    if(n_mid === 0){
        reac.negative.mi_disgusta = Array(0)
    } else if(n_mid > squeal.reazioni.negative.mi_disgusta.length){ // aumento
        reac.negative.mi_disgusta = squeal.reazioni.negative.mi_disgusta
        reac.negative.mi_disgusta = reac.negative.mi_disgusta.concat(Array(n_mid-squeal.reazioni.negative.mi_disgusta.length).fill("a"))
    } else if(n_mid <= squeal.reazioni.negative.mi_disgusta.length){ // diminuisco
        reac.negative.mi_disgusta = squeal.reazioni.negative.mi_disgusta.slice(0, n_mid)
    }
    // odio
    if(n_odi === 0){
        reac.negative.odio = Array(0)
    }else if(n_odi > squeal.reazioni.negative.odio.length){ // aumento
        reac.negative.odio = squeal.reazioni.negative.odio
        reac.negative.odio = reac.negative.odio.concat(Array(n_odi-squeal.reazioni.negative.odio.length).fill("a"))
    } else if(n_odi <= squeal.reazioni.negative.odio.length){ // diminuisco
        reac.negative.odio = squeal.reazioni.negative.odio.slice(0, n_odi)
    }
    
    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: "https://site212251.tw.cs.unibo.it/squeal/"+post_id,
        headers: { },
        data: { reac: JSON.stringify(reac), destinatari: dest},
        success: function (data, status, xhr) {
        }
    });
}

// CANALI

function cat_canali(){
    $.ajax({
        type: 'GET',
        dataType: "json",
        async: false,
        url: `https://site212251.tw.cs.unibo.it/db/channel`,
        headers: { },
        success: function (data, status, xhr) {
          //console.log(data)
          canali = []
          data.forEach((el) => {
            if(el.ufficiale === true || el.ufficiale === "true")
                canali.push(el)
          })
          //console.log(canali)
        }
    });
    
    document.getElementById("canali_table").innerHTML = ""
    let tableBody = document.createElement("tbody");
    tableBody.insertAdjacentHTML("afterbegin", "<tr><th>Nome</th><th>Descrizione</th></tr>")
    canali.forEach((canale) => {
        var row = document.createElement("tr");

        let cell_nom = document.createElement("td");
        let cellText_nom = document.createTextNode(canale.nome);
        cell_nom.appendChild(cellText_nom);
        row.appendChild(cell_nom);

        let cell_des = document.createElement("td");
        let cellText_des = document.createTextNode(canale.descrizione);
        cell_des.appendChild(cellText_des);
        row.appendChild(cell_des);

        row.onclick = function() { seleziona_canale(canale.nome); };
        tableBody.appendChild(row)
    })
    document.getElementById("canali_table").appendChild(tableBody)
    document.getElementById("mid_user").setAttribute("hidden", "true")
    document.getElementById("mid_squeal").setAttribute("hidden", "true")
    document.getElementById("mid_canali").removeAttribute("hidden")

    document.getElementById("right_user").setAttribute("hidden", "")
    document.getElementById("right_squeal").setAttribute("hidden", "")
    document.getElementById("right_canali").setAttribute("hidden", "")
}

function seleziona_canale(nome){
    document.getElementById("right_user").setAttribute("hidden", "")
    document.getElementById("right_squeal").setAttribute("hidden", "")
    document.getElementById("right_canali").removeAttribute("hidden")

    if(nome !== "new"){
        let canale
        $.ajax({
            type: 'GET',
            dataType: "json",
            async: false,
            url: `https://site212251.tw.cs.unibo.it/channel/`+nome,
            headers: { },
            success: function (data, status, xhr) {
                canale = data.data;
                
                document.getElementById("selected_canale_nome").value = canale.nome
                document.getElementById("selected_canale_nome").setAttribute("readonly", true)
                document.getElementById("canale_descrizione").value = canale.descrizione
                document.getElementById("elimina_canale").removeAttribute("hidden")
                document.getElementById("elimina_canale").onclick = function() { cancella_canale(canale.nome); };
            }
        });
    } else {
        document.getElementById("selected_canale_nome").value = "Inserisci nome qui"
        document.getElementById("selected_canale_nome").removeAttribute("readonly")
        document.getElementById("canale_descrizione").value = "Inserisci descrizione qui"
        document.getElementById("elimina_canale").setAttribute("hidden", true)
    }
}

function applica_canale(){
    let nome = document.getElementById("selected_canale_nome").value
    let descrizione = document.getElementById("canale_descrizione").value
    
    $.ajax({
        type: 'POST',
        dataType: "json",
        async: false,
        url: "https://site212251.tw.cs.unibo.it/channel/"+nome,
        headers: { },
        data: { descrizione: descrizione},
        success: function (data, status, xhr) {
            console.log("canale aggiornato")
        },
        error: function (xhr, status, error) {
            if (xhr.status === 404) {
                console.log("canale inesistente, creo nuovo canale");
                $.ajax({
                    type: 'POST',
                    dataType: "json",
                    url: "https://site212251.tw.cs.unibo.it/channel",
                    data: { nome: nome, descrizione: descrizione, userid: "redazione", ufficiale: true },
                    success: function (data, status, xhr) {
                        console.log("creato nuovo canale");
                    }
                });
            }
        }
    });
}

function cancella_canale(nome){
    $.ajax({
        type: 'DELETE',
        dataType: "json",
        async: false,
        url: "https://site212251.tw.cs.unibo.it/channel/"+nome,
        headers: { },
        data: { descrizione: descrizione},
        success: function (data, status, xhr) {
            console.log("canale "+nome+" cancellato")
            //cat_canali()
        }
    });
}