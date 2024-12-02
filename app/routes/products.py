from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import get_db

router = APIRouter()

@router.get("/products", response_model=list[schemas.Product])
def read_products(db: Session = Depends(get_db)):
    return crud.get_products(db)

@router.post("/products", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, product)
