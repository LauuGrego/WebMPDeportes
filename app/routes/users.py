from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User, UserBase, UserCreate
from passlib.context import CryptContext
from pymongo import ReturnDocument
from app.db.client import db_client
from app.routes.users_JWT_auth import admin_only, current_user, search_user
from bson import ObjectId

router = APIRouter(prefix="/usuarios")

# Conexión a la colección de usuarios
users_collection = db_client.users

# Registrar Usuario
@router.post("/registrar", status_code=201)
async def register_user(user: UserCreate):
    context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")

    hashed_password = context.hash(user.password)

    user_data = {
        "username": user.username,
        "email": user.email,
        "disable": False,
        "password": hashed_password,
        "role": user.role,
    }
    result = users_collection.insert_one(user_data)

    return {"msg": "Usuario registrado con éxito", "user_id": str(result.inserted_id)}



@router.get("/listar", response_model=list[UserBase])
async def list_users(admin: User = Depends(admin_only)): 
    users_cursor = users_collection.find()
    users = [UserBase(**user).model_dump() for user in users_cursor]
    return users


#buscar usuario por nombre
@router.get("/buscar/{username}", response_model=UserBase)
async def search_user_by_username(username: str, admin: User = Depends(admin_only)): 
    user = search_user("username", username)
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


# Actualizar Usuario
@router.put("/actualizar/{username}")
async def update_user(username: str, user_update: UserBase, admin: User = Depends(admin_only)):  
    update_data = user_update.model_dump(exclude_unset=True)
    forbidden_fields = {"password", "id"}
    for field in forbidden_fields:
        update_data.pop(field, None)

    updated_user = users_collection.find_one_and_update(
        {"username": username},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER
    )

    if not updated_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"msg": "Usuario actualizado con éxito"}

@router.put("/actualizar_perfil")
async def update_own_user(user_update: UserBase, current: User = Depends(current_user)):
    update_data = user_update.model_dump(exclude_unset=True)
    forbidden_fields = {"role", "id", "disable"}
    for field in forbidden_fields:
        update_data.pop(field, None)

    updated_user = users_collection.find_one_and_update(
        {"username": current.username},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER
    )

    if not updated_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"msg": "Tu perfil ha sido actualizado con éxito"}

# Deshabilitar Usuario
@router.put("/deshabilitar_usuario/{username}")
async def disable_user(username: str, admin: User = Depends(admin_only)): 
    result = users_collection.update_one({"username": username}, {"$set": {"disable": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"message": f"El usuario '{username}' ha sido deshabilitado exitosamente"}

# Habilitar Usuario
@router.put("/habilitar_usuario/{username}")
async def enable_user(username: str, admin: User = Depends(admin_only)): 
    result = users_collection.update_one({"username": username}, {"$set": {"disable": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"message": f"El usuario '{username}' ha sido habilitado exitosamente"}

# Eliminar usuario
@router.delete("/eliminar/{user_id}")
async def delete_product_by_id(user_id: str, admin: User = Depends(admin_only)):
    result = users_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")

    return {"message": "Producto eliminado con éxito."}
