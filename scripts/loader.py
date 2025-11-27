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

    # Separar filas con valores nulos
    df_nulos = df[df.isnull().any(axis=1)]
    df = df.dropna()

    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].astype(str).str.strip()

    print("Filas después de limpieza:", len(df))
    print("Filas con valores nulos:", len(df_nulos))

    # Guardar como Parquet
    parquet_name = file.replace(".csv", ".parquet")
    table = Table.from_pandas(df)
    pq.write_table(table, parquet_name)

    # Guardar filas nulas en archivo separado si existen
    if len(df_nulos) > 0:
        parquet_nulos_name = file.replace(".csv", "_nulos.parquet")
        table_nulos = Table.from_pandas(df_nulos)
        pq.write_table(table_nulos, parquet_nulos_name)
        print(f"Guardadas {len(df_nulos)} filas nulas en {parquet_nulos_name}")

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

    # Subir archivo de nulos a HDFS si existe
    if len(df_nulos) > 0:
        parquet_nulos_name = file.replace(".csv", "_nulos.parquet")
        subprocess.run([
            "docker", "exec", "hadoop-namenode",
            "hdfs", "dfs", "-rm", "-f", f"/music/{parquet_nulos_name}"
        ])
        subprocess.run([
            "docker", "exec", "-i", "hadoop-namenode",
            "hdfs", "dfs", "-put", "-", f"/music/{parquet_nulos_name}"
        ], input=open(parquet_nulos_name, "rb").read())
        print(f"Subido a HDFS: /music/{parquet_nulos_name}")

print("\n=== LOADER COMPLETADO ===")
print("Archivos disponibles en HDFS: /music/")
