<<<<<<< HEAD
from pydantic import BaseModel,EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    username: str
    email:  Optional[EmailStr]
    disable: bool = False
    role: str = "user" 
    class Config:
         from_attributes = True

class User(UserBase):
    id: str = Field(default=None, alias="_id") 
    password: str

class UserCreate(UserBase):
=======
from pydantic import BaseModel,EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    username: str
    email:  Optional[EmailStr]
    disable: bool = False
    role: str = "user" 
    class Config:
         from_attributes = True

class User(UserBase):
    id: str = Field(default=None, alias="_id") 
    password: str

class UserCreate(UserBase):
>>>>>>> fcbb013a6e421ae9310f98ac2227f1e8e347b22f
    password: str