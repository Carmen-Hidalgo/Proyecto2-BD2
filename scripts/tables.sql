-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS testdb;
USE testdb;

-- ==========================
-- TABLAS PARA ANÁLISIS 1-3: TOP 20
-- ==========================

CREATE TABLE IF NOT EXISTS top_20_artists (
    artist_name VARCHAR(255) PRIMARY KEY,
    mentions INT,
    percentage DECIMAL(5,2)
);

CREATE TABLE IF NOT EXISTS top_20_tracks (
    track_name VARCHAR(255) PRIMARY KEY,
    mentions INT,
    percentage DECIMAL(5,2)
);

CREATE TABLE IF NOT EXISTS top_20_albums (
    album_name VARCHAR(255) PRIMARY KEY,
    mentions INT,
    percentage DECIMAL(5,2)
);

-- ==========================
-- TABLA PARA ANÁLISIS 4: ARTISTA PRINCIPAL
-- ==========================

CREATE TABLE IF NOT EXISTS users_share_top_artist (
    top_artist VARCHAR(255) PRIMARY KEY,
    frequency INT
);

-- ==========================
-- TABLA PARA ANÁLISIS 5: DISTRIBUCIÓN MENCIONES
-- ==========================

CREATE TABLE IF NOT EXISTS artist_mentions_distribution (
    mean DECIMAL(10,2),
    median DECIMAL(10,2),
    stddev DECIMAL(10,2)
);

-- ==========================
-- TABLA PARA ANÁLISIS 6: LONG TAIL
-- ==========================

CREATE TABLE IF NOT EXISTS long_tail_analysis (
    percentage_artists DECIMAL(5,2),
    artists_count INT,
    total_artists INT
);

-- ==========================
-- TABLA PARA ANÁLISIS 7: ÍTEMS POR USUARIO
-- ==========================

CREATE TABLE IF NOT EXISTS items_per_user_stats (
    mean_artists_per_user DECIMAL(10,2),
    median_artists_per_user DECIMAL(10,2),
    mean_tracks_per_user DECIMAL(10,2),
    median_tracks_per_user DECIMAL(10,2),
    mean_albums_per_user DECIMAL(10,2),
    median_albums_per_user DECIMAL(10,2)
);

-- ==========================
-- TABLA PARA ANÁLISIS 8: CONTEOS ÚNICOS
-- ==========================

CREATE TABLE IF NOT EXISTS unique_items_count (
    unique_artists INT,
    unique_tracks INT,
    unique_albums INT
);

-- ==========================
-- TABLA PARA ANÁLISIS 9: LISTAS TOP-3 IDÉNTICAS
-- ==========================

CREATE TABLE IF NOT EXISTS top3_identical_lists (
    top3_artists TEXT,
    user_count INT
);

-- ==========================
-- TABLA PARA ANÁLISIS 10: GUSTOS CONCENTRADOS
-- ==========================

CREATE TABLE IF NOT EXISTS concentrated_taste_users (
    concentrated_users_count INT
);

-- ==========================
-- TABLA PARA ANÁLISIS 11: PARES DE ARTISTAS
-- ==========================

CREATE TABLE IF NOT EXISTS frequent_artist_pairs (
    artist1 VARCHAR(255),
    artist2 VARCHAR(255),
    cooccurrence_count INT
);

-- ==========================
-- TABLA PARA ANÁLISIS 13: SOLAPAMIENTO ARTISTA-CANCIÓN
-- ==========================

CREATE TABLE IF NOT EXISTS artist_track_overlap (
    overlap_count INT,
    overlap_percentage DECIMAL(5,2)
);

-- ==========================
-- TABLA PARA ANÁLISIS 14: POSICIÓN PROMEDIO ARTISTAS
-- ==========================

CREATE TABLE IF NOT EXISTS avg_artist_position (
    artist_name VARCHAR(255) PRIMARY KEY,
    avg_rank DECIMAL(10,2)
);

-- ==========================
-- TABLA PARA ANÁLISIS 20: DIVERSIDAD DE ARTISTAS
-- ==========================

CREATE TABLE IF NOT EXISTS artist_diversity (
    artist_name VARCHAR(255),
    unique_users INT,
    unique_tracks INT
);

-- ==========================
-- TABLA PARA ANÁLISIS 21: DATOS FALTANTES
-- ==========================

CREATE TABLE IF NOT EXISTS missing_data_count (
    users_with_missing_data INT
);

-- ==========================
-- TABLA PARA ANÁLISIS 23: ARTISTAS BAJA COBERTURA
-- ==========================

CREATE TABLE IF NOT EXISTS low_coverage_artists (
    low_coverage_artists_count INT
);

-- ==========================
-- TABLAS ADICIONALES PARA ANÁLISIS FALTANTES
-- ==========================

-- Para análisis 12: Tripletas de artistas (si lo implementas después)
CREATE TABLE IF NOT EXISTS frequent_artist_triplets (
    artist1 VARCHAR(255),
    artist2 VARCHAR(255),
    artist3 VARCHAR(255),
    cooccurrence_count INT
);

-- Para análisis 15: Frecuencia #1 en top 5 global
CREATE TABLE IF NOT EXISTS top1_in_global_top5 (
    percentage DECIMAL(5,2)
);

-- Para análisis 16: Estabilidad de posiciones
CREATE TABLE IF NOT EXISTS position_stability (
    stable_users_count INT
);

-- Para análisis 18: Top artistas entre oyentes activos
CREATE TABLE IF NOT EXISTS top_artists_active_listeners (
    artist_name VARCHAR(255),
    listener_count INT
);

-- Para análisis 19: Popularidad cruzada
CREATE TABLE IF NOT EXISTS cross_popularity (
    artist_name VARCHAR(255),
    track_list_count INT,
    artist_list_count INT,
    difference INT
);

-- Para análisis 22: Usuarios atípicos
CREATE TABLE IF NOT EXISTS atypical_users (
    high_activity_users INT,
    low_activity_users INT
);

-- Mostrar todas las tablas creadas
SHOW TABLES;