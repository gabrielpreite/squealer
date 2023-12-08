var utenti = []

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
    utenti.forEach((user) => {
        var row = document.createElement("tr");
        let cell = document.createElement("td");
        let cellText = document.createTextNode(user.username);

        cell.appendChild(cellText);
        row.appendChild(cell);
        tableBody.appendChild(row)
    })
    document.getElementById("user_table").appendChild(tableBody)
    document.getElementById("mid_user").removeAttribute("hidden")
    document.getElementById("mid_squeal").setAttribute("hidden", "true")
    document.getElementById("mid_canali").setAttribute("hidden", "true")

}

function compare_utenti(a, b){
    if(a.popolarita.valori[a.popolarita.valori.length] < b.popolarita.valori[b.popolarita.valori.length]){
        return -1
    } else if(a.popolarita.valori[a.popolarita.valori.length] > b.popolarita.valori[b.popolarita.valori.length]){
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
    new_utenti.forEach((user) => {
        var row = document.createElement("tr");
        let cell = document.createElement("td");
        let cellText = document.createTextNode(user.username);

        cell.appendChild(cellText);
        row.appendChild(cell);
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