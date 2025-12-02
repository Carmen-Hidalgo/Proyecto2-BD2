const qualityMetricsPage = () => {
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Data Quality Metrics - Music Analytics</title>
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
      .stat-grid{ display:grid; grid-template-columns:repeat(auto-fit, minmax(280px,1fr)); gap:20px; margin-bottom:32px }
      .stat-card{ padding:20px; background:var(--panel); border:1px solid var(--line); border-radius:12px }
      .stat-value{ font-size:2rem; font-weight:bold; margin:8px 0 }
      .stat-label{ color:var(--muted); font-size:0.9rem }
      .warning{ color:#ff9966 }
      .error{ color:#ff6b6b }
      .success{ color:#5aa9ff }
      
      .table{ width:100%; border-collapse:collapse; margin-top:16px }
      .table thead th{ text-align:left; font-weight:600; padding:12px; border-bottom:2px solid var(--line) }
      .table tbody td{ padding:12px; border-bottom:1px solid #0e1218 }
      
      .progress-bar{ width:100%; height:8px; background:#0e1218; border-radius:4px; overflow:hidden; margin-top:8px }
      .progress-fill{ height:100%; background:#5aa9ff; transition:width 0.3s }
    </style>
  </head>
  <body>
    <div class="topbar">
      <div class="brand"><span class="logo">🎵</span>Data Quality Metrics</div>
      <div class="top-actions">
        <button id="btnHome" class="btn">🏠 Home</button>
      </div>
    </div>

    <div class="page">
      <main class="panel">
        <h1 style="margin:0 0 8px 0">⚡ Data Quality & Completeness Analysis</h1>
        <p class="muted" style="margin-bottom:32px">Assessment of dataset integrity and outlier detection</p>

        <div class="stat-grid">
          <div class="card stat-card">
            <div class="stat-label">21. Data Completeness</div>
            <div class="stat-value success" id="completeness">...</div>
            <div class="progress-bar">
              <div class="progress-fill" id="completenessBar" style="width:0%"></div>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-label">Users with Missing Data</div>
            <div class="stat-value warning" id="missingUsers">...</div>
            <div class="muted" id="missingPct">...</div>
          </div>
          <div class="card stat-card">
            <div class="stat-label">22. Outlier Users</div>
            <div class="stat-value warning" id="outlierUsers">...</div>
            <div class="muted" id="outlierPct">...</div>
          </div>
          <div class="card stat-card">
            <div class="stat-label">23. Low Coverage Artists</div>
            <div class="stat-value error" id="lowCoverageArtists">...</div>
            <div class="muted">(<5 appearances)</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(450px,1fr)); gap:20px; margin-bottom:24px">
          <div class="card" style="padding:24px">
            <h3 style="margin:0 0 16px 0">📈 Outlier Users Distribution</h3>
            <canvas id="outliersChart" style="max-height:300px"></canvas>
          </div>
          <div class="card" style="padding:24px">
            <h3 style="margin:0 0 16px 0">🥇 18. Artist Diversity (Top 10)</h3>
            <canvas id="diversityChart" style="max-height:300px"></canvas>
          </div>
        </div>

        <div class="card" style="padding:24px; margin-bottom:24px">
          <h3 style="margin:0 0 16px 0">📋 Missing Data Breakdown</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Field</th>
                <th style="text-align:right">Missing Count</th>
                <th style="text-align:right">Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="missingDataBody">
              <tr><td colspan="4" style="text-align:center; padding:20px; color:var(--muted)">Loading data...</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card" style="padding:24px; margin-bottom:24px">
          <h3 style="margin:0 0 16px 0">📊 Outlier Detection (99th Percentile)</h3>
          <p class="muted" style="margin-bottom:16px">Users with extreme high or low activity</p>
          <table class="table">
            <thead>
              <tr>
                <th>Metric</th>
                <th style="text-align:right">99th %ile Value</th>
                <th style="text-align:right">Outlier Count</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody id="outliersBody">
              <tr><td colspan="4" style="text-align:center; padding:20px; color:var(--muted)">Loading data...</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card" style="padding:24px; margin-bottom:24px">
          <h3 style="margin:0 0 16px 0">🎵 19. Artist Coverage Analysis</h3>
          <p class="muted" style="margin-bottom:16px">Distribution of artist appearances</p>
          <div id="coverageSummary" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px,1fr)); gap:24px; margin-bottom:16px">
            <div style="padding:8px; color:var(--muted)">Loading...</div>
          </div>
        </div>

        <div class="card" style="padding:24px">
          <h3 style="margin:0 0 16px 0">🎯 20. Top 20 Artists with Highest Diversity</h3>
          <p class="muted" style="margin-bottom:16px">Artists with most unique users and distinct songs</p>
          <table class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Artist</th>
                <th style="text-align:right">Unique Users</th>
                <th style="text-align:right">Distinct Songs</th>
                <th style="text-align:right">Diversity Score</th>
              </tr>
            </thead>
            <tbody id="diversityBody">
              <tr><td colspan="5" style="text-align:center; padding:20px; color:var(--muted)">Loading data...</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card" style="padding:24px; margin-top:24px; border-left:4px solid #5aa9ff">
          <h3 style="margin:0 0 12px 0">💡 Data Quality Summary</h3>
          <ul id="qualitySummary" style="margin:0; padding-left:20px; line-height:1.8">
            <li style="color:var(--muted)">Loading summary...</li>
          </ul>
        </div>
      </main>
    </div>

  <script>
  (function(){
    var API = "http://localhost:3000";
    const TOTAL_USERS = 500000;
    
    let outliersChart = null;
    let diversityChart = null;

    function $(id){ return document.getElementById(id); }
    function setText(id, txt){ var el=$(id); if(el) el.textContent = txt; }
    
    async function apiGet(path){
      try {
        const response = await fetch(API + path);
        return response.ok ? await response.json() : null;
      } catch (error) {
        console.error('API Error:', error);
        return null;
      }
    }

    async function loadQualityStats() {
      const missing = await apiGet("/api/analytics/missing-data");
      const atypical = await apiGet("/api/analytics/atypical-users");
      const lowCoverage = await apiGet("/api/analytics/low-coverage");
      const uniqueCounts = await apiGet("/api/analytics/unique-counts");
      
      if (missing) {
        const count = missing.users_with_missing_data || 0;
        const pct = ((count / TOTAL_USERS) * 100).toFixed(1);
        const completeness = (100 - parseFloat(pct)).toFixed(1);
        
        setText('completeness', completeness + '%');
        setText('missingUsers', count.toLocaleString());
        setText('missingPct', '(' + pct + '% of total)');
        
        const bar = $('completenessBar');
        if (bar) bar.style.width = completeness + '%';
      }
      
      if (atypical) {
        const high = atypical.high_activity_users || 0;
        const low = atypical.low_activity_users || 0;
        const total = high + low;
        const pct = ((total / TOTAL_USERS) * 100).toFixed(1);
        
        setText('outlierUsers', total.toLocaleString());
        setText('outlierPct', '(' + pct + '% of total)');
        
        // Create outliers chart
        const ctx = $('outliersChart').getContext('2d');
        if (outliersChart) outliersChart.destroy();
        
        outliersChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['High Activity', 'Low Activity', 'Normal Users'],
            datasets: [{
              label: 'User Count',
              data: [high, low, TOTAL_USERS - total],
              backgroundColor: [
                'rgba(255, 153, 102, 0.8)',
                'rgba(255, 107, 107, 0.8)',
                'rgba(90, 169, 255, 0.8)'
              ],
              borderColor: [
                'rgba(255, 153, 102, 1)',
                'rgba(255, 107, 107, 1)',
                'rgba(90, 169, 255, 1)'
              ],
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
                ticks: { 
                  color: '#9fb0c8',
                  callback: function(value) {
                    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                    return value;
                  }
                },
                grid: { color: '#2a3340' }
              },
              x: { 
                ticks: { color: '#9fb0c8' },
                grid: { color: '#2a3340' }
              }
            }
          }
        });
        
        // Update outliers table
        const tbody = $('outliersBody');
        tbody.innerHTML = \`
          <tr style="border-bottom:1px solid var(--line)">
            <td>High Activity Users</td>
            <td style="text-align:right">99th percentile</td>
            <td style="text-align:right">\${high.toLocaleString()}</td>
            <td><span class="warning">High Activity</span></td>
          </tr>
          <tr style="border-bottom:1px solid var(--line)">
            <td>Low Activity Users</td>
            <td style="text-align:right">1st percentile</td>
            <td style="text-align:right">\${low.toLocaleString()}</td>
            <td><span class="error">Low Activity</span></td>
          </tr>
        \`;
      }
      
      if (lowCoverage && uniqueCounts) {
        const count = lowCoverage.low_coverage_artists_count || 0;
        setText('lowCoverageArtists', count.toLocaleString());
        
        const totalArtists = uniqueCounts.unique_artists || 1;
        const pct = ((count / totalArtists) * 100).toFixed(1);
        
        // Update coverage summary
        const summary = $('coverageSummary');
        if (summary) {
          summary.innerHTML = \`
            <div>
              <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--line)">
                <span class="muted">Low coverage (<5):</span>
                <strong class="error">\${count.toLocaleString()} (\${pct}%)</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--line)">
                <span class="muted">Total unique artists:</span>
                <strong>\${totalArtists.toLocaleString()}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px">
                <span class="muted">Well-covered artists:</span>
                <strong class="success">\${(totalArtists - count).toLocaleString()}</strong>
              </div>
            </div>
          \`;
        }
      }
      
      // Update missing data table
      if (missing) {
        const tbody = $('missingDataBody');
        const count = missing.users_with_missing_data || 0;
        const pct = ((count / TOTAL_USERS) * 100).toFixed(2);
        
        tbody.innerHTML = \`
          <tr style="border-bottom:1px solid var(--line)">
            <td>Total Missing Data</td>
            <td style="text-align:right">\${count.toLocaleString()}</td>
            <td style="text-align:right">\${pct}%</td>
            <td><span class="\${pct < 5 ? 'success' : 'warning'}">\${pct < 5 ? '✓ Good' : '⚠ Review'}</span></td>
          </tr>
        \`;
      }
      
      // Load diversity data and create chart
      const diversity = await apiGet("/api/analytics/artist-diversity");
      if (diversity && diversity.length > 0) {
        const tbody = $('diversityBody');
        tbody.innerHTML = '';
        
        diversity.slice(0, 20).forEach((item, index) => {
          const score = (Math.log(item.unique_users) * Math.log(item.unique_tracks)).toFixed(1);
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid var(--line)';
          tr.innerHTML = \`
            <td>\${index + 1}</td>
            <td>\${item.artist_name}</td>
            <td style="text-align:right">\${item.unique_users.toLocaleString()}</td>
            <td style="text-align:right">\${item.unique_tracks}</td>
            <td style="text-align:right; color:#5aa9ff">\${score}</td>
          \`;
          tbody.appendChild(tr);
        });
        
        // Create diversity chart
        const top10 = diversity.slice(0, 10);
        const ctx = $('diversityChart').getContext('2d');
        if (diversityChart) diversityChart.destroy();
        
        diversityChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: top10.map(item => item.artist_name),
            datasets: [
              {
                label: 'Unique Users',
                data: top10.map(item => item.unique_users),
                backgroundColor: 'rgba(90, 169, 255, 0.8)',
                borderColor: 'rgba(90, 169, 255, 1)',
                borderWidth: 1,
                yAxisID: 'y'
              },
              {
                label: 'Unique Tracks',
                data: top10.map(item => item.unique_tracks),
                backgroundColor: 'rgba(159, 176, 200, 0.8)',
                borderColor: 'rgba(159, 176, 200, 1)',
                borderWidth: 1,
                yAxisID: 'y1'
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
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Unique Users',
                  color: '#9fb0c8'
                },
                ticks: { color: '#9fb0c8' },
                grid: { color: '#2a3340' }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Unique Tracks',
                  color: '#9fb0c8'
                },
                ticks: { color: '#9fb0c8' },
                grid: { drawOnChartArea: false }
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
      
      // Update quality summary
      const summaryEl = $('qualitySummary');
      if (summaryEl && missing && lowCoverage && atypical && uniqueCounts) {
        const missingPct = ((missing.users_with_missing_data / TOTAL_USERS) * 100).toFixed(1);
        const completeness = (100 - parseFloat(missingPct)).toFixed(1);
        const outliersPct = (((atypical.high_activity_users + atypical.low_activity_users) / TOTAL_USERS) * 100).toFixed(1);
        const lowCovPct = ((lowCoverage.low_coverage_artists_count / uniqueCounts.unique_artists) * 100).toFixed(1);
        
        summaryEl.innerHTML = \`
          <li><strong class="success">\${completeness}% completeness</strong> - Dataset is highly complete with minimal missing data</li>
          <li><strong class="\${outliersPct < 2 ? 'success' : 'warning'}">\${(atypical.high_activity_users + atypical.low_activity_users).toLocaleString()} outlier users (\${outliersPct}%)</strong> - \${outliersPct < 2 ? 'Normal' : 'Elevated'} distribution</li>
          <li><strong class="\${lowCovPct < 20 ? 'success' : 'error'}">\${lowCovPct}% low-coverage artists</strong> - \${lowCovPct < 20 ? 'Acceptable' : 'Significant'} long-tail effect</li>
          <li><strong>Recommendation:</strong> Filter artists with <5 appearances for certain analyses to reduce noise</li>
        \`;
      }
    }

    document.getElementById("btnHome").addEventListener("click", function(){
      window.location.href = "/home";
    });

    loadQualityStats();
  })();
  </script>
  </body>
  </html>
  `;
};

export default qualityMetricsPage;
