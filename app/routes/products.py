from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from ..schemas.product import Product, ProductCreate, ProductBase
from .categories import categories_db
from .users_JWT_auth import admin_only
from ..schemas.user import User

router = APIRouter(prefix="/productos")


products_db = []

# Obtener producto por ID
def get_product_by_id(product_id: int):
    for product in products_db:
        if product.id == product_id:
            return product
    return None

next_product_id = 1 

# Agregar productos
@router.post("/agregar", response_model=Product)
async def create_product(product_data: ProductCreate, admin: User = Depends(admin_only)):
    global next_product_id

    product_data.name = product_data.name.strip().title()
    product_data.category_name = product_data.category_name.strip().title()
    product_data.type = product_data.type.strip().title()

    category = next((cat for cat in categories_db if cat.name.strip().title() == product_data.category_name.strip().title()), None)
    if not category:
        raise HTTPException(status_code=404, detail=f"La categoría '{product_data.category_name}' no existe")

    product_dict = product_data.model_dump()
    product_dict.pop("category_name") 
    product_dict["category_id"] = category.id  

    new_product = Product(id=next_product_id, **product_dict)
    products_db.append(new_product)
    next_product_id += 1

    return new_product


# Actualizar productos
@router.put("/actualizar/{product_id}", response_model=Product)
async def modify_product(product_id: int, updated_product: ProductCreate, admin: User = Depends(admin_only)):


    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    updated_product.name = updated_product.name.strip().title()

    category_names = [category.name for category in categories_db]
    if updated_product.category_name not in category_names:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    updated_product.category_name = updated_product.category_name.strip().title()
    updated_product.type = updated_product.type.strip().title()

    update_data = updated_product.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "id":
            continue 
        setattr(db_product, field, value)

    return db_product


# Deshabilitar productos
@router.put("/deshabilitar/{product_id}", response_model=Product)
async def disable_product(product_id: int,admin: User = Depends(admin_only)):
    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db_product.stock = 0
    return db_product


# Buscar productos por filtro
PRICE_RANGES = {
    "low": (0, 20000),        # Rango económico
    "medium": (20001, 40000), # Rango medio
    "high": (40001, 60000),   # Rango alto
    "premium": (60001, 80000),# Rango premium
    "luxury": (80001, 100000) # Rango de lujo
}

@router.get("/filtrar_busqueda", response_model=List[Product])
async def filter_products(
    name: Optional[str] = None,
    price_range: Optional[str] = None,  
    type: Optional[str] = None,
):
    results = products_db  

    if name.trip().title():
        results = [product for product in results if name.lower() in product.name.lower()]
    if type.trip().title():
        results = [product for product in results if type.lower() in product.type.lower()]
    if price_range and price_range in PRICE_RANGES:
        min_price, max_price = PRICE_RANGES[price_range]
        results = [product for product in results if min_price <= product.price <= max_price]

    return [ProductBase(**product.dict()) for product in results]

@router.delete("/eliminar/{idProduct}")
async def delete_product_by_id(idProduct: int,admin: User = Depends(admin_only)):
    
    product = get_product_by_id(idProduct)
    
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    products_db.remove(product)
    return {"message": "Producto eliminado con éxito"}

