from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import get_db
from fastapi import HTTPException


router = APIRouter()

@router.get("/productos", response_model=list[schemas.Product])
async def read_products(db: Session = Depends(get_db)):
    return crud.get_products(db)

@router.post("/agregar_producto", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, product)

@router.put("/modificar_producto/{product_id}", response_model=schemas.Product)
async def modify_product(product_id: int, updated_product: schemas.Product, db: Session = Depends(get_db)):

    db_product = crud.get_product_by_id(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db_product.name = updated_product.name
    db_product.price = updated_product.price
    db_product.description = updated_product.description
    db_product.stock = updated_product.stock
    image_url=updated_product.image_url  
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/deshabilitar_producto/{product_id}", response_model=schemas.Product)
async def disable_product(product_id: int, db: Session = Depends(get_db)):

    db_product = crud.get_product_by_id(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail= "Producto no encontrado")

    db_product.stock = 0
    
    db.commit()
    db.refresh(db_product)
    return db_product