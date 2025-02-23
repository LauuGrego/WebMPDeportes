from pydantic import BaseModel, Field
from typing import Optional, List

class ProductBase(BaseModel):
    name: str
    price: float
    type: str
    size: List[str]
    description: Optional[str] = None
    stock: int
    image_url: Optional[str] = None
   # color: List[str]
    class Config:
        from_attributes = True

class ProductCreate(ProductBase):
    category_name: str = Field(..., description="Nombre de la categoría para buscar su ID automáticamente")

class Product(ProductBase):
    id: str  
    category_id: str

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    type: Optional[str] = None
    size: Optional[List[str]] = None
    description: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    category_name: Optional[str] = None  # Opción de categoría si se quiere actualizar
    
    class Config:
        from_attributes = True

