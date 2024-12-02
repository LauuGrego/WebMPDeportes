from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import get_db
from fastapi import HTTPException
from typing import List, Optional


router = APIRouter()

"""#OBTENER PRODUCTOS
@router.get("/productos", response_model=list[schemas.Product])
async def read_products(db: Session = Depends(get_db)):
    return crud.get_products(db)
"""
#AGREGAR PRODUCTOS
@router.post("/agregar_producto", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, product)

#ACTUALIZAR PRODUCTOS
@router.put("/actualizar_producto/{product_id}", response_model=schemas.Product)
async def modify_product(product_id: int, updated_product: schemas.Product, db: Session = Depends(get_db)):

    db_product = crud.get_product_by_id(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db_product.name = updated_product.name
    db_product.price = updated_product.price
    db_product.type = updated_product.type
    db_product.description = updated_product.description
    db_product.stock = updated_product.stock
    image_url=updated_product.image_url  
    
    db.commit()
    db.refresh(db_product)
    return db_product

#DESHABILITAR PRODUCTOS
@router.put("/deshabilitar_producto/{product_id}", response_model=schemas.Product)
async def disable_product(product_id: int, db: Session = Depends(get_db)):

    db_product = crud.get_product_by_id(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail= "Producto no encontrado")

    db_product.stock = 0
    
    db.commit()
    db.refresh(db_product)
    return db_product


#BUSQUEDA DE PRODUCTOS POR FILTRO
PRICE_RANGES = {
    "low": (0, 20000),       # Rango económico
    "medium": (20001, 40000),  # Rango medio
    "high": (40001, 60000),   # Rango alto
    "premium": (60001, 80000),  # Rango premium
    "luxury": (80001, 100000)   # Rango de lujo
}

@router.get("/filtrar_busqueda", response_model=List[schemas.Product])
async def filter_products(
    name: Optional[str] = None,
    price_range: Optional[str] = None,  # Nuevo parámetro para rango de precios
    type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Product)

    if name:
        query = query.filter(models.Product.name.ilike(f"%{name}%"))
    if type:
        query = query.filter(models.Product.type.ilike(f"%{type}%"))
    if price_range and price_range in PRICE_RANGES:
        min_price, max_price = PRICE_RANGES[price_range]
        query = query.filter(models.Product.price >= min_price, models.Product.price <= max_price)

    return query.all()
