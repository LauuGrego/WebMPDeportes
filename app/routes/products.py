<<<<<<< HEAD
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models.product import Product, ProductCreate, ProductBase
from db.client import db_client
from bson import ObjectId
from .users_JWT_auth import admin_only
from models.user import User
import re

router = APIRouter(prefix="/productos", tags=["Products"])

# Colección de productos y categorías
products_collection = db_client.products
categories_collection = db_client.categories

# Obtener producto por ID
def get_product_by_id(product_id: str):
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if product:
        product["_id"] = str(product["_id"])  # Convertir ObjectId a string
    return product


# Agregar productos
@router.post("/agregar", response_model=Product)
async def create_product(product_data: ProductCreate, admin: User = Depends(admin_only)):
    

    product_data.name = product_data.name.strip().title()
    product_data.category_name = product_data.category_name.strip().title()
    product_data.type = product_data.type.strip().title()

 
    if product_data.size:
        product_data.size = [s.strip().title() for s in product_data.size if s.strip()]


    category = categories_collection.find_one({"name": product_data.category_name})
    if not category:
        raise HTTPException(status_code=404, detail=f"La categoría '{product_data.category_name}' no existe.")
    
  
    product_dict = product_data.model_dump()
    product_dict.pop("category_name")  
    product_dict["category_id"] = str(category["_id"])  
    

    result = products_collection.insert_one(product_dict)

   
    product_dict["_id"] = str(result.inserted_id)
    product_dict["id"] = product_dict.pop("_id")
    
    return product_dict


# Actualizar productos
@router.put("/actualizar/{product_id}", response_model=Product)
async def modify_product(product_id: str, updated_product: ProductCreate, admin: User = Depends(admin_only)):
    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    
 
    updated_product.category_name = updated_product.category_name.strip().title()
    category = categories_collection.find_one({"name": updated_product.category_name})
    if not category:
        raise HTTPException(status_code=404, detail=f"La categoría '{updated_product.category_name}' no existe.")
    

    if updated_product.size:
        updated_product.size = [s.strip().title() for s in updated_product.size if s.strip()]
    

    update_data = updated_product.model_dump(exclude_unset=True)
    update_data["category_id"] = str(category["_id"])
    

    products_collection.update_one({"_id": ObjectId(product_id)}, {"$set": update_data})


    return get_product_by_id(product_id)


# Deshabilitar productos
@router.put("/deshabilitar/{product_id}", response_model=Product)
async def disable_product(product_id: str, admin: User = Depends(admin_only)):
    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")

    products_collection.update_one({"_id": ObjectId(product_id)}, {"$set": {"stock": 0}})
    return get_product_by_id(product_id)

# Buscar productos por filtro
@router.get("/buscar", response_model=List[Product])
async def search_products(
    name: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    type: Optional[str] = None,
    category: Optional[str] = None,
    size: Optional[List[str]] = None  
):
   
    query = {}


    if name:
        query["name"] = {"$regex": re.escape(name), "$options": "i"}
    

    if min_price is not None:
        query["price"] = {"$gte": min_price}
    

    if max_price is not None:
        query["price"] = {"$lte": max_price}
    

    if type:
        query["type"] = {"$regex": re.escape(type), "$options": "i"}
    

    if category:
        category_obj = categories_collection.find_one({"name": category})
        if category_obj:
            query["category_id"] = str(category_obj["_id"])
    

    if size:
        query["size"] = {"$in": [s.strip().title() for s in size]}  
    

    products = products_collection.find(query)

    result = []
    for product in products:
        product["_id"] = str(product["_id"])
        product["id"] = product.pop("_id")
        result.append(product)

    return result



# Eliminar producto
@router.delete("/eliminar/{product_id}")
async def delete_product_by_id(product_id: str, admin: User = Depends(admin_only)):
    result = products_collection.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")

    return {"message": "Producto eliminado con éxito."}
