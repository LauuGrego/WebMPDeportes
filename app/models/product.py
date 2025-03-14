# models.py
from pydantic import BaseModel, Field
from typing import Optional, List

class ProductBase(BaseModel):
    name: str
    price: Optional[float] = 0.0  # Valor por defecto 0.0
    type: str  # Considera renombrar este campo si deseas evitar conflictos con el built-in "type"
    size: List[str]
    description: Optional[str] = None
    stock: int
    image_url: List[str] = []  # Lista vacía por defecto

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
    image_url: Optional[List[str]] = None
    category_name: Optional[str] = None  # Opción de categoría si se quiere actualizar

    class Config:
         from_attributes = True
