from fastapi import FastAPI, HTTPException, APIRouter, Depends
from app.models.cart import Cart, CartItem, AddToCartRequest
from app.db.client import db_client
from app.models.user import User
from .users_JWT_auth import current_user

router = APIRouter(prefix="/carrito")

carts_collection = db_client.carts
products_collection = db_client.products

async def get_cart(user: User = Depends(current_user)):
  
    cart = carts_collection.find_one({"user_id": str(user.id)})

    if not cart:
        
        return Cart(user_id=str(user.id), items=[], total=0.0)

    
    cart["_id"] = str(cart["_id"]) 
    return Cart(**cart)

def save_cart(cart: Cart):
    carts_collection.update_one(
        {"user_id": cart.user_id},
        {"$set": cart.model_dump()},
        upsert=True  
    )


@router.post("/agregar/{product_id}")
async def add_to_cart(product_id: str, request: AddToCartRequest, user: User = Depends(current_user)):
    
    cart = await get_cart(user)

    product = products_collection.find_one({"_id": product_id})
    quantity = request.quantity

    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    existing_item = next((item for item in cart.items if item.product_id == product_id), None)
    if existing_item:
        
        existing_item.quantity += quantity
        existing_item.total_price = existing_item.quantity * existing_item.price
    else:
       
        cart.items.append(CartItem(
            product_id=product_id,
            name=product["name"],
            price=product["price"],
            quantity=quantity,
            total_price=product["price"] * quantity
        ))

   
    cart.total = sum(item.total_price for item in cart.items)

    
    save_cart(cart)

    return {"message": "Producto agregado al carrito", "cart": cart}


@router.get("/ver")
async def view_cart(user: User = Depends(current_user)):
    cart = get_cart(user.id)  
    return {"cart": cart}

@router.put("/actualizar/{product_id}")
async def update_cart(product_id: str, quantity: int, user: User = Depends(current_user)):
    cart = get_cart(user.id)
    item = next((item for item in cart.items if item.product_id == product_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Producto no encontrado en el carrito")
    
    item.quantity = quantity
    item.total_price = item.quantity * item.price

    cart.total = sum(item.total_price for item in cart.items)

    save_cart(cart)
    
    return {"message": "Carrito actualizado", "cart": cart}

@router.delete("/eliminar/{product_id}")
async def remove_from_cart( product_id: str, user: User = Depends(current_user)):
    cart = get_cart(user.id)
    cart.items = [item for item in cart.items if item.product_id != product_id]
    
    cart.total = sum(item.total_price for item in cart.items)

    save_cart(cart)

    return {"message": "Producto eliminado del carrito", "cart": cart}

@router.delete("/limpiar")
async def clear_cart(user: User = Depends(current_user)):
    cart = get_cart(user.id)
    cart.items = []
    cart.total = 0.0

    save_cart(cart)

    return {"message": "Carrito vaciado", "cart": cart}