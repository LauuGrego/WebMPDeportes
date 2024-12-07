from fastapi import FastAPI
from .routes import products
from .database import engine, Base
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Cambia esto a la URL del frontend en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)  # Crear tablas

app.include_router(products.router)
@app.get("/")
async def  bienvenida ():
    return {"message": "Bienvenido a la Web de Concepción Relojes"}