from pydantic import BaseModel,EmailStr
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr
    disable: bool = False
    role: str = "user" 
    class Config:
         from_attributes = True

class User(UserBase):
    id: int
    password: str

class UserCreate(UserBase):
    password: str