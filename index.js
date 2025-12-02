// Music Analytics Platform Server
import express from "express";
import dotenv from "dotenv";
import db from "./db/mariadb.js";

// Import page modules
import home from "./web/pages/Home/home.js";
import createAnalytics from "./web/pages/Analytics/createAnalytics/createAnalytics.js";
import userStatsPage from "./web/pages/UserStats/userstats.js";
import cooccurrencePage from "./web/pages/CoOccurrence/cooccurrence.js";
import qualityMetricsPage from "./web/pages/Quality/quality.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static("pages"));
app.use(express.json());

// Routes - Analytics Pages
app.get("/", (req, res) => {
  res.send(home());
});

app.get("/home", (req, res) => {
  res.send(home());
});

app.get("/datasets/new", (req, res) => {
  res.send(createAnalytics());
});

app.get("/userstats", (req, res) => {
  res.send(userStatsPage());
});

app.get("/cooccurrence", (req, res) => {
  res.send(cooccurrencePage());
});

app.get("/quality", (req, res) => {
  res.send(qualityMetricsPage());
});

// ========================================
// API ROUTES - Connected to MariaDB
// ========================================

// POPULARITY ANALYSIS APIs (Análisis 1-6)
app.get("/api/analytics/top-artists", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM top_20_artists ORDER BY mentions DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching top artists:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/top-songs", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM top_20_tracks ORDER BY mentions DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching top songs:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/top-albums", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM top_20_albums ORDER BY mentions DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching top albums:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/top-artist-shared", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM users_share_top_artist LIMIT 10"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching shared top artist:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/distribution", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM artist_mentions_distribution");
    res.json(rows[0] || {});
  } catch (error) {
    console.error("Error fetching distribution:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/long-tail", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM long_tail_analysis");
    res.json(rows[0] || {});
  } catch (error) {
    console.error("Error fetching long tail:", error);
    res.status(500).json({ error: error.message });
  }
});

// USER STATISTICS APIs (Análisis 7-10)
app.get("/api/analytics/user-stats", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM items_per_user_stats");
    res.json(rows[0] || {});
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/unique-counts", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM unique_items_count");
    res.json(rows[0] || {});
  } catch (error) {
    console.error("Error fetching unique counts:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/top3-identical", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM top3_identical_lists ORDER BY user_count DESC LIMIT 10"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching top3 identical:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/concentrated-taste", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM concentrated_taste_users");
    res.json(rows[0] || {});
  } catch (error) {
    console.error("Error fetching concentrated taste:", error);
    res.status(500).json({ error: error.message });
  }
});

// CO-OCCURRENCE APIs (Análisis 11-16)
app.get("/api/analytics/artist-pairs", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM frequent_artist_pairs ORDER BY cooccurrence_count DESC LIMIT 50"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching artist pairs:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/artist-triplets", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM frequent_artist_triplets ORDER BY cooccurrence_count DESC LIMIT 20"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching artist triplets:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/artist-track-overlap", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM artist_track_overlap");
    res.json(rows[0] || {});
  } catch (error) {
    console.error("Error fetching overlap:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/avg-artist-position", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM avg_artist_position ORDER BY avg_rank ASC LIMIT 30"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching avg position:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/top1-in-top5", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM top1_in_global_top5");
    res.json(rows[0] || {});
  } catch (error) {
    console.error("Error fetching top1 in top5:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/position-stability", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM position_stability");
    res.json(rows[0] || {});
  } catch (error) {
    console.error("Error fetching position stability:", error);
    res.status(500).json({ error: error.message });
  }
});

// QUALITY METRICS APIs (Análisis 18-23)
app.get("/api/analytics/active-listeners", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM top_artists_active_listeners ORDER BY listener_count DESC LIMIT 20"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching active listeners:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/cross-popularity", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM cross_popularity ORDER BY ABS(difference) DESC LIMIT 30"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching cross popularity:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/artist-diversity", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM artist_diversity ORDER BY unique_users DESC LIMIT 50"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching artist diversity:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/missing-data", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM missing_data_count");
    res.json(rows[0] || {});
  } catch (error) {
    console.error("Error fetching missing data:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/atypical-users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM atypical_users");
    res.json(rows[0] || {});
  } catch (error) {
    console.error("Error fetching atypical users:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/analytics/low-coverage", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM low_coverage_artists");
    res.json(rows[0] || {});
  } catch (error) {
    console.error("Error fetching low coverage:", error);
    res.status(500).json({ error: error.message });
  }
});

// Combined endpoint for dashboard
app.get("/api/analytics/dashboard", async (req, res) => {
  try {
    const [uniqueCounts] = await db.query("SELECT * FROM unique_items_count");
    const [userStats] = await db.query("SELECT * FROM items_per_user_stats");
    const [topArtists] = await db.query(
      "SELECT * FROM top_20_artists ORDER BY mentions DESC LIMIT 5"
    );
    const [longTail] = await db.query("SELECT * FROM long_tail_analysis");

    res.json({
      uniqueCounts: uniqueCounts[0] || {},
      userStats: userStats[0] || {},
      topArtists: topArtists,
      longTail: longTail[0] || {},
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(` running at http://localhost:${PORT}`);
  console.log(`\nAll API endpoints connected to MariaDB`);
  console.log(
    `   Database: ${process.env.MARIADB_HOST}:${process.env.MARIADB_PORT}`
  );
});

process.on("SIGINT", async () => {
  console.log("\nShutting down ");
  await db.end();
  process.exit(0);
});
