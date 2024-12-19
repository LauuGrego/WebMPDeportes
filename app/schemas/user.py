from pydantic import BaseModel

class UserBase(BaseModel):
    username: str
    email: str
    disable: bool

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    password: str

    class Config:
        from_attributes = True