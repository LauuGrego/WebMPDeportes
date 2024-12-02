from pydantic import BaseModel

class ProductBase(BaseModel):
    name: str
    type: str
    description: str
    price: float
    stock: int
    image_url: str

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True
    