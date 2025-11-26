const userStatsPage = () => {
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>User Statistics - Music Analytics</title>
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
      .stat-grid{ display:grid; grid-template-columns:repeat(auto-fit, minmax(280px,1fr)); gap:20px; margin-bottom:32px }
      .stat-card{ padding:20px; background:var(--panel); border:1px solid var(--line); border-radius:12px }
      .stat-value{ font-size:2rem; font-weight:bold; color:#5aa9ff; margin:8px 0 }
      .stat-label{ color:var(--muted); font-size:0.9rem }
      
      .table{ width:100%; border-collapse:collapse; margin-top:16px }
      .table thead th{ text-align:left; font-weight:600; padding:12px; border-bottom:2px solid var(--line) }
      .table tbody td{ padding:12px; border-bottom:1px solid #0e1218 }
    </style>
  </head>
  <body>
    <div class="topbar">
      <div class="brand"><span class="logo">🎵</span>User Statistics</div>
      <div class="top-actions">
        <button id="btnHome" class="btn">🏠 Home</button>
      </div>
    </div>

    <div class="page">
      <main class="panel">
        <h1 style="margin:0 0 8px 0">👥 User Listening Statistics</h1>
        <p class="muted" style="margin-bottom:32px">Aggregate analysis of user behavior and preferences</p>

        <div class="stat-grid">
          <div class="card stat-card">
            <div class="stat-label">Total Users</div>
            <div class="stat-value" id="totalUsers">500,000</div>
          </div>
          <div class="card stat-card">
            <div class="stat-label">Unique Artists</div>
            <div class="stat-value" id="uniqueArtists">40,732</div>
          </div>
          <div class="card stat-card">
            <div class="stat-label">Unique Songs</div>
            <div class="stat-value" id="uniqueSongs">287,456</div>
          </div>
          <div class="card stat-card">
            <div class="stat-label">Unique Albums</div>
            <div class="stat-value" id="uniqueAlbums">89,234</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(450px,1fr)); gap:20px; margin-bottom:24px">
          <div class="card" style="padding:24px">
            <h3 style="margin:0 0 16px 0">📊 Items Per User - Mean vs Median</h3>
            <canvas id="itemsPerUserChart" style="max-height:300px"></canvas>
          </div>
          <div class="card" style="padding:24px">
            <h3 style="margin:0 0 16px 0">🎯 User Behavior Patterns</h3>
            <canvas id="behaviorPatternsChart" style="max-height:300px"></canvas>
          </div>
        </div>

        <div class="card" style="padding:24px; margin-bottom:24px">
          <h3 style="margin:0 0 16px 0">📈 User Behavior Metrics</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Metric</th>
                <th style="text-align:right">Count</th>
                <th style="text-align:right">Percentage</th>
              </tr>
            </thead>
            <tbody id="behaviorMetricsBody">
              <tr><td colspan="3" style="text-align:center; padding:20px; color:var(--muted)">Loading data...</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card" style="padding:24px">
          <h3 style="margin:0 0 16px 0">🔍 Most Common Top-3 Identical Lists</h3>
          <p class="muted" style="margin-bottom:16px">Users sharing identical top-3 artist lists</p>
          <canvas id="top3DuplicatesChart" style="max-height:350px"></canvas>
        </div>
      </main>
    </div>

  <script>
  (function(){
    var API = "http://localhost:3000";
    const TOTAL_USERS = 500000;
    
    let itemsChart = null;
    let behaviorChart = null;
    let top3Chart = null;

    function $(id){ return document.getElementById(id); }
    function setText(id, txt){ var el=$(id); if(el) el.textContent = txt; }
    function formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    }

    async function apiGet(path){
      try {
        const response = await fetch(API + path);
        return response.ok ? await response.json() : null;
      } catch (error) {
        console.error('API Error:', error);
        return null;
      }
    }

    async function loadUserStats() {
      // Load unique counts
      const uniqueCounts = await apiGet("/api/analytics/unique-counts");
      if (uniqueCounts) {
        setText("totalUsers", formatNumber(TOTAL_USERS));
        setText("uniqueArtists", formatNumber(uniqueCounts.unique_artists || 0));
        setText("uniqueSongs", formatNumber(uniqueCounts.unique_tracks || 0));
        setText("uniqueAlbums", formatNumber(uniqueCounts.unique_albums || 0));
      }
      
      // Load items per user stats
      const userStats = await apiGet("/api/analytics/user-stats");
      if (userStats) {
        const ctx = $('itemsPerUserChart').getContext('2d');
        if (itemsChart) itemsChart.destroy();
        
        itemsChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Artists', 'Tracks', 'Albums'],
            datasets: [
              {
                label: 'Mean per User',
                data: [
                  parseFloat(userStats.mean_artists_per_user || 0),
                  parseFloat(userStats.mean_tracks_per_user || 0),
                  parseFloat(userStats.mean_albums_per_user || 0)
                ],
                backgroundColor: 'rgba(90, 169, 255, 0.8)',
                borderColor: 'rgba(90, 169, 255, 1)',
                borderWidth: 1
              },
              {
                label: 'Median per User',
                data: [
                  parseFloat(userStats.median_artists_per_user || 0),
                  parseFloat(userStats.median_tracks_per_user || 0),
                  parseFloat(userStats.median_albums_per_user || 0)
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

      // Load behavior patterns
      await loadBehaviorPatterns();
      
      // Load top3 identical lists
      const top3Data = await apiGet("/api/analytics/top3-identical");
      if (top3Data && top3Data.length > 0) {
        const ctx = $('top3DuplicatesChart').getContext('2d');
        if (top3Chart) top3Chart.destroy();
        
        const top10 = top3Data.slice(0, 10);
        
        top3Chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: top10.map((item, i) => 'List ' + (i + 1)),
            datasets: [{
              label: 'Users with Same Top-3',
              data: top10.map(item => item.user_count),
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
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: function(context) {
                    const index = context[0].dataIndex;
                    return top10[index].top3_artists || 'Unknown';
                  },
                  label: function(context) {
                    return context.parsed.x + ' users';
                  }
                }
              }
            },
            scales: {
              x: { 
                beginAtZero: true,
                ticks: { color: '#9fb0c8' },
                grid: { color: '#2a3340' }
              },
              y: { 
                ticks: { color: '#9fb0c8' },
                grid: { color: '#2a3340' }
              }
            }
          }
        });
      }
    }

    async function loadBehaviorPatterns() {
      const tbody = $('behaviorMetricsBody');
      
      const concentrated = await apiGet("/api/analytics/concentrated-taste");
      const overlap = await apiGet("/api/analytics/artist-track-overlap");
      const top1InTop5 = await apiGet("/api/analytics/top1-in-top5");
      const stability = await apiGet("/api/analytics/position-stability");
      
      let html = '';
      
      if (concentrated) {
        const count = concentrated.concentrated_users_count || 0;
        const pct = ((count / TOTAL_USERS) * 100).toFixed(2);
        html += '<tr>' +
          '<td>Users with concentrated taste (top 5 same artist)</td>' +
          '<td style="text-align:right">' + count.toLocaleString() + '</td>' +
          '<td style="text-align:right; color:#5aa9ff">' + pct + '%</td>' +
        '</tr>';
      }
      
      if (overlap) {
        const count = overlap.overlap_count || 0;
        const pct = overlap.overlap_percentage || 0;
        html += '<tr>' +
          '<td>Song #1 matches Artist #1</td>' +
          '<td style="text-align:right">' + count.toLocaleString() + '</td>' +
          '<td style="text-align:right; color:#5aa9ff">' + pct + '%</td>' +
        '</tr>';
      }
      
      if (top1InTop5 && top1InTop5.percentage !== undefined) {
        const count = top1InTop5.matching_users || 0;
        const pct = parseFloat(top1InTop5.percentage || 0).toFixed(2);
        html += '<tr>' +
          '<td>Users with #1 artist in global top 5</td>' +
          '<td style="text-align:right">' + count.toLocaleString() + '</td>' +
          '<td style="text-align:right; color:#5aa9ff">' + pct + '%</td>' +
        '</tr>';
      }
      
      if (stability) {
        const count = stability.stable_users_count || 0;
        const pct = ((count / TOTAL_USERS) * 100).toFixed(2);
        html += '<tr>' +
          '<td>Users with stable top-2 positions (same artist)</td>' +
          '<td style="text-align:right">' + count.toLocaleString() + '</td>' +
          '<td style="text-align:right; color:#5aa9ff">' + pct + '%</td>' +
        '</tr>';
      }
      
      if (html) {
        tbody.innerHTML = html;
        
        // Create pie chart for behavior patterns
        const ctx = $('behaviorPatternsChart').getContext('2d');
        if (behaviorChart) behaviorChart.destroy();
        
        const data = [];
        const labels = [];
        
        if (concentrated) {
          data.push(concentrated.concentrated_users_count || 0);
          labels.push('Concentrated Taste');
        }
        if (overlap) {
          data.push(overlap.overlap_count || 0);
          labels.push('Song=Artist #1');
        }
        if (stability) {
          data.push(stability.stable_users_count || 0);
          labels.push('Stable Top-2');
        }
        
        behaviorChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: [
                'rgba(90, 169, 255, 0.8)',
                'rgba(159, 176, 200, 0.8)',
                'rgba(255, 153, 102, 0.8)'
              ],
              borderColor: [
                'rgba(90, 169, 255, 1)',
                'rgba(159, 176, 200, 1)',
                'rgba(255, 153, 102, 1)'
              ],
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
              }
            }
          }
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#ff6b6b">No data available</td></tr>';
      }
    }

    document.getElementById("btnHome").addEventListener("click", function(){
      window.location.href = "/home";
    });

    // Load data on page load
    loadUserStats();
  })();
  </script>
  </body>
  </html>
  `;
};

export default userStatsPage;
