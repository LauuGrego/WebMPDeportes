
from pydantic import BaseModel
from typing import Optional

class CategoryBase(BaseModel):
    name: str

    class Config:
         from_attributes = True
class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int  
    
    class Config:
          from_attributes = True