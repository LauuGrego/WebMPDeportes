<<<<<<< HEAD
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
=======
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
>>>>>>> fcbb013a6e421ae9310f98ac2227f1e8e347b22f
        orm_mode = True