const createAnalytics = () => {
  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Popularity Analysis - Music Analytics</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
      <style>
        :root{ --bg:#0b0d10; --panel:#12161c; --muted:#9fb0c8; --line:#2a3340; --text:#e7eef7; --accent:#5aa9ff }
        *{ box-sizing:border-box }
        body{ margin:0; font-family:system-ui,arial,segoe ui; background:var(--bg); color:var(--text) }
        a,button,input,textarea{ font:inherit }
        .btn,.input,textarea{
          padding:10px 12px; border-radius:10px; border:1px solid var(--line);
          background:#0f1217; color:var(--text)
        }
        .btn{ cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:8px }
        .btn.primary{ background:#0f141c }
        .btn.ghost{ background:transparent }
        .btn.sm{ padding:8px 10px; font-size:.9rem }
        .card{ background:var(--panel); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3) }
        .muted{ color:var(--muted) }
        .topbar{
          position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.2) blur(4px);
          display:flex; gap:12px; align-items:center; justify-content:space-between;
          padding:12px 18px; border-bottom:1px solid #0e1218; background:rgba(11,13,16,.6)
        }
        .brand{display:flex; align-items:center; gap:10px; font-weight:600}
        .brand .logo{width:28px; height:28px; border-radius:50%; background:#000; display:inline-block;background-image: url(https://cdn-icons-png.flaticon.com/512/18495/18495588.png);background-size: contain;}        .top-actions{display:flex; gap:10px; align-items:center}

        .page{ max-width:1100px; margin:24px auto; padding:0 16px; display:grid; gap:18px; grid-template-columns:340px 1fr }
        @media (max-width: 900px){ .page{ grid-template-columns:1fr } }

        .sidebar{ padding:14px }
        .row{ display:flex; gap:10px; align-items:center; justify-content:space-between }
        .grid{ display:grid; gap:10px }
        .divider{ height:1px; background:#0e1218; margin:10px 0 }

        /* Layout de la página */
        .panel{ padding:18px }
        label{ font-size:.95rem; margin-bottom:4px; display:block; color:#c9d6e5 }
        .field{ display:grid; gap:6px }
        .two{ display:grid; grid-template-columns:1fr 1fr; gap:12px }
        textarea{ min-height:110px; resize:vertical }
        .thumb{
          width:72px; height:72px; border-radius:12px; background:#121820; border:1px solid var(--line);
          display:flex; align-items:center; justify-content:center; overflow:hidden
        }
        .pill{ font-size:.8rem; padding:2px 8px; border-radius:999px; border:1px solid var(--line); color:var(--muted) }

        /* Partes para escoger archivos y videos */
        .file-area, .video-area{
            height: 190px;
            overflow: auto;
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 10px;
            background: #0f1217;
        }
        .chip-list{ display:flex; flex-wrap:wrap; gap:8px }
            .chip-item{
            display:flex; align-items:center; gap:8px;
            padding:6px 10px; border:1px solid var(--line);
            border-radius:10px; background:#0f1217; max-width:100%;
        }
        .chip-item .name{
            display:inline-block;
            max-width: min(40vw, 280px);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .video-grid{
            display:grid;
            grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));
            gap:10px;
        }
        .video-wrap{ position:relative; border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#0f1217 }
        .video-wrap button{
            position:absolute; top:6px; right:6px;
            border:1px solid var(--line); background:rgba(0,0,0,.5);
            color:#fff; border-radius:8px; padding:2px 6px; cursor:pointer
        }
        /* Secciones del usuario */
        .owner { display:grid; gap:12px }
        .owner-header{
        display:flex; align-items:center; gap:12px;
        }
        .owner-avatar{
        width:72px; height:72px; border-radius:12px;
        object-fit:cover; background:#121820; border:1px solid var(--line);
        flex:0 0 72px;
        }
        .owner-text{ min-width:0; display:grid; gap:2px }
        .owner-name{
        font-weight:600; line-height:1.2;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .owner-username{
        color:var(--muted); font-size:.95rem;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .owner-label{ color:#c9d6e5; font-size:.9rem; opacity:.9 }
        .sidebar{ align-self: start; }
        .status.error{ color:#ff6b6b }
      </style>
    </head>
    <body>
      <header class="topbar">
        <div class="brand">
          <span class="logo" style="background-image:none;background:#5aa9ff;display:flex;align-items:center;justify-content:center;font-size:16px">🎵</span>
          <span>Popularity Analysis</span>
        </div>
        <div class="row">
          <button id="btnHome" class="btn icon" title="Home">🏠</button>
        </div>
      </header>

      <main class="page" style="grid-template-columns:1fr; max-width:1400px">
        <!-- Main Content -->
        <section class="grid" style="gap:24px">
          <div class="card panel">
            <h2 style="margin:0 0 16px 0">🎤 1. Top 20 Artists</h2>
            <p class="muted" style="margin-bottom:16px">Most popular artists by user mentions</p>
            <div id="topArtists">
              <table class="table" style="width:100%; border-collapse:collapse">
                <thead>
                  <tr style="border-bottom:1px solid var(--line)">
                    <th style="padding:12px; text-align:left">#</th>
                    <th style="padding:12px; text-align:left">Artist</th>
                    <th style="padding:12px; text-align:right">Mentions</th>
                    <th style="padding:12px; text-align:right">Percentage</th>
                  </tr>
                </thead>
                <tbody id="artistTableBody">
                  <tr><td colspan="4" style="padding:20px; text-align:center; color:var(--muted)">Loading data from Spark analysis...</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card panel">
            <h2 style="margin:0 0 16px 0">🎵 2. Top 20 Songs</h2>
            <p class="muted" style="margin-bottom:16px">Most listened tracks across all users</p>
            <div id="topSongs">
              <table class="table" style="width:100%; border-collapse:collapse">
                <thead>
                  <tr style="border-bottom:1px solid var(--line)">
                    <th style="padding:12px; text-align:left">#</th>
                    <th style="padding:12px; text-align:left">Song</th>
                    <th style="padding:12px; text-align:right">Plays</th>
                    <th style="padding:12px; text-align:right">%</th>
                  </tr>
                </thead>
                <tbody id="songTableBody">
                  <tr><td colspan="4" style="padding:20px; text-align:center; color:var(--muted)">Loading...</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card panel">
            <h2 style="margin:0 0 16px 0">💿 3. Top 20 Albums</h2>
            <p class="muted" style="margin-bottom:16px">Most popular albums in the dataset</p>
            <div id="topAlbums">
              <table class="table" style="width:100%; border-collapse:collapse">
                <thead>
                  <tr style="border-bottom:1px solid var(--line)">
                    <th style="padding:12px; text-align:left">#</th>
                    <th style="padding:12px; text-align:left">Album</th>
                    <th style="padding:12px; text-align:right">Mentions</th>
                    <th style="padding:12px; text-align:right">%</th>
                  </tr>
                </thead>
                <tbody id="albumTableBody">
                  <tr><td colspan="4" style="padding:20px; text-align:center; color:var(--muted)">Loading...</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px,1fr)); gap:20px">
            <div class="card panel">
              <h3 style="margin:0 0 12px 0">📊 4. Users Sharing #1 Artist</h3>
              <p class="muted" style="margin-bottom:16px; font-size:0.85rem">Distribution of users by their top artist</p>
              <table class="table" style="width:100%; border-collapse:collapse">
                <thead>
                  <tr style="border-bottom:1px solid var(--line)">
                    <th style="padding:8px; text-align:left">Artist</th>
                    <th style="padding:8px; text-align:right">Users</th>
                  </tr>
                </thead>
                <tbody id="topArtistSharedBody">
                  <tr><td colspan="2" style="padding:20px; text-align:center; color:var(--muted)">Loading...</td></tr>
                </tbody>
              </table>
              <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--line)">
                <div style="display:flex; justify-content:space-between; padding:4px">
                  <span class="muted" style="font-size:0.9rem">Most common #1:</span>
                  <strong id="commonArtist" style="font-size:0.9rem">-</strong>
                </div>
              </div>
            </div>

            <div class="card panel">
              <h3 style="margin:0 0 12px 0">📊 5. Top 10 Artists Chart</h3>
              <canvas id="topArtistsChart" style="max-height:300px"></canvas>
              <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--line)">
                  <span class="muted">Mean mentions/artist:</span>
                  <strong id="meanMentions">-</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--line)">
                  <span class="muted">Median:</span>
                  <strong id="medianMentions">-</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--line)">
                  <span class="muted">Std. Deviation:</span>
                  <strong id="stdDeviation">-</strong>
                </div>
            </div>

            <div class="card panel">
              <h3 style="margin:0 0 12px 0">📉 6. Long Tail Analysis</h3>
              <div class="grid" style="gap:12px">
                <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--line)">
                  <span class="muted">Artists for 80% coverage:</span>
                  <strong id="longTailCount">-</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--line)">
                  <span class="muted">Percentage of total:</span>
                  <strong id="longTailPercent">-</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding:8px">
                  <span class="muted">Total unique artists:</span>
                  <strong id="totalArtists">-</strong>
                </div>
                <canvas id="longTailChart" style="max-height:300px"></canvas>
              </div>
            </div>
          </div>
        </section>
      </main>

      <script>
        (function(){
          var API = "http://localhost:3000";
          let topArtistsChart = null;
          let longTailChart = null;

          function $(id){ return document.getElementById(id) }
          function setText(id, v){ var el=$(id); if(el) el.textContent=v }

          async function apiGet(path){
            try {
              const response = await fetch(API + path);
              return response.ok ? await response.json() : [];
            } catch (error) {
              console.error('API Error:', error);
              return [];
            }
          }

          async function loadTopArtists() {
            const tbody = $("artistTableBody");
            const data = await apiGet("/api/analytics/top-artists");
            
            if (data.length === 0) {
              tbody.innerHTML = '<tr><td colspan="4" style="padding:20px; text-align:center; color:#ff6b6b">No data available</td></tr>';
              return;
            }
            
            tbody.innerHTML = "";
            data.forEach((item, index) => {
              const tr = document.createElement("tr");
              tr.style.borderBottom = "1px solid var(--line)";
              tr.innerHTML = \`
                <td style="padding:12px; font-weight:600">\${index + 1}</td>
                <td style="padding:12px">\${item.artist_name || 'Unknown'}</td>
                <td style="padding:12px; text-align:right">\${(item.mentions || 0).toLocaleString()}</td>
                <td style="padding:12px; text-align:right; color:#5aa9ff">\${(item.percentage || 0).toFixed(2)}%</td>
              \`;
              tbody.appendChild(tr);
            });

            // Create chart with top 10
            const top10 = data.slice(0, 10);
            const ctx = $('topArtistsChart').getContext('2d');
            if (topArtistsChart) topArtistsChart.destroy();
            
            topArtistsChart = new Chart(ctx, {
              type: 'bar',
              data: {
                labels: top10.map(a => a.artist_name),
                datasets: [{
                  label: 'Mentions',
                  data: top10.map(a => a.mentions),
                  backgroundColor: 'rgba(90, 169, 255, 0.8)',
                  borderColor: 'rgba(90, 169, 255, 1)',
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: false }
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
                      minRotation: 45
                    },
                    grid: { color: '#2a3340' }
                  }
                }
              }
            });
          }

          async function loadTopSongs() {
            const tbody = $("songTableBody");
            const data = await apiGet("/api/analytics/top-songs");
            
            if (data.length === 0) {
              tbody.innerHTML = '<tr><td colspan="4" style="padding:20px; text-align:center; color:#ff6b6b">No data available</td></tr>';
              return;
            }
            
            tbody.innerHTML = "";
            data.forEach((item, index) => {
              const tr = document.createElement("tr");
              tr.style.borderBottom = "1px solid var(--line)";
              tr.innerHTML = \`
                <td style="padding:12px; font-weight:600">\${index + 1}</td>
                <td style="padding:12px">\${item.track_name || 'Unknown'}</td>
                <td style="padding:12px; text-align:right">\${(item.mentions || 0).toLocaleString()}</td>
                <td style="padding:12px; text-align:right; color:#5aa9ff">\${(item.percentage || 0).toFixed(2)}%</td>
              \`;
              tbody.appendChild(tr);
            });
          }

          async function loadTopAlbums() {
            const tbody = $("albumTableBody");
            const data = await apiGet("/api/analytics/top-albums");
            
            if (data.length === 0) {
              tbody.innerHTML = '<tr><td colspan="4" style="padding:20px; text-align:center; color:#ff6b6b">No data available</td></tr>';
              return;
            }
            
            tbody.innerHTML = "";
            data.forEach((item, index) => {
              const tr = document.createElement("tr");
              tr.style.borderBottom = "1px solid var(--line)";
              tr.innerHTML = \`
                <td style="padding:12px; font-weight:600">\${index + 1}</td>
                <td style="padding:12px">\${item.album_name || 'Unknown'}</td>
                <td style="padding:12px; text-align:right">\${(item.mentions || 0).toLocaleString()}</td>
                <td style="padding:12px; text-align:right; color:#5aa9ff">\${(item.percentage || 0).toFixed(2)}%</td>
              \`;
              tbody.appendChild(tr);
            });
          }

          async function loadDistributionMetrics() {
            const distribution = await apiGet("/api/analytics/distribution");
            const longTail = await apiGet("/api/analytics/long-tail");
            const topArtistShared = await apiGet("/api/analytics/top-artist-shared");
            const uniqueCounts = await apiGet("/api/analytics/unique-counts");
            
            if (distribution && distribution.mean) {
              setText("meanMentions", parseFloat(distribution.mean).toFixed(2));
              setText("medianMentions", parseFloat(distribution.median).toFixed(2));
              setText("stdDeviation", parseFloat(distribution.stddev).toFixed(2));
            }
            
            // Load top artist shared table
            if (topArtistShared && topArtistShared.length > 0) {
              const tbody = $("topArtistSharedBody");
              tbody.innerHTML = "";
              
              topArtistShared.slice(0, 10).forEach((item) => {
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid var(--line)";
                tr.innerHTML = \`
                  <td style="padding:8px">\${item.top_artist}</td>
                  <td style="padding:8px; text-align:right; color:#5aa9ff">\${item.frequency.toLocaleString()}</td>
                \`;
                tbody.appendChild(tr);
              });
              
              // Update mode summary
              const top = topArtistShared[0];
              setText("commonArtist", \`\${top.top_artist} (\${top.frequency.toLocaleString()} users)\`);
            }
            
            if (longTail) {
            
              setText("longTailCount", (longTail.artists_count || 0).toLocaleString());
              setText("longTailPercent", (longTail.percentage_artists || 0).toFixed(2) + '%');
              
              // Long Tail Chart
              const ctx = $('longTailChart').getContext('2d');
              if (longTailChart) longTailChart.destroy();
              const coveragePercent = parseFloat(longTail.percentage_artists || 0);
              const remainingPercent = 100 - coveragePercent;
              
              longTailChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                  labels: ['80% Mentions Coverage', 'Remaining Artists'],
                  datasets: [{
                    data: [coveragePercent, remainingPercent],
                    backgroundColor: ['rgba(90, 169, 255, 0.8)', 'rgba(159, 176, 200, 0.3)'],
                    borderColor: ['rgba(90, 169, 255, 1)', 'rgba(159, 176, 200, 0.5)'],
                    borderWidth: 1
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { 
                      display: true,
                      labels: { color: '#9fb0c8' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return context.label + ': ' + context.parsed.toFixed(1) + '%';
                        }
                      }
                    }
                  }
                }
              });
            }
            
            if (uniqueCounts) {
              setText("totalArtists", (uniqueCounts.unique_artists || 0).toLocaleString());
            }
          }

          $("btnHome").addEventListener("click", function(){ window.location.href = "/home" });
          
          // Load all data
          Promise.all([
            loadTopArtists(),
            loadTopSongs(),
            loadTopAlbums(),
            loadDistributionMetrics()
          ]).then(() => {
            console.log('All popularity data loaded');
          }).catch(err => {
            console.error('Error loading data:', err);
          });
        })();
      </script>
    </body>
  </html>
  `;
};

export default createAnalytics;
