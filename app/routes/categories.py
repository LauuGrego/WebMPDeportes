from fastapi import APIRouter, HTTPException
from schemas.category import Category, CategoryBase, CategoryCreate


router = APIRouter(prefix="/categorias")

categories_db = []

next_id = 1  

@router.post("/agregar_categoria")
async def create_category(category: CategoryCreate):
    global next_id
    
    new_category = Category(id=next_id, **category.model_dump())
    categories_db.append(new_category)
    next_id += 1  
    return new_category


@router.get("/ver_categorias")
async def list_categories():
    
    return  [CategoryBase(**category.dict()) for category in categories_db]
        

@router.delete("/eliminar_categoria/{category_name}")
async def delete_category_by_name(category_name: str):
    
    for category in categories_db:
        if category.name == category_name:
            categories_db.remove(category)
            return {"detail": f"La categoría '{category_name}' fue eliminada con éxito"}
    raise HTTPException(status_code=404, detail="Categoría no encontrada")

@router.delete("/eliminar_categoria/{category_id}")
async def delete_category_by_id(category_id: int):
    for category in categories_db:
        if category.id == category_id:
            categories_db.remove(category)
            return {"detail": f"La categoría con ID {category_id} fue eliminada con éxito"}
    raise HTTPException(status_code=404, detail="Categoría no encontrada")
