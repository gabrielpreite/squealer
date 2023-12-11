var utenti = []
var squeals = []

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
        let d = new Date(squeal.timestamp * 1000)
        let cellText_dat = document.createTextNode(d.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }));
        cell_dat.appendChild(cellText_dat)
        row.appendChild(cell_dat);

        let cell_pre = document.createElement("td");
        let cellText_pre = document.createTextNode(user.professional_flag ? "Y" : "N");
        cell_pre.appendChild(cellText_pre)
        row.appendChild(cell_pre);

        row.onclick = function() { seleziona_squeal(user.username); };
        tableBody.appendChild(row)
    })
    document.getElementById("user_table").appendChild(tableBody)
    document.getElementById("mid_user").removeAttribute("hidden")
    document.getElementById("mid_squeal").setAttribute("hidden", "true")
    document.getElementById("mid_canali").setAttribute("hidden", "true")

}

function cambia_query_squeal(){
    document.getElementById("squeal_query_mittente").setAttribute("hidden", "true")
    document.getElementById("squeal_query_mittente").classList.add("hidden-text-input")
    document.getElementById("squeal_query_data_inizio").setAttribute("hidden", "true")
    document.getElementById("squeal_query_data_fine").setAttribute("hidden", "true")
    document.getElementById("squeal_query_destinatario").setAttribute("hidden", "true")
    document.getElementById("squeal_query_destinatario").classList.add("hidden-text-input")

    let scelta = document.getElementById("squeal_filtro_tipo").value
    if(scelta === "mittente" || scelta === "destinatario"){
        document.getElementById("squeal_query_"+scelta).classList.remove("hidden-text-input")
    } else {
        document.getElementById("squeal_query_data_inizio").removeAttribute("hidden")
        document.getElementById("squeal_query_data_fine").removeAttribute("hidden")
    }
}