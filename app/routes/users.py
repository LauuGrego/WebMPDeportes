from fastapi import APIRouter, Depends
from ..schemas.user import User, UserBase, UserCreate
from fastapi import HTTPException
from typing import List, Optional
from .users_JWT_auth import users_db, admin_only, current_user
from passlib.context import CryptContext


router = APIRouter(prefix="/usuarios")

def get_users_by_id(user_id: int):
    for user in users_db:
        if user.id == user_id:
            return user
    return None

#Registar Usuario
@router.post("/registrar", status_code=201)
async def register_user(user: UserCreate):
    
    context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    if user.username in users_db:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")

    hashed_password = context.hash(user.password)
    
    user_id = len(users_db) + 1  # Genera un ID incremental 
    
    users_db[user.username] = {
        "username": user.username,
        "email": user.email,
        "disable": False,
        "password": hashed_password,
        "role": user.role,
        "id": user_id,
    }
    return {"msg": "Usuario registrado con éxito"}

# Listar Usuarios
@router.get("/listado", response_model=list[UserBase])
async def list_users():
    return [UserBase(**data) for data in users_db.values()]

# Actualizar Usuario
@router.put("/actualizar/{username}")
async def update_user(username: str, user_update: UserBase, admin: User = Depends(admin_only)):
    if username not in users_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = user_update.model_dump(exclude_unset=True)
    forbidden_fields = {"password", "id"}
    for field in forbidden_fields:
        update_data.pop(field, None)

    users_db[username].update(user_update.model_dump(exclude_unset=True))
    return {"msg": "Usuario actualizado con éxito"}

@router.put("/actualizar_perfil")
async def update_own_user(user_update: UserBase, current: User = Depends(current_user)):
   
    if current.username not in users_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = user_update.model_dump(exclude_unset=True)
    forbidden_fields = {"role", "id", "disable"}
    for field in forbidden_fields:
        update_data.pop(field, None)

    users_db[current.username].update(update_data)
    return {"msg": "Tu perfil ha sido actualizado con éxito"}


# Deshabilitar Usuario
@router.put("/deshabilitar_usuario/{username}")
async def disable_user(username: str, admin: User = Depends(admin_only)):

    user_db = users_db.get(username)
    if not user_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user_db["disable"] = True
    return {"message": f"El usuario '{username}' ha sido deshabilitado exitosamente"}

#Habilitar Usuario
@router.put("/habilitar_usuario/{username}")
async def enable_user(username: str, admin: User = Depends(admin_only)):
 
    user_db = users_db.get(username)
    if not user_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")


    user_db["disable"] = False
    return {"message": f"El usuario '{username}' ha sido habilitado exitosamente"}

