function cat_utenti(){
    let utenti = []
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

    let anchor = document.getElementById("content_mid")
    let table = document.createElement("table");
    let tableBody = document.createElement("tbody");
    utenti.forEach((user) => {
        var row = document.createElement("tr");
        let cell = document.createElement("td");
        let cellText = document.createTextNode(user.username);

        cell.appendChild(cellText);
        row.appendChild(cell);
        tableBody.appendChild(row)
    })

    table.appendChild(tableBody)
    anchor.appendChild(table)
}