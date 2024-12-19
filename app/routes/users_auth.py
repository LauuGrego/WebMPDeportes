"""from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from schemas import user
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm


router = APIRouter()

oauth2 = OAuth2PasswordBearer(tokenUrl="login")

users_db = {"lauu_grego": {"username": "lauu_grego",
                                     "email":"lautarogrego@gmail.com",
                                      "disable": False,
                                       "password": "121103",
                                        "id": 1 }
            } #base de datos

def search_user_db(username:str):
    if username in users_db:
        return user.User(**users_db[username])

def search_user(username:str):
    if username in users_db:
        return user.UserBase(**users_db[username])

async def  current_user(token: str = Depends(oauth2)):
    user = search_user(token) #el token coincide con el usuario en la base de datos
    if not user:
        raise HTTPException(status_code=401, 
                            detail="Credenciales de autenticacion invalidas", 
                            headers={"WWW-Authenticate": "Bearer"})
    if user.disable:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Usuario inactivo")
    return user

@router.post("/login")
async def login(form:OAuth2PasswordRequestForm = Depends()):
    user_db = users_db.get(form.username)
    if not user_db:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "Usuario Incorrecto")
    
    user = search_user_db(form.username)
    if not form.password == user.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "Contraseña Incorrecta")
    
    return {"acces_token": user.username ,"token_type": "bearer"}

@router.get("/users/me")
async def me(user: user.UserBase = Depends(current_user)): #depende de que el usuario este autenticado
    return user"""