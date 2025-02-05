from fastapi import FastAPI
from routes import products, users, categories, users_JWT_auth, cart


app = FastAPI()

#statics
#app.mount()

app.include_router(products.router)

app.include_router(categories.router)

app.include_router(users.router)

app.include_router(users_JWT_auth.router)

app.include_router(cart.router)


#uvicorn app.main:app --reload