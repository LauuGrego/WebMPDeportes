from pydantic import BaseModel
from typing import List

class CartItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    total_price: float  # Total para este producto (price * quantity)

class Cart(BaseModel):
    user_id: str
    items: List[CartItem]
    total: float  # Total del carrito

class AddToCartRequest(BaseModel):
    quantity: int
