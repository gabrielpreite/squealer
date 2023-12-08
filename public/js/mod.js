function cat_utenti(){
    var utenti = []
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

function sort_utenti(tipo, query){
    if(tipo === "nome"){ //solo quelli che matchano sul nome

    } else if(tipo === "tipo") { //solo quelli che hanno flag redazione|verificato|professional(_flag)

    } else if(tipo === "popolarita"){ //ordine crescente|decrescente

    }

}

function cambia_query_user(){
    document.getElementById("user_query_nome").setAttribute("hidden", "true")
    document.getElementById("user_query_tipo").setAttribute("hidden", "true")
    document.getElementById("user_query_popolarita").setAttribute("hidden", "true")

    let scelta = document.getElementById("user_filtro_tipo").value
    document.getElementById("user_query_"+scelta).removeAttribute("hidden")
}