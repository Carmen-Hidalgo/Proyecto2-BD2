from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.window import Window

# ==========================
# CONFIGURACIÓN DE SPARK
# ==========================

spark = SparkSession.builder \
    .appName("MusicAnalyzer") \
    .master("spark://spark-master:7077") \
    .config("spark.jars", "/opt/spark/jars/mysql-connector-java-8.0.29.jar") \
    .config("spark.executor.memory", "4g") \
    .config("spark.driver.memory", "4g") \
    .config("spark.sql.adaptive.enabled", "true") \
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
    .getOrCreate()

print("=== Spark Analyzer COMPLETO iniciado ===")

# ==========================
# LEER PARQUETS DESDE HDFS
# ==========================

users = spark.read.parquet("hdfs://hadoop-namenode:8020/music/users.parquet")
artists = spark.read.parquet("hdfs://hadoop-namenode:8020/music/user_top_artists.parquet")
tracks = spark.read.parquet("hdfs://hadoop-namenode:8020/music/user_top_tracks.parquet")
albums = spark.read.parquet("hdfs://hadoop-namenode:8020/music/user_top_albums.parquet")

print("Users:", users.count())
print("Top Artists:", artists.count())
print("Top Tracks:", tracks.count())
print("Top Albums:", albums.count())

# ==========================
# CONEXIÓN A MARIADB
# ==========================

jdbc_url = "jdbc:mysql://mariadb:3306/testdb"

def save_to_db(df, table_name):
    """Función auxiliar para guardar DataFrames en MariaDB"""
    try:
        df.write \
            .mode("overwrite") \
            .format("jdbc") \
            .option("url", jdbc_url) \
            .option("driver", "com.mysql.cj.jdbc.Driver") \
            .option("user", "root") \
            .option("password", "root123") \
            .option("dbtable", table_name) \
            .save()
        print(f"✅ Guardado: {table_name}")
        return True
    except Exception as e:
        print(f"❌ Error guardando {table_name}: {e}")
        # Guardar como fallback en HDFS
        try:
            df.write.mode("overwrite").parquet(f"hdfs://hadoop-namenode:8020/results/{table_name}.parquet")
            print(f"📁 Guardado en HDFS: /results/{table_name}.parquet")
            return True
        except Exception as hdfs_error:
            print(f"❌ Error también en HDFS: {hdfs_error}")
            return False

# ==========================
# ANÁLISIS 1-3: TOP 20 ARTISTAS, CANCIONES, ÁLBUMES
# ==========================

print("=== Análisis 1-3: Top 20 ===")

total_mentions = artists.count()

# 1. Top 20 artistas
top_artists = artists.groupBy("artist_name") \
    .agg(F.count("*").alias("mentions")) \
    .withColumn("percentage", F.round((F.col("mentions") / total_mentions) * 100, 2)) \
    .orderBy(F.desc("mentions")) \
    .limit(20)
save_to_db(top_artists, "top_20_artists")

# 2. Top 20 canciones
top_tracks = tracks.groupBy("track_name") \
    .agg(F.count("*").alias("mentions")) \
    .withColumn("percentage", F.round((F.col("mentions") / total_mentions) * 100, 2)) \
    .orderBy(F.desc("mentions")) \
    .limit(20)
save_to_db(top_tracks, "top_20_tracks")

# 3. Top 20 álbumes
top_albums = albums.groupBy("album_name") \
    .agg(F.count("*").alias("mentions")) \
    .withColumn("percentage", F.round((F.col("mentions") / total_mentions) * 100, 2)) \
    .orderBy(F.desc("mentions")) \
    .limit(20)
save_to_db(top_albums, "top_20_albums")

# ==========================
# ANÁLISIS 4: USUARIOS COMPARTEN ARTISTA #1
# ==========================

print("=== Análisis 4: Artista principal por usuario ===")

