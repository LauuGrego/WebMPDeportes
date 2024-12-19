from fastapi import FastAPI
from routes import products, users, users_auth,categories, users_JWT_auth


app = FastAPI()

#statics
#app.mount()

app.include_router(products.router)
@app.get("/")
async def  bienvenida ():
    return {"message": "Bienvenido a la Web de Concepción Relojes"}

app.include_router(categories.router)

"""app.include_router(users.router)"""

"""app.include_router(users_auth.router)"""

app.include_router(users_JWT_auth.router)