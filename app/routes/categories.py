from fastapi import APIRouter, HTTPException,Depends
from ..schemas.category import Category, CategoryBase, CategoryCreate
from .users_JWT_auth import admin_only
from ..schemas.user import User



router = APIRouter(prefix="/categorias")

categories_db = []

next_id = len(categories_db) + 1 

@router.post("/agregar")
async def create_category(category: CategoryCreate, admin: User = Depends(admin_only)):
    global next_id
    
    category.name = category.name.title().strip()
    
    if any(cat.name == category.name for cat in categories_db):
        raise HTTPException(status_code=400, detail="La categoría ya existe.")
    
    new_category = Category(id=next_id, **category.model_dump())
    categories_db.append(new_category)
    next_id += 1  
    return new_category


@router.get("/listar")
async def list_categories():
    
    return  [Category(**category.model_dump()) for category in categories_db]
        

@router.delete("/eliminar/{category_name}")
async def delete_category_by_name(category_name: str, admin: User = Depends(admin_only)):
    
    for category in categories_db:
        if category.name.title().strip() == category_name.title().strip():
            categories_db.remove(category)
            return {"detail": f"La categoría '{category_name.title().strip()}' fue eliminada con éxito"}
    raise HTTPException(status_code=404, detail="Categoría no encontrada")

@router.get("/buscar/{category_name}")
async def search_categories_by_name(category_name: str):

    category_name = category_name.title().strip()
    
    matching_categories = [
        Category(**category.model_dump()) 
        for category in categories_db 
        if category_name in category.name.capitalize()
    ]
    
    # Si no se encuentran coincidencias, lanzar una excepción
    if not matching_categories:
        raise HTTPException(status_code=404, detail="No se encontraron categorías que coincidan con la búsqueda.")
    
    return matching_categories