user_top_artist = artists.filter(F.col("rank") == 1) \
    .groupBy("artist_name") \
    .agg(F.count("*").alias("frequency")) \
    .withColumnRenamed("artist_name", "top_artist") \
    .orderBy(F.desc("frequency"))

# Guardar la lista completa de artistas con sus frecuencias
save_to_db(user_top_artist, "users_share_top_artist")

# ==========================
# ANÁLISIS 5: DISTRIBUCIÓN DE MENCIONES POR ARTISTA
# ==========================

print("=== Análisis 5: Distribución menciones artistas ===")

artist_mentions = artists.groupBy("artist_name") \
    .agg(F.count("*").alias("mentions"))

stats = artist_mentions.select(
    F.mean("mentions").alias("mean"),
    F.expr("percentile_approx(mentions, 0.5)").alias("median"),
    F.stddev("mentions").alias("stddev")
)

save_to_db(stats, "artist_mentions_distribution")

# ==========================
# ANÁLISIS 6: LONG TAIL (80% DE MENCIONES)
# ==========================

print("=== Análisis 6: Long tail ===")

artist_mentions_ordered = artist_mentions.orderBy(F.desc("mentions"))
window_spec = Window.orderBy(F.desc("mentions"))
artist_cumulative = artist_mentions_ordered.withColumn(
    "cumulative_mentions", F.sum("mentions").over(window_spec)
)

total_mentions_val = artist_mentions.agg(F.sum("mentions")).first()[0]
threshold = total_mentions_val * 0.8

artists_80_percent = artist_cumulative.filter(F.col("cumulative_mentions") <= threshold).count()
total_artists = artist_mentions.count()
percentage_artists = (artists_80_percent / total_artists) * 100

long_tail_result = spark.createDataFrame([(
    float(percentage_artists),
    artists_80_percent,
    total_artists
)], ["percentage_artists", "artists_count", "total_artists"])

save_to_db(long_tail_result, "long_tail_analysis")

# ==========================
# ANÁLISIS 7: ÍTEMS POR USUARIO
# ==========================

print("=== Análisis 7: Ítems por usuario ===")

artists_per_user = artists.groupBy("user_id").agg(F.count("*").alias("artist_count"))
tracks_per_user = tracks.groupBy("user_id").agg(F.count("*").alias("track_count"))
albums_per_user = albums.groupBy("user_id").agg(F.count("*").alias("album_count"))

user_stats = artists_per_user.join(tracks_per_user, "user_id", "outer") \
    .join(albums_per_user, "user_id", "outer") \
    .fillna(0)

items_stats = user_stats.select(
    F.mean("artist_count").alias("mean_artists_per_user"),
    F.expr("percentile_approx(artist_count, 0.5)").alias("median_artists_per_user"),
    F.mean("track_count").alias("mean_tracks_per_user"),
    F.expr("percentile_approx(track_count, 0.5)").alias("median_tracks_per_user"),
    F.mean("album_count").alias("mean_albums_per_user"),
    F.expr("percentile_approx(album_count, 0.5)").alias("median_albums_per_user")
)

save_to_db(items_stats, "items_per_user_stats")

# ==========================
# ANÁLISIS 8: ARTISTAS, CANCIONES, ÁLBUMES ÚNICOS
# ==========================

print("=== Análisis 8: Conteos únicos ===")

unique_counts = spark.createDataFrame([(
    artists.select("artist_name").distinct().count(),
    tracks.select("track_name").distinct().count(),
    albums.select("album_name").distinct().count()
)], ["unique_artists", "unique_tracks", "unique_albums"])

save_to_db(unique_counts, "unique_items_count")

# ==========================
# ANÁLISIS 9: USUARIOS CON LISTAS TOP-3 IDÉNTICAS
# ==========================

print("=== Análisis 9: Listas top-3 idénticas ===")

user_top3_artists = artists.filter(F.col("rank") <= 3) \
    .groupBy("user_id") \
    .agg(F.concat_ws(",", F.collect_list("artist_name")).alias("top3_artists"))

