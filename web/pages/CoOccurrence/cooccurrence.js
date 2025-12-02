const cooccurrencePage = () => {
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Co-occurrence Analysis - Music Analytics</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
      :root{ --bg:#0b0d10; --panel:#12161c; --muted:#9fb0c8; --line:#2a3340; --text:#e7eef7; --accent:#5aa9ff; }
      *{box-sizing:border-box}
      body{margin:0; font-family:system-ui,arial,segoe ui; background:var(--bg); color:var(--text)}
      a,button{font:inherit}
      .btn{ padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:#0f1217; color:var(--text); cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:8px}
      .card{background:var(--panel); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3)}
      .muted{color:var(--muted)}
      .topbar{ position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.2) blur(4px);
        display:flex; gap:12px; align-items:center; justify-content:space-between;
        padding:12px 18px; border-bottom:1px solid #0e1218; background:rgba(11,13,16,.6) }
      .brand{display:flex; align-items:center; gap:10px; font-weight:600}
      .brand .logo{width:28px; height:28px; border-radius:50%; background:#5aa9ff; display:flex; align-items:center; justify-content:center; font-size:16px}
      .top-actions{display:flex; gap:10px; align-items:center}
      .page{ min-height:calc(100vh - 60px); padding:32px; display:flex; justify-content:center }
      .panel{ padding:24px; width:100%; max-width:1200px }
      
      .table{ width:100%; border-collapse:collapse; margin-top:16px }
      .table thead th{ text-align:left; font-weight:600; padding:12px; border-bottom:2px solid var(--line) }
      .table tbody td{ padding:12px; border-bottom:1px solid #0e1218 }
    </style>
  </head>
  <body>
    <div class="topbar">
      <div class="brand"><span class="logo">🎵</span>Co-occurrence Analysis</div>
      <div class="top-actions">
        <button id="btnHome" class="btn">🏠 Home</button>
      </div>
    </div>

    <div class="page">
      <main class="panel">
        <h1 style="margin:0 0 8px 0">🔗 Artist Co-occurrence & Position Analysis</h1>
        <p class="muted" style="margin-bottom:32px">Analyzing how artists appear together in user playlists</p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(450px,1fr)); gap:20px; margin-bottom:24px">
          <div class="card" style="padding:24px">
            <h3 style="margin:0 0 16px 0">📊 Top 10 Artist Pairs</h3>
            <canvas id="artistPairsChart" style="max-height:350px"></canvas>
          </div>
          <div class="card" style="padding:24px">
            <h3 style="margin:0 0 16px 0">📈 Average Position vs Mentions</h3>
            <p class="muted" style="font-size:0.85rem; margin-bottom:12px">Scatter plot: Lower position = higher rank</p>
            <canvas id="positionScatterChart" style="max-height:350px"></canvas>
          </div>
        </div>

        <div class="card" style="padding:24px; margin-bottom:24px">
          <h3 style="margin:0 0 16px 0">👥 11. Top 50 Artist Pairs</h3>
          <p class="muted" style="margin-bottom:16px">Most frequently co-occurring artist combinations</p>
          <table class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Artist 1</th>
                <th>Artist 2</th>
                <th style="text-align:right">Co-occurrences</th>
              </tr>
            </thead>
            <tbody id="pairsBody">
              <tr><td colspan="5" style="text-align:center; padding:20px; color:var(--muted)">Loading data...</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card" style="padding:24px; margin-bottom:24px">
          <h3 style="margin:0 0 16px 0">🎯 12. Top Artist Triplets</h3>
          <p class="muted" style="margin-bottom:16px">Most common 3-artist combinations</p>
          <table class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Artist 1</th>
                <th>Artist 2</th>
                <th>Artist 3</th>
                <th style="text-align:right">Occurrences</th>
              </tr>
            </thead>
            <tbody id="tripletsBody">
              <tr><td colspan="5" style="text-align:center; padding:20px; color:var(--muted)">Loading data...</td></tr>
            </tbody>
          </table>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px,1fr)); gap:20px; margin-bottom:24px">
          <div class="card" style="padding:24px">
            <h3 style="margin:0 0 16px 0">📊 13, 15 & 16. Position Metrics</h3>
            <div style="display:grid; gap:12px" id="positionMetrics">
              <div style="padding:8px; color:var(--muted)">Loading...</div>
            </div>
          </div>

          <div class="card" style="padding:24px">
            <h3 style="margin:0 0 16px 0">🎼 Cross-List Popularity</h3>
            <canvas id="crossPopularityChart" style="max-height:250px"></canvas>
          </div>
        </div>

        <div class="card" style="padding:24px">
          <h3 style="margin:0 0 16px 0">📈 14. Average Position by Artists in the Most Lists (Top 50)</h3>
          <p class="muted" style="margin-bottom:16px">Lower is better - indicates higher average ranking</p>
          <table class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Artist</th>
                <th style="text-align:right">In User Lists</th>
                <th style="text-align:right">Percentage of Users</th>
                <th style="text-align:right">Average Position</th>
              </tr>
            </thead>
            <tbody id="avgPositionBody">
              <tr><td colspan="5" style="text-align:center; padding:20px; color:var(--muted)">Loading data...</td></tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

  <script>
  (function(){
    var API = "http://localhost:3000";
    const TOTAL_USERS = 500000;
    
    let pairsChart = null;
    let scatterChart = null;
    let crossPopChart = null;

    function $(id){ return document.getElementById(id); }
    
    async function apiGet(path){
      try {
        const response = await fetch(API + path);
        return response.ok ? await response.json() : null;
      } catch (error) {
        console.error('API Error:', error);
        return null;
      }
    }

    async function loadArtistPairs() {
      const tbody = $('pairsBody');
      const data = await apiGet("/api/analytics/artist-pairs");
      
      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#ff6b6b">No data available</td></tr>';
        return;
      }
      
      tbody.innerHTML = '';
      data.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--line)';
        tr.innerHTML = \`
          <td>\${index + 1}</td>
          <td>\${item.artist1}</td>
          <td>\${item.artist2}</td>
          <td style="text-align:right">\${item.cooccurrence_count.toLocaleString()}</td>
        \`;
        tbody.appendChild(tr);
      });

      // Create chart for top 10
      const top10 = data.slice(0, 10);
      const ctx = $('artistPairsChart').getContext('2d');
      if (pairsChart) pairsChart.destroy();
      
      pairsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: top10.map(item => item.artist1 + ' + ' + item.artist2),
          datasets: [{
            label: 'Co-occurrences',
            data: top10.map(item => item.cooccurrence_count),
            backgroundColor: 'rgba(90, 169, 255, 0.8)',
            borderColor: 'rgba(90, 169, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { 
              beginAtZero: true,
              ticks: { color: '#9fb0c8' },
              grid: { color: '#2a3340' }
            },
            y: { 
              ticks: { 
                color: '#9fb0c8',
                font: { size: 10 }
              },
              grid: { color: '#2a3340' }
            }
          }
        }
      });
    }

    async function loadArtistTriplets() {
      const tbody = $('tripletsBody');
      const data = await apiGet("/api/analytics/artist-triplets");
      
      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#ff6b6b">No data available</td></tr>';
        return;
      }
      
      tbody.innerHTML = '';
      data.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--line)';
        tr.innerHTML = \`
          <td>\${index + 1}</td>
          <td>\${item.artist1}</td>
          <td>\${item.artist2}</td>
          <td>\${item.artist3}</td>
          <td style="text-align:right">\${item.cooccurrence_count.toLocaleString()}</td>
        \`;
        tbody.appendChild(tr);
      });
    }

    async function loadPositionMetrics() {
      const container = $('positionMetrics');
      
      const stability = await apiGet("/api/analytics/position-stability");
      const overlap = await apiGet("/api/analytics/artist-track-overlap");
      const top1InTop5 = await apiGet("/api/analytics/top1-in-top5");
      
      let html = '';
      
      if (stability) {
        const count = stability.stable_users_count || 0;
        html += \`<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--line)">
          <span class="muted">Users with same #1 & #2:</span>
          <strong>\${count.toLocaleString()}</strong>
        </div>\`;
      }
      
      if (overlap) {
        const count = overlap.overlap_count || 0;
        const pct = overlap.overlap_percentage || 0;
        html += \`<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--line)">
          <span class="muted">Song #1 = Artist #1:</span>
          <strong>\${count.toLocaleString()} (\${pct}%)</strong>
        </div>\`;
      }
      
      if (top1InTop5 && top1InTop5.percentage !== undefined) {
        const count = top1InTop5.matching_users || 0;
        const pct = parseFloat(top1InTop5.percentage || 0).toFixed(1);
        html += \`<div style="display:flex; justify-content:space-between; padding:8px">
          <span class="muted">#1 in global top 5:</span>
          <strong>\${count.toLocaleString()} (\${pct}%)</strong>
        </div>\`;
      }
      
      if (html) {
        container.innerHTML = html;
      }
    }

    async function loadCrossPopularity() {
      const data = await apiGet("/api/analytics/cross-popularity");
      
      if (!data || data.length === 0) return;
      
      const top10 = data.slice(0, 10);
      const ctx = $('crossPopularityChart').getContext('2d');
      if (crossPopChart) crossPopChart.destroy();
      
      crossPopChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: top10.map(item => item.artist_name),
          datasets: [
            {
              label: 'Track List Count',
              data: top10.map(item => item.track_list_count),
              backgroundColor: 'rgba(90, 169, 255, 0.8)',
              borderColor: 'rgba(90, 169, 255, 1)',
              borderWidth: 1
            },
            {
              label: 'Artist List Count',
              data: top10.map(item => item.artist_list_count),
              backgroundColor: 'rgba(159, 176, 200, 0.8)',
              borderColor: 'rgba(159, 176, 200, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { 
              display: true,
              labels: { color: '#9fb0c8', font: { size: 10 } }
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              ticks: { color: '#9fb0c8' },
              grid: { color: '#2a3340' }
            },
            x: { 
              ticks: { 
                color: '#9fb0c8',
                maxRotation: 45,
                minRotation: 45,
                font: { size: 9 }
              },
              grid: { color: '#2a3340' }
            }
          }
        }
      });
    }

    async function loadAvgPosition() {
      const tbody = $('avgPositionBody');
      
      // Obtener datos del endpoint nuevo
      const data = await apiGet("/api/analytics/top-50-artists-with-avg-rank");
      
      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#ff6b6b">No data available</td></tr>';
        return;
      }
      
      tbody.innerHTML = '';
      
      data.forEach(function(item, index) {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--line)';
        
        const avgRank = parseFloat(item.avg_rank);
        const userCount = item.user_count || 0;
        const pctUsers = (item.percentage_users != null)
          ? parseFloat(item.percentage_users)
          : null;
        
        tr.innerHTML =
          '<td>' + (index + 1) + '</td>' +
          '<td>' + item.artist_name + '</td>' +
          '<td style="text-align:right">' + userCount.toLocaleString() + '</td>' +
          '<td style="text-align:right">' +
            (pctUsers !== null ? pctUsers.toFixed(2) + '%' : '-') +
          '</td>' +
          '<td style="text-align:right; color:#5aa9ff">' +
            (isNaN(avgRank) ? '-' : avgRank.toFixed(1)) +
          '</td>';
        
        tbody.appendChild(tr);
      });

      // === Scatter plot: x = avg_rank, y = percentage_users ===
      const ctx = $('positionScatterChart').getContext('2d');
      if (scatterChart) {
        scatterChart.destroy();
      }

      const scatterData = data.map(function(item) {
        return {
          x: parseFloat(item.avg_rank),
          y: parseFloat(item.percentage_users),
          label: item.artist_name
        };
      }).filter(function(point) {
        return !isNaN(point.x) && !isNaN(point.y);
      });

      scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Artists',
            data: scatterData,
            backgroundColor: 'rgba(90, 169, 255, 0.6)',
            borderColor: 'rgba(90, 169, 255, 1)',
            borderWidth: 1,
            pointRadius: 6,
            pointHoverRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const point = context.raw;
                  return point.label +
                        ': Avg Rank ' + point.x.toFixed(1) +
                        ', ' + point.y.toFixed(2) + '% of users';
                }
              }
            }
          },
          scales: {
            x: { 
              title: {
                display: true,
                text: 'Average Position (lower = better)',
                color: '#9fb0c8'
              },
              ticks: { color: '#9fb0c8' },
              grid: { color: '#2a3340' }
            },
            y: { 
              title: {
                display: true,
                text: 'Percentage of Users',
                color: '#9fb0c8'
              },
              beginAtZero: true,
              ticks: { color: '#9fb0c8' },
              grid: { color: '#2a3340' }
            }
          }
        }
      });
    }

    document.getElementById("btnHome").addEventListener("click", function(){
      window.location.href = "/home";
    });

    // Load all data
    Promise.all([
      loadArtistPairs(),
      loadArtistTriplets(),
      loadPositionMetrics(),
      loadCrossPopularity(),
      loadAvgPosition()
    ]).then(() => {
      console.log('All co-occurrence data loaded');
    }).catch(err => {
      console.error('Error loading data:', err);
    });
  })();
  </script>
  </body>
  </html>
  `;
};

export default cooccurrencePage;
