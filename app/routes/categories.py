from fastapi import APIRouter, HTTPException,Depends
from ..schemas.category import Category, CategoryBase, CategoryCreate
from .users_JWT_auth import admin_only
from ..schemas.user import User



router = APIRouter(prefix="/categorias")

categories_db = []

next_id = 1  

@router.post("/agregar")
async def create_category(category: CategoryCreate, admin: User = Depends(admin_only)):
    global next_id
    
    new_category = Category(id=next_id, **category.model_dump())
    categories_db.append(new_category)
    next_id += 1  
    return new_category


@router.get("/listar")
async def list_categories():
    
    return  [CategoryBase(**category.dict()) for category in categories_db]
        

@router.delete("/eliminar/{category_name}")
async def delete_category_by_name(category_name: str, admin: User = Depends(admin_only)):
    
    for category in categories_db:
        if category.name == category_name:
            categories_db.remove(category)
            return {"detail": f"La categoría '{category_name}' fue eliminada con éxito"}
    raise HTTPException(status_code=404, detail="Categoría no encontrada")

@router.delete("/eliminar/{category_id}")
async def delete_category_by_id(category_id: int, admin: User = Depends(admin_only)):
    for category in categories_db:
        if category.id == category_id:
            categories_db.remove(category)
            return {"detail": f"La categoría con ID {category_id} fue eliminada con éxito"}
    raise HTTPException(status_code=404, detail="Categoría no encontrada")
