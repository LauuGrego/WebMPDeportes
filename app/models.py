from sqlalchemy import Column, Integer, String, Float
from .database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    description = Column(String)
    price = Column(Float)
    stock = Column(Integer)
    image_url = Column(String) 