top3_duplicates = user_top3_artists.groupBy("top3_artists") \
    .agg(F.count("*").alias("user_count")) \
    .filter(F.col("user_count") > 1) \
    .orderBy(F.desc("user_count")) \
    .limit(10)

save_to_db(top3_duplicates, "top3_identical_lists")

# ==========================
# ANÁLISIS 10: USUARIOS CON GUSTOS CONCENTRADOS
# ==========================

print("=== Análisis 10: Gustos concentrados ===")

user_top5 = artists.filter(F.col("rank") <= 5) \
    .groupBy("user_id") \
    .agg(F.countDistinct("artist_name").alias("unique_artists"))

concentrated_users = user_top5.filter(F.col("unique_artists") == 1) \
    .agg(F.count("*").alias("concentrated_users_count"))

save_to_db(concentrated_users, "concentrated_taste_users")

# ==========================
# ANÁLISIS 11: PARES DE ARTISTAS MÁS FRECUENTES
# ==========================

print("=== Análisis 11: Pares de artistas frecuentes ===")

# Obtener artistas por usuario
user_artists = artists.select("user_id", "artist_name").distinct()

# Self join para encontrar pares (esto puede ser pesado, limitamos usuarios)
user_artists_limited = user_artists.limit(100000) if user_artists.count() > 100000 else user_artists

artist_pairs = user_artists_limited.alias("a1").join(
    user_artists_limited.alias("a2"),
    (F.col("a1.user_id") == F.col("a2.user_id")) & 
    (F.col("a1.artist_name") < F.col("a2.artist_name"))
).select(
    F.col("a1.artist_name").alias("artist1"),
    F.col("a2.artist_name").alias("artist2"),
    F.col("a1.user_id")
).groupBy("artist1", "artist2") \
 .agg(F.count("*").alias("cooccurrence_count")) \
 .orderBy(F.desc("cooccurrence_count")) \
 .limit(50)

save_to_db(artist_pairs, "frequent_artist_pairs")

# ==========================
# ANÁLISIS 12: COMBINACIONES DE 3 ARTISTAS FRECUENTES
# ==========================

print("=== Análisis 12: Tripletas de artistas ===")

# Para evitar sobrecarga, trabajamos con usuarios que tienen al menos 3 artistas
users_with_3_artists = user_artists.groupBy("user_id") \
    .agg(F.count("*").alias("artist_count")) \
    .filter(F.col("artist_count") >= 3) \
    .select("user_id")

user_artists_3 = user_artists.join(users_with_3_artists, "user_id")

# Tomar muestra para no sobrecargar
user_artists_sample = user_artists_3.limit(50000) if user_artists_3.count() > 50000 else user_artists_3

# Encontrar tripletas (simplificado - top 20)
from itertools import combinations
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

def find_triplets_udf(artist_list):
    if len(artist_list) < 3:
        return []
    artist_list_sorted = sorted(artist_list)
    return [tuple(sorted(combo)) for combo in combinations(artist_list_sorted, 3)]

find_triplets_udf_spark = F.udf(find_triplets_udf, 
    F.ArrayType(F.ArrayType(StringType())))

user_artist_lists = user_artists_sample.groupBy("user_id") \
    .agg(F.collect_list("artist_name").alias("artists"))

triplets_df = user_artist_lists \
    .withColumn("triplets", find_triplets_udf_spark("artists")) \
    .select("user_id", F.explode("triplets").alias("triplet")) \
    .groupBy("triplet") \
    .agg(F.count("*").alias("cooccurrence_count")) \
    .orderBy(F.desc("cooccurrence_count")) \
    .limit(20)

# Convertir array a columnas separadas
triplets_final = triplets_df \
    .withColumn("artist1", F.col("triplet").getItem(0)) \
    .withColumn("artist2", F.col("triplet").getItem(1)) \
    .withColumn("artist3", F.col("triplet").getItem(2)) \
    .select("artist1", "artist2", "artist3", "cooccurrence_count")

