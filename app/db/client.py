from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://lautaro_grego:Grego.121103@marcapasosdeportes.p9vbo.mongodb.net/?retryWrites=true&w=majority&appName=MarcaPasosDeportes"

# Create a new client and connect to the server
#db_client = MongoClient(uri, server_api=ServerApi('1')).MarcaPasosDeportes

db_client = MongoClient().local


