from fastapi import FastAPI
from .routes import products
from .database import engine, Base

app = FastAPI()

Base.metadata.create_all(bind=engine)  # Crear tablas

app.include_router(products.router)
@app.get("/")
async def  bienvenida ():
    return {"message": "Bienvenido a la Web de Concepción Relojes"}