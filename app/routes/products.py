from fastapi import APIRouter, HTTPException
from typing import List, Optional
from schemas.product import Product, ProductCreate, ProductBase
from .categories import categories_db

router = APIRouter(prefix="/productos")


products_db = []

# Obtener producto por ID
def get_product_by_id(product_id: int):
    for product in products_db:
        if product.id == product_id:
            return product
    return None

next_id = 1 

# Agregar productos
@router.post("/agregar_producto", response_model=Product)
async def create_product(product_data: ProductCreate):
    global next_product_id

    # Buscar el ID de la categoría
    category = next((cat for cat in categories_db if cat.name.lower() == product_data.category_name.lower()), None)
    if not category:
        raise HTTPException(status_code=404, detail=f"La categoría '{product_data.category_name}' no existe")

    # Crear un diccionario del producto sin el campo 'category_name'
    product_dict = product_data.model_dump()
    product_dict.pop("category_name") 
    product_dict["category_id"] = category.id  

    new_product = Product(id=next_product_id, **product_dict)
    products_db.append(new_product)
    next_product_id += 1

    return new_product


# Actualizar productos
@router.put("/actualizar_producto/{product_id}", response_model=Product)
async def modify_product(product_id: int, updated_product: ProductCreate):
    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")


    db_product.name = updated_product.name
    db_product.price = updated_product.price
    db_product.type = updated_product.type
    db_product.description = updated_product.description
    db_product.stock = updated_product.stock
    db_product.image_url = updated_product.image_url
    return db_product

# Deshabilitar productos
@router.put("/deshabilitar_producto/{product_id}", response_model=Product)
async def disable_product(product_id: int):
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
    price_range: Optional[str] = None,  # Nuevo parámetro para rango de precios
    type: Optional[str] = None,
):
    results = products_db  

    if name:
        results = [product for product in results if name.lower() in product.name.lower()]
    if type:
        results = [product for product in results if type.lower() in product.type.lower()]
    if price_range and price_range in PRICE_RANGES:
        min_price, max_price = PRICE_RANGES[price_range]
        results = [product for product in results if min_price <= product.price <= max_price]

    return [ProductBase(**product.dict()) for product in results]
