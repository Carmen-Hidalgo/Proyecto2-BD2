import pandas as pd
from pyarrow import parquet as pq
from pyarrow import Table
import subprocess
import os
import glob

INPUT_FILES = [
    "users.csv",
    "user_top_artists.csv",
    "user_top_tracks.csv",
    "user_top_albums.csv"
]

print("=== LOADER: Iniciando ===")

# Crear carpeta en HDFS (si no existe)
subprocess.run([
    "docker", "exec", "hadoop-namenode",
    "hdfs", "dfs", "-mkdir", "-p", "/music"
])

for file in INPUT_FILES:
    print(f"\nProcesando archivo: {file}")

    # Leer CSV
    df = pd.read_csv(file)
    print("Filas originales:", len(df))

    # Normalizar nombres de columnas
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

    df = df.dropna()

    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].astype(str).str.strip()

    print("Filas después de limpieza:", len(df))

    # Guardar como Parquet
    parquet_name = file.replace(".csv", ".parquet")
    table = Table.from_pandas(df)
    pq.write_table(table, parquet_name)

    print(f"Subiendo a HDFS como /music/{parquet_name} ...")

    # Borrar archivo previo en HDFS
    subprocess.run([
        "docker", "exec", "hadoop-namenode",
        "hdfs", "dfs", "-rm", "-f", f"/music/{parquet_name}"
    ])

    # Subir archivo nuevo
    subprocess.run([
        "docker", "exec", "-i", "hadoop-namenode",
        "hdfs", "dfs", "-put", "-", f"/music/{parquet_name}"
    ], input=open(parquet_name, "rb").read())

print("\n=== LOADER COMPLETADO ===")
print("Archivos disponibles en HDFS: /music/")
