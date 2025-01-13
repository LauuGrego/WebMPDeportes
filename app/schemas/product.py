from pydantic import BaseModel, Field
from typing import Optional

class ProductBase(BaseModel):
    name: str
    price: float
    type: str 
    description: Optional[str] = None
    stock: int
    image_url: Optional[str] = None
    class Config:
         from_attributes = True

class ProductCreate(ProductBase):
    category_name: str = Field(..., description="Nombre de la categoría temporal para buscar su ID")

class Product(ProductBase):
    id: int
    category_id: int  
    
