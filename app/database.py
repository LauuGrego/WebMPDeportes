import pyodbc

# Configura la conexión
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};' 
    'SERVER=DESKTOP-5B1MMN8;'  # Cambia "localhost" al nombre de tu servido
    'DATABASE=WebProductos;'  # Cambia "nombre_de_tu_base_de_datos" por la base que usarás
    'UID=LautaroGrego;'  # Usuario de SQL Server
    'PWD=121103grego;'  # Contraseña de SQL Server
)

# Crea un cursor para ejecutar consultas
cursor = conn.cursor()

# Prueba una consulta
cursor.execute("SELECT * FROM TuTabla")
for row in cursor:
    print(row)

# Cierra la conexión
conn.close()