=======
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models.product import Product, ProductCreate, ProductBase
from db.client import db_client
from bson import ObjectId
from .users_JWT_auth import admin_only
from models.user import User
import re

router = APIRouter(prefix="/productos", tags=["Products"])

# Colección de productos y categorías
products_collection = db_client.products
categories_collection = db_client.categories

# Obtener producto por ID
def get_product_by_id(product_id: str):
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if product:
        product["_id"] = str(product["_id"])  # Convertir ObjectId a string
    return product


# Agregar productos
@router.post("/agregar", response_model=Product)
async def create_product(product_data: ProductCreate, admin: User = Depends(admin_only)):
    

    product_data.name = product_data.name.strip().title()
    product_data.category_name = product_data.category_name.strip().title()
    product_data.type = product_data.type.strip().title()

 
    if product_data.size:
        product_data.size = [s.strip().title() for s in product_data.size if s.strip()]


    category = categories_collection.find_one({"name": product_data.category_name})
    if not category:
        raise HTTPException(status_code=404, detail=f"La categoría '{product_data.category_name}' no existe.")
    
  
    product_dict = product_data.model_dump()
    product_dict.pop("category_name")  
    product_dict["category_id"] = str(category["_id"])  
    

    result = products_collection.insert_one(product_dict)

   
    product_dict["_id"] = str(result.inserted_id)
    product_dict["id"] = product_dict.pop("_id")
    
    return product_dict


# Actualizar productos
@router.put("/actualizar/{product_id}", response_model=Product)
async def modify_product(product_id: str, updated_product: ProductCreate, admin: User = Depends(admin_only)):
    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    
 
    updated_product.category_name = updated_product.category_name.strip().title()
    category = categories_collection.find_one({"name": updated_product.category_name})
    if not category:
        raise HTTPException(status_code=404, detail=f"La categoría '{updated_product.category_name}' no existe.")
    

    if updated_product.size:
        updated_product.size = [s.strip().title() for s in updated_product.size if s.strip()]
    

    update_data = updated_product.model_dump(exclude_unset=True)
    update_data["category_id"] = str(category["_id"])
    

    products_collection.update_one({"_id": ObjectId(product_id)}, {"$set": update_data})


    return get_product_by_id(product_id)


# Deshabilitar productos
@router.put("/deshabilitar/{product_id}", response_model=Product)
async def disable_product(product_id: str, admin: User = Depends(admin_only)):
    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")

    products_collection.update_one({"_id": ObjectId(product_id)}, {"$set": {"stock": 0}})
    return get_product_by_id(product_id)

# Buscar productos por filtro
@router.get("/buscar", response_model=List[Product])
async def search_products(
    name: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    type: Optional[str] = None,
    category: Optional[str] = None,
    size: Optional[List[str]] = None  
):
   
    query = {}


    if name:
        query["name"] = {"$regex": re.escape(name), "$options": "i"}
    

    if min_price is not None:
        query["price"] = {"$gte": min_price}
    

    if max_price is not None:
        query["price"] = {"$lte": max_price}
    

    if type:
        query["type"] = {"$regex": re.escape(type), "$options": "i"}
    

    if category:
        category_obj = categories_collection.find_one({"name": category})
        if category_obj:
            query["category_id"] = str(category_obj["_id"])
    

    if size:
        query["size"] = {"$in": [s.strip().title() for s in size]}  
    

    products = products_collection.find(query)

    result = []
    for product in products:
        product["_id"] = str(product["_id"])
        product["id"] = product.pop("_id")
        result.append(product)

    return result



# Eliminar producto
@router.delete("/eliminar/{product_id}")
async def delete_product_by_id(product_id: str, admin: User = Depends(admin_only)):
    result = products_collection.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")

    return {"message": "Producto eliminado con éxito."}
>>>>>>> fcbb013a6e421ae9310f98ac2227f1e8e347b22f
