from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from ..schemas import user
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta

ALGORITHM = "HS256"
ACCESS_TOKEN_DURATION = 15
SECRET = "gwtfdtdgjiemlopckj98763tgcuebcdsshgdywxbg65423324r"

router = APIRouter()

oauth2 = OAuth2PasswordBearer(tokenUrl="login")

crypt_context = CryptContext(schemes=["bcrypt"]) #algoritmo de criptografia

users_db = {"lauu_grego": {"username": "lauu_grego",
                                     "email":"lautarogrego@gmail.com",
                                      "disable": False,
                                       "password": "$2a$12$2Z2uusv9JV6Go6j2vc6jFOzcEExp4KKXRHoYaKJE9Qk2Kc7gP6HDu",
                                        "id": 1,
                                        "role": "admin"  },  
            } #base de datos

def search_user_db(username:str):
    if username in users_db:
        return user.User(**users_db[username])

def search_user(username:str):
    if username in users_db:
        return user.UserBase(**users_db[username])

async def auth_user(token: str = Depends(oauth2)):
   
    exception = HTTPException(status_code=401, 
                            detail="Credenciales de autenticacion invalidas", 
                            headers={"WWW-Authenticate": "Bearer"})

    try:
        username = jwt.decode(token,SECRET, algorithms=[ALGORITHM]).get("sub")
        if username is None:
           raise exception
 
    except JWTError:
        raise exception
    
    return search_user(username)

async def current_user(user : user.User = Depends(auth_user)):
    
    try:
        if user.disable:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Usuario inactivo")
        return user
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="No Registrado")
    

@router.post("/usuarios/login")
async def login(form:OAuth2PasswordRequestForm = Depends()):
    user_db = users_db.get(form.username)
    if not user_db:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "Usuario Incorrecto")
    
    user = search_user_db(form.username)

    if not crypt_context.verify(form.password,user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "Contraseña Incorrecta")

    access_token = {"sub":user.username,
                    "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_DURATION)}

    return {"acces_token": jwt.encode(access_token, SECRET, algorithm=ALGORITHM) ,"token_type": "JWT"}

@router.get("/usuarios/yo")
async def me(user: user.UserBase = Depends(current_user)): 
    return user

async def admin_only(user: user.User = Depends(current_user)):
    try:
        if user.role != "admin":
            raise HTTPException(
                status_code=403,
                detail="Acceso denegado: Se requieren permisos de administrador"
            )
        return user
    except Exception:
      return "algo pasa" 
      
      """  raise HTTPException(status_code=401, 
                            detail="Debes Autenticarte para realizar esto")"""