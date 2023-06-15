<script>
  function riempiFeed(){

  }

  function redirectToEditor() {
    window.location.href = "/editor";
  }

  function redirectToSettings() {
    window.location.href = "/settings";
  }

  function redirectToHome() {
    window.location.href = "/";
  }

  google.charts.load('current', { 'packages': ['corechart'] });
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    var data = google.visualization.arrayToDataTable([
      ['Orario', 'Utenti'],
      [00, 120],
      [02, 80],
      [05, 150],
      [08, 250],
      [12, 320],
      [16, 280],
      [19, 200],
      [22, 180],
    ]);

    var options = {
      height: 200,
      width: 305.4,
      legend: { position: 'none' },
      vAxis: { minValue: 0 },
      hAxis: {
        gridlines: { color: 'transparent' },
        ticks: [
          {v: 00, f: '0:00'},
          {v: 01, f: ''},
          {v: 02, f: ''},
          {v: 03, f: ''},
          {v: 04, f: ''},
          {v: 05, f: ''},
          {v: 06, f: '6:00'},
          {v: 07, f: ''},
          {v: 08, f: ''},
          {v: 09, f: ''},
          {v: 10, f: ''},
          {v: 11, f: ''},
          {v: 12, f: '12:00'},
          {v: 13, f: ''},
          {v: 14, f: ''},
          {v: 15, f: ''},
          {v: 16, f: ''},
          {v: 17, f: ''},
          {v: 18, f: '18:00'},
          {v: 19, f: ''},
          {v: 20, f: ''},
          {v: 21, f: ''},
          {v: 22, f: ''},
          {v: 23, f: ''},
        ],
        slantedText: false,
      },
      series: {
        0: { type: 'line', color: '#4285F4' },
      },
      backgroundColor: 'transparent',
    };

    var chart = new google.visualization.LineChart(document.getElementById('grafico-attivita'));
    chart.draw(data, options);
  }

  // TRENDS
  const pastelColors = [
    '#FF8080', '#FFB380', '#FFD480', '#FFFF80', '#BFFF80',
    '#80FF80', '#80FFBF', '#C0B3FF', '#CFAEFF'
  ];

  function getRandomPastelColor() {
    const randomIndex = Math.floor(Math.random() * pastelColors.length);
    return pastelColors[randomIndex];
  }

  // Crea le tessere del mosaico dinamicamente
  function createMosaicTiles() {
    const container = document.querySelector('.mosaic-container');
    const tileSize = 30; // Dimensione della tessera

    // Array dei trend
    var trends = ['#Trend1', '#prova', '#ciaociaociao', '#Trend4', '#squealer'];

    for (let i = 0; i < trends.length; i++) {
      const tile = document.createElement('a');
      tile.classList.add('mosaic-tile');
      tile.style.backgroundColor = getRandomPastelColor();
      tile.textContent = trends[i];
      tile.style.width = trends[i].length * 10 + 'px'; // Imposta la larghezza in base alla lunghezza della parola
      tile.style.height = tileSize + 'px';
      tile.href = '#'; // Imposta l'URL del link

      container.appendChild(tile);
    }
  }
  createMosaicTiles();
</script>
