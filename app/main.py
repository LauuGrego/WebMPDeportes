<<<<<<< HEAD
from fastapi import FastAPI
from routes import products, users, categories, users_JWT_auth, cart
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#statics
#app.mount()

app.include_router(products.router)

app.include_router(categories.router)

app.include_router(users.router)

app.include_router(users_JWT_auth.router)

app.include_router(cart.router)


=======
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


>>>>>>> fcbb013a6e421ae9310f98ac2227f1e8e347b22f
#uvicorn app.main:app --reload