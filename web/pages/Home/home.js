const home = () => {
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Home</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
      :root{ --bg:#0b0d10; --panel:#12161c; --muted:#9fb0c8; --line:#2a3340; --text:#e7eef7; --accent:#5aa9ff; }
      *{box-sizing:border-box}
      body{margin:0; font-family:system-ui,arial,segoe ui; background:var(--bg); color:var(--text)}
      a,button,input{font:inherit}
      .btn,.input{ padding:10px 12px; border-radius:10px; border:1px solid var(--line); background:#0f1217; color:var(--text) }
      .btn{cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:8px}
      .btn.icon{padding:8px 10px; border-radius:999px}
      .chip{padding:2px 8px; border:1px solid var(--line); border-radius:999px; font-size:.8rem; color:var(--muted)}
      .card{background:var(--panel); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.3)}
      .muted{color:var(--muted)}
      .topbar{ position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.2) blur(4px);
        display:flex; gap:12px; align-items:center; justify-content:space-between;
        padding:12px 18px; border-bottom:1px solid #0e1218; background:rgba(11,13,16,.6) }
      .brand{display:flex; align-items:center; gap:10px; font-weight:600}
        .brand .logo{width:28px; height:28px; border-radius:50%; background:#000; display:inline-block;background-image: url(https://cdn-icons-png.flaticon.com/512/18495/18495588.png);background-size: contain;}        .top-actions{display:flex; gap:10px; align-items:center}
      .top-actions{display:flex; gap:10px; align-items:center}
      .page{ min-height:calc(100vh - 60px); padding:32px; display:flex; justify-content:center }
      .panel{ padding:24px; width:100%; max-width:960px }
      .avatar.small{ width:32px; height:32px; border-radius:50%; display:block; object-fit:cover; }
      .badge-wrap { position: relative; }
        .badge {
          position: absolute;
          top: -4px; right: -4px;
          min-width: 10px; height: 10px;
          padding: 0 5px;
          border-radius: 999px;
          background: #eb5757;
          color: #fff;
          font-size: 11px;
          line-height: 16px;
          display: inline-flex;
          align-items: center; justify-content: center;
          border: 1px solid #0b0d10; /* ring for dark bg */
        }
        .badge.dot { min-width: 10px; padding: 0; line-height: 10px; }
      /* Opciones de búsqueda */
      .subtabs{ display:flex; gap:8px; align-items:center; border-bottom:1px solid var(--line); margin-bottom:16px }
      .tab{ padding:10px 12px; border:1px solid var(--line); border-bottom:none; border-radius:10px 10px 0 0; cursor:pointer; color:var(--muted); background:#0f1217 }
      .tab.active{ color:var(--text); background:#121822 }
      
      /* Tabla */
      .table{ width:100%; border-collapse:separate; border-spacing:0; overflow:hidden; border:1px solid var(--line); border-radius:12px; background:#0f1217 }
      .table thead th{ text-align:left; font-weight:600; padding:12px; border-bottom:1px solid var(--line) }
      .table tbody td{ padding:12px; border-top:1px solid #0e1218 }
      .table tbody tr:first-child td{ border-top:none }
      .col-name{ width:50% } .col-mid{ width:30%; white-space:nowrap } .col-actions{ width:20%; text-align:right }
      .empty-row td{ text-align:center; color:var(--muted); font-style:italic }
      
      /* Nombre de usuarios o datasets */
      .pill{ display:inline-block; padding:2px 8px; border:1px solid var(--line); border-radius:999px; font-size:.75rem; color:var(--muted) }
    </style>
  </head>
  <body>
    <div class="topbar">
      <div class="brand"><span class="logo" style="background-image:none;background:#5aa9ff;display:flex;align-items:center;justify-content:center;font-size:16px">🎵</span>Music Analytics</div>
      <div class="top-actions">
        <a href="/home" class="btn">📊 Dashboard</a>
        <a href="/datasets/new" class="btn">📈 Analytics</a>
      </div>
    </div>

    <div class="page">
      <main class="panel" style="max-width:1200px">
        <h1 style="margin-bottom:8px">Music Listening Analytics Dashboard</h1>
        <p class="muted" style="margin-bottom:32px">Analysis of 500K users music preferences using Apache Spark</p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; margin-bottom:32px">
          <div class="card" style="padding:20px; cursor:pointer" onclick="location.href='/datasets/new'">
            <div style="font-size:2rem; margin-bottom:8px">🎤</div>
            <h3 style="margin:0 0 8px 0">Popularity Analysis: 1-6</h3>
            <p class="muted" style="font-size:0.9rem; margin:0">Top 20 artists, songs, albums and distribution metrics</p>
          </div>

          <div class="card" style="padding:20px; cursor:pointer" onclick="location.href='/userstats'">
            <div style="font-size:2rem; margin-bottom:8px">👥</div>
            <h3 style="margin:0 0 8px 0">User Statistics: 7-10</h3>
            <p class="muted" style="font-size:0.9rem; margin:0">Items per user, unique counts, and listening patterns</p>
          </div>

          <div class="card" style="padding:20px; cursor:pointer" onclick="location.href='/cooccurrence'">
            <div style="font-size:2rem; margin-bottom:8px">🔗</div>
            <h3 style="margin:0 0 8px 0">Co-occurrence Analysis: 11-16</h3>
            <p class="muted" style="font-size:0.9rem; margin:0">Artist pairs, triplets, and position correlations</p>
          </div>

          <div class="card" style="padding:20px; cursor:pointer" onclick="location.href='/quality'">
            <div style="font-size:2rem; margin-bottom:8px">⚡</div>
            <h3 style="margin:0 0 8px 0">Quality Metrics: 18-23</h3>
            <p class="muted" style="font-size:0.9rem; margin:0">Data completeness, outliers, and coverage analysis</p>
          </div>
        </div>

        <div class="card" style="padding:24px">
          <h3>Quick Stats</h3>
          <div id="quickStats" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px">
            <div style="text-align:center; padding:16px">
              <div style="font-size:2rem; font-weight:bold; color:#5aa9ff" id="stat-users">500K</div>
              <div class="muted">Total Users</div>
            </div>
            <div style="text-align:center; padding:16px">
              <div style="font-size:2rem; font-weight:bold; color:#5aa9ff" id="stat-artists">...</div>
              <div class="muted">Unique Artists</div>
            </div>
            <div style="text-align:center; padding:16px">
              <div style="font-size:2rem; font-weight:bold; color:#5aa9ff" id="stat-songs">...</div>
              <div class="muted">Unique Songs</div>
            </div>
            <div style="text-align:center; padding:16px">
              <div style="font-size:2rem; font-weight:bold; color:#5aa9ff" id="stat-albums">...</div>
              <div class="muted">Unique Albums</div>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px">
          <div class="card" style="padding:24px">
            <h3>Top 5 Artists</h3>
            <canvas id="topArtistsChart" style="max-height:300px"></canvas>
          </div>
          <div class="card" style="padding:24px">
            <h3>Long Tail Distribution</h3>
            <canvas id="longTailChart" style="max-height:300px"></canvas>
          </div>
        </div>

        <div class="card" style="padding:24px; margin-top:20px">
          <h3>Items Per User Statistics</h3>
          <canvas id="userStatsChart" style="max-height:250px"></canvas>
        </div>
      </main>
    </div>

  <script>
  (function(){
    var API = "http://localhost:3000";
    
    function $(id){ return document.getElementById(id); }
    function setText(id, txt){ var el=$(id); if(el) el.textContent = txt; }
    function formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    }

    let topArtistsChart = null;
    let longTailChart = null;
    let userStatsChart = null;

    async function loadDashboardData() {
      try {
        const response = await fetch(API + '/api/analytics/dashboard');
        const data = await response.json();
        
        // Update quick stats
        if (data.uniqueCounts) {
          setText('stat-artists', formatNumber(data.uniqueCounts.unique_artists || 0));
          setText('stat-songs', formatNumber(data.uniqueCounts.unique_tracks || 0));
          setText('stat-albums', formatNumber(data.uniqueCounts.unique_albums || 0));
        }

        // Top Artists Chart
        if (data.topArtists && data.topArtists.length > 0) {
          const ctx = $('topArtistsChart').getContext('2d');
          if (topArtistsChart) topArtistsChart.destroy();
          topArtistsChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: data.topArtists.map(a => a.artist_name),
              datasets: [{
                label: 'Mentions',
                data: data.topArtists.map(a => a.mentions),
                backgroundColor: 'rgba(90, 169, 255, 0.8)',
                borderColor: 'rgba(90, 169, 255, 1)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { display: false },
                title: { display: false }
              },
              scales: {
                y: { 
                  beginAtZero: true,
                  ticks: { color: '#9fb0c8' },
                  grid: { color: '#2a3340' }
                },
                x: { 
                  ticks: { color: '#9fb0c8' },
                  grid: { color: '#2a3340' }
                }
              }
            }
          });
        }

        // Long Tail Chart
        if (data.longTail) {
          const ctx = $('longTailChart').getContext('2d');
          if (longTailChart) longTailChart.destroy();
          const coveragePercent = parseFloat(data.longTail.percentage_artists || 0);
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

        // User Stats Chart
        if (data.userStats) {
          const ctx = $('userStatsChart').getContext('2d');
          if (userStatsChart) userStatsChart.destroy();
          
          userStatsChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Artists', 'Tracks', 'Albums'],
              datasets: [
                {
                  label: 'Mean per User',
                  data: [
                    parseFloat(data.userStats.mean_artists_per_user || 0),
                    parseFloat(data.userStats.mean_tracks_per_user || 0),
                    parseFloat(data.userStats.mean_albums_per_user || 0)
                  ],
                  backgroundColor: 'rgba(90, 169, 255, 0.8)',
                  borderColor: 'rgba(90, 169, 255, 1)',
                  borderWidth: 1
                },
                {
                  label: 'Median per User',
                  data: [
                    parseFloat(data.userStats.median_artists_per_user || 0),
                    parseFloat(data.userStats.median_tracks_per_user || 0),
                    parseFloat(data.userStats.median_albums_per_user || 0)
                  ],
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
                  labels: { color: '#9fb0c8' }
                }
              },
              scales: {
                y: { 
                  beginAtZero: true,
                  ticks: { color: '#9fb0c8' },
                  grid: { color: '#2a3340' }
                },
                x: { 
                  ticks: { color: '#9fb0c8' },
                  grid: { color: '#2a3340' }
                }
              }
            }
          });
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setText('stat-artists', 'Error');
        setText('stat-songs', 'Error');
        setText('stat-albums', 'Error');
      }
    }

    // Load data on page load
    loadDashboardData();
  })();
  </script>
  </body>
  </html>
  `;
};

export default home;