save_to_db(triplets_final, "frequent_artist_triplets")

# ==========================
# ANÁLISIS 13: SOLAPAMIENTO ARTISTA-CANCIÓN
# ==========================

print("=== Análisis 13: Solapamiento artista-canción ===")

user_top_artist_df = artists.filter(F.col("rank") == 1) \
    .select("user_id", "artist_name").alias("top_artist")

user_top_track_df = tracks.filter(F.col("rank") == 1) \
    .select("user_id", "artist_name").alias("top_track")

overlap = user_top_artist_df.join(
    user_top_track_df,
    (F.col("top_artist.user_id") == F.col("top_track.user_id")) &
    (F.col("top_artist.artist_name") == F.col("top_track.artist_name"))
).agg(F.count("*").alias("overlap_count"))

total_users = users.count()
overlap_percentage = overlap.withColumn(
    "overlap_percentage", 
    F.round((F.col("overlap_count") / total_users) * 100, 2)
)

save_to_db(overlap_percentage, "artist_track_overlap")

# ==========================
# ANÁLISIS 14: POSICIÓN PROMEDIO POR ARTISTA
# ==========================

print("=== Análisis 14: Posición promedio por artista ===")

avg_position_by_artist = artists.groupBy("artist_name") \
    .agg(F.mean("rank").alias("avg_rank")) \
    .orderBy("avg_rank") \
    .limit(50)

save_to_db(avg_position_by_artist, "avg_artist_position")

# ==========================
# ANÁLISIS 15: FRECUENCIA DE QUE EL #1 ESTÉ EN TOP 5 GLOBAL
# ==========================

print("=== Análisis 15: #1 en top 5 global ===")

# Top 5 artistas globales
top_5_global = artists.groupBy("artist_name") \
    .agg(F.count("*").alias("mentions")) \
    .orderBy(F.desc("mentions")) \
    .limit(5) \
    .select("artist_name") \
    .rdd.flatMap(lambda x: x).collect()

top_5_global_broadcast = spark.sparkContext.broadcast(top_5_global)

def is_in_top5(artist_name):
    return artist_name in top_5_global_broadcast.value

is_in_top5_udf = F.udf(is_in_top5)

users_top1_in_global_top5 = artists.filter(F.col("rank") == 1) \
    .withColumn("in_top5_global", is_in_top5_udf("artist_name")) \
    .filter(F.col("in_top5_global") == True) \
    .count()

percentage_top1_in_top5 = (users_top1_in_global_top5 / total_users) * 100

top1_in_top5_result = spark.createDataFrame([(
    float(percentage_top1_in_top5),
    users_top1_in_global_top5,
    total_users
)], ["percentage", "matching_users", "total_users"])

save_to_db(top1_in_top5_result, "top1_in_global_top5")

# ==========================
# ANÁLISIS 16: ESTABILIDAD DE POSICIONES
# ==========================

print("=== Análisis 16: Estabilidad de posiciones ===")

user_top2_artists = artists.filter(F.col("rank") <= 2) \
    .groupBy("user_id") \
    .agg(F.countDistinct("artist_name").alias("unique_artists"))

stable_users = user_top2_artists.filter(F.col("unique_artists") == 1) \
    .agg(F.count("*").alias("stable_users_count"))

save_to_db(stable_users, "position_stability")

# ==========================
# ANÁLISIS 18: TOP ARTISTAS ENTRE OYENTES ACTIVOS
# ==========================

print("=== Análisis 18: Oyentes activos ===")

# Usuarios con más de 40 canciones
active_listeners = tracks.groupBy("user_id") \
    .agg(F.count("*").alias("track_count")) \
    .filter(F.col("track_count") > 40) \
    .select("user_id")

top_artists_active = artists.join(active_listeners, "user_id") \
    .filter(F.col("rank") == 1) \
    .groupBy("artist_name") \
    .agg(F.count("*").alias("listener_count")) \
    .orderBy(F.desc("listener_count")) \
    .limit(20)

