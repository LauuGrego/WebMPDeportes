<<<<<<< HEAD
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

    class Config:
        from_attributes = True

class ProductCreate(ProductBase):
    category_name: str = Field(..., description="Nombre de la categoría para buscar su ID automáticamente")

class Product(ProductBase):
    id: str  # Cambié `int` por `str` para reflejar que MongoDB utiliza ObjectId como string
    category_id: str

=======
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

    class Config:
        from_attributes = True

class ProductCreate(ProductBase):
    category_name: str = Field(..., description="Nombre de la categoría para buscar su ID automáticamente")

class Product(ProductBase):
    id: str  # Cambié `int` por `str` para reflejar que MongoDB utiliza ObjectId como string
    category_id: str

>>>>>>> fcbb013a6e421ae9310f98ac2227f1e8e347b22f
