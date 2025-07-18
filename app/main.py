from fastapi import FastAPI
from app.routes import products, users, categories, users_JWT_auth, cart
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import cloudinary

app = FastAPI()

# Configuración de Cloudinary
cloudinary.config(
    cloud_name="dotxvd5dc",
    api_key="494187312773391",
    api_secret="dxD8oLE73v6EYbyPT9yGfyhD5sE"
)

"""origins = ["http://127.0.0.1:5500",  # Aquí se especifica la URL de tu frontend
            "http://localhost:5500",
            "https://marcapasosdeportes.netlify.app/"
]"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas las fuentes
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP
    allow_headers=["*"],  # Permite todos los encabezados
)

#statics
#app.mount()

app.include_router(products.router)

app.include_router(categories.router)

app.include_router(users.router)

app.include_router(users_JWT_auth.router)

app.include_router(cart.router)

@app.head("/monitor")
async def monitor():
    return {"status": "ok"}