save_to_db(top_artists_active, "top_artists_active_listeners")

# ==========================
# ANÁLISIS 19: POPULARIDAD CRUZADA ENTRE LISTAS
# ==========================

print("=== Análisis 19: Popularidad cruzada ===")

artist_popularity = artists.groupBy("artist_name") \
    .agg(F.count("*").alias("artist_list_count"))

track_artist_popularity = tracks.groupBy("artist_name") \
    .agg(F.count("*").alias("track_list_count"))

cross_popularity = artist_popularity.join(track_artist_popularity, "artist_name", "outer") \
    .fillna(0) \
    .withColumn("difference", F.col("track_list_count") - F.col("artist_list_count")) \
    .orderBy(F.desc(F.abs("difference"))) \
    .limit(30)

save_to_db(cross_popularity, "cross_popularity")

# ==========================
# ANÁLISIS 20: ARTISTAS MÁS DIVERSOS
# ==========================

print("=== Análisis 20: Artistas diversos ===")

unique_users_per_artist = artists.groupBy("artist_name") \
    .agg(F.countDistinct("user_id").alias("unique_users"))

unique_tracks_per_artist = tracks.groupBy("artist_name") \
    .agg(F.countDistinct("track_name").alias("unique_tracks"))

artist_diversity = unique_users_per_artist.join(
    unique_tracks_per_artist, "artist_name", "outer"
).fillna(0).orderBy(F.desc("unique_users")).limit(50)

save_to_db(artist_diversity, "artist_diversity")

# ==========================
# ANÁLISIS 21: DATOS FALTANTES
# ==========================

print("=== Análisis 21: Datos faltantes ===")

# Contar usuarios con datos faltantes del archivo users_nulos.parquet
users_with_missing_data = users.select("user_id").distinct()
missing_count = users_with_missing_data.agg(
    F.count("*").alias("users_with_missing_data")
)

print(f"Total de usuarios con datos faltantes: {missing_count.collect()[0]['users_with_missing_data']}")
save_to_db(missing_count, "missing_data_count")
spark.stop()

# ==========================
# ANÁLISIS 22: USUARIOS ATÍPICOS
# ==========================

print("=== Análisis 22: Usuarios atípicos ===")

user_artist_counts = artists.groupBy("user_id").agg(F.count("*").alias("artist_count"))
user_track_counts = tracks.groupBy("user_id").agg(F.count("*").alias("track_count"))

# Combinar conteos
user_activity = user_artist_counts.join(user_track_counts, "user_id", "outer").fillna(0)
user_activity = user_activity.withColumn("total_items", F.col("artist_count") + F.col("track_count"))

# Calcular percentiles
percentiles = user_activity.approxQuantile("total_items", [0.01, 0.99], 0.1)
p1 = percentiles[0]  # Percentil 1
p99 = percentiles[1] # Percentil 99

high_activity_users = user_activity.filter(F.col("total_items") >= p99).count()
low_activity_users = user_activity.filter(F.col("total_items") <= p1).count()

atypical_users = spark.createDataFrame([(
    high_activity_users,
    low_activity_users,
    float(p1),
    float(p99)
)], ["high_activity_users", "low_activity_users", "percentile_1", "percentile_99"])

save_to_db(atypical_users, "atypical_users")

# ==========================
# ANÁLISIS 23: ARTISTAS DE BAJA COBERTURA
# ==========================

print("=== Análisis 23: Artistas baja cobertura ===")

low_coverage_artists = artist_mentions.filter(F.col("mentions") < 5) \
    .agg(F.count("*").alias("low_coverage_artists_count"))

save_to_db(low_coverage_artists, "low_coverage_artists")

print("=" * 50)
print("🎉 TODOS LOS 23 ANÁLISIS COMPLETADOS EXITOSAMENTE!")
print("=" * 50)

spark.stop()