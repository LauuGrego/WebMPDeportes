from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from typing import List, Optional
from app.models.product import Product, ProductCreate, ProductUpdate
from app.db.client import db_client
from bson import ObjectId
from .users_JWT_auth import admin_only
from app.models.user import User
import re
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
import random
from pathlib import Path
from cloudinary.uploader import upload as cloudinary_upload
from math import ceil

# Router setup
router = APIRouter(prefix="/productos", tags=["Products"])

# Database collections
products_collection = db_client.products
categories_collection = db_client.categories

# Helper functions
# -----------------

def get_product_by_id(product_id: str):
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if product:
        product["id"] = str(product["_id"])
        del product["_id"]
        product.pop("image", None)
    return product

def shuffle_products(products: List[dict]) -> List[dict]:
    shuffled = products[:]
    random.shuffle(shuffled)
    return shuffled

# Endpoints
# ---------

# Obtener producto por ID
@router.get("/obtener_por_id/{product_id}")
async def get_product(product_id: str):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return JSONResponse(content=product)

# Agregar productos
@router.post("/agregar", response_model=Product)
async def create_product(
    name: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    size: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    stock: Optional[int] = Form(None),
    category: Optional[str] = Form(None),  # Receive category ID from the frontend
    image_url: Optional[str] = Form(None),  # Receive image URL from the frontend
    price: Optional[float] = Form(None),
    admin: User = Depends(admin_only)
):
    try:
        # Initialize product data
        product_dict = {}

        if name:
            product_dict["name"] = name.strip().title()
        if type:
            product_dict["type"] = type.strip().title()
        if size:
            product_dict["size"] = [s.strip().title() for s in size.split(",") if s.strip()]
        if description:
            product_dict["description"] = description.strip()
        if stock is not None:
            product_dict["stock"] = stock
        if category:
            category_doc = categories_collection.find_one({"_id": ObjectId(category)})
            if not category_doc:
                raise HTTPException(status_code=404, detail=f"La categoría con ID '{category}' no existe.")
            product_dict["category_id"] = category
        if price is not None:
            product_dict["price"] = round(float(price), 2)

        if image_url:
            product_dict["image_path"] = image_url  # Save the image URL
        else:
            # Default image if none is provided
            product_dict["image_path"] = "https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg"

        # Validate required fields
        required_fields = ["name", "type", "size", "description", "stock", "category_id", "price"]
        for field in required_fields:
            if field not in product_dict or not product_dict[field]:
                raise HTTPException(status_code=422, detail=f"El campo '{field}' es obligatorio.")

        # Insert product into the database
        result = products_collection.insert_one(product_dict)
        product_dict["_id"] = str(result.inserted_id)
        product_dict["id"] = product_dict.pop("_id")

        return product_dict

    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

# Actualizar producto
@router.put("/actualizar/{product_id}", response_model=Product)
async def modify_product(
    product_id: str,
    name: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    size: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    stock: Optional[int] = Form(None),
    category_name: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),  # Receive image URL from the frontend
    price: Optional[float] = Form(None),
    admin: User = Depends(admin_only)
):
    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")

    update_data = {}

    if name:
        update_data["name"] = name.strip().title()
    if type:
        update_data["type"] = type.strip().title()
    if size:
        update_data["size"] = [s.strip().title() for s in size.split(",") if s.strip()]
    if description:
        update_data["description"] = description.strip()
    if stock is not None:
        update_data["stock"] = stock
    if category_name:
        category_name = category_name.strip().title()
        category = categories_collection.find_one({"name": category_name})
        if not category:
            raise HTTPException(status_code=404, detail=f"La categoría '{category_name}' no existe.")
        update_data["category_id"] = str(category["_id"])
    if price is not None:
        update_data["price"] = round(float(price), 2)

    if image_url:
        update_data["image_path"] = image_url  # Update the image URL

    products_collection.update_one({"_id": ObjectId(product_id)}, {"$set": update_data})

    return get_product_by_id(product_id)

# Buscar productos
@router.get("/buscar", response_model=List[Product])
async def search_products(name: Optional[str] = None, type: Optional[str] = None, category: Optional[str] = None):
    if not name and not type and not category:
        raise HTTPException(status_code=400, detail="Al menos uno de los parámetros 'name', 'type' o 'category' es requerido.")

    query = []

    def build_regex_query(field: str, value: str):
        words = value.split()
        regex_query = ".*".join([re.escape(word) for word in words])
        return {field: {"$regex": regex_query, "$options": "i"}}

    if name:
        query.append(build_regex_query("name", name))

    if type:
        query.append(build_regex_query("type", type))

    if category:
        category_doc = categories_collection.find_one({"name": category.strip().title()})
        if category_doc:
            query.append({"category_id": str(category_doc["_id"])})
        else:
            raise HTTPException(status_code=404, detail=f"La categoría '{category}' no existe.")

    products = list(products_collection.find({"$or": query}))

    for product in products:
        product["_id"] = str(product["_id"])
        product["id"] = product.pop("_id")
        if "image_path" in product and product["image_path"]:
            product["image_path"] = f"/static/{product['image_path']}"  # Correctly prefix with /static/
        else:
            product["image_path"] = "/static/images/default-product.jpg"
        product["price"] = float(product["price"]) if "price" in product and isinstance(product["price"], (int, float)) else None

    return products

# Obtener imagen del producto
@router.get("/imagen/{product_id}")
async def get_product_image(product_id: str):
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    
    image_url = product.get("image_path", "https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg")
    return JSONResponse(content={"image_url": image_url})

# Eliminar productos
@router.delete("/eliminar/{product_id}", response_model=dict)
async def delete_product(product_id: str, admin: User = Depends(admin_only)):
    db_product = get_product_by_id(product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    
    result = products_collection.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 1:
        return {"message": "Producto eliminado con éxito."}
    else:
        raise HTTPException(status_code=500, detail="Error al eliminar el producto.")

# Listar productos
@router.get("/listar")
async def list_products(search: Optional[str] = None, page: int = 1, limit: int = 10):
    query = {}
    if search:
        query["name"] = {"$regex": re.escape(search), "$options": "i"}

    total_products = products_collection.count_documents(query)
    total_pages = ceil(total_products / limit)
    skip = (page - 1) * limit

    products = list(products_collection.find(query).skip(skip).limit(limit))
    
    for product in products:
        product["id"] = str(product["_id"])
        del product["_id"]
        if "image_path" not in product or not product["image_path"]:
            product["image_path"] = "https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg"
        
        if "price" in product and isinstance(product["price"], (int, float)):
            product["price"] = "{:,.2f}".format(product["price"]).replace(",", "X").replace(".", ",").replace("X", ".")
        
        product["description"] = product.get("description", "")
        product["stock"] = product.get("stock", 0)
        product["type"] = product.get("type", "")
        product["size"] = product.get("size", [])
        
        category = categories_collection.find_one({"_id": ObjectId(product["category_id"])})
        product["category_name"] = category["name"] if category else "Sin categoría"

    return {"products": products, "totalPages": total_pages}

@router.get("/listar/tipos")
async def list_product_types():
    types = products_collection.distinct("type")
    types = [t.strip().title() for t in types if t]
    return types

# Detalle de producto
@router.get("/detalle/{product_id}")
async def get_product_details(product_id: str):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    if "image_path" in product and product["image_path"]:
        product["image"] = f"/static/{product['image_path']}"  # Directly prefix with /static/
    else:
        product["image"] = "/static/images/default-product.jpg"
    if "price" in product and isinstance(product["price"], (int, float)):
        product["price"] = "{:,.2f}".format(product["price"]).replace(",", "X").replace(".", ",").replace("X", ".")
    return product

# Buscar por categoría o tipo
@router.get("/buscar_por_categoria_o_tipo")
async def buscar_por_categoria_o_tipo(category: Optional[str] = None, type: Optional[str] = None, page: int = 1, limit: int = 10):
    if not category and not type:
        raise HTTPException(
            status_code=400,
            detail="Debe proporcionar al menos una categoría o un tipo para buscar.",
        )

    query = {}
    if category:
        category_doc = categories_collection.find_one({"name": category.strip().title()})
        if not category_doc:
            raise HTTPException(
                status_code=404, detail=f"La categoría '{category}' no existe."
            )
        query["category_id"] = str(category_doc["_id"])

    if type:
        query["type"] = {"$regex": f"^{re.escape(type.strip().title())}$", "$options": "i"}

    total_products = products_collection.count_documents(query)
    total_pages = ceil(total_products / limit)
    skip = (page - 1) * limit

    products = list(products_collection.find(query).skip(skip).limit(limit))

    for product in products:
        product["_id"] = str(product["_id"])
        product["id"] = product.pop("_id")
        if "image_path" not in product or not product["image_path"]:
            product["image_path"] = "https://res.cloudinary.com/demo/image/upload/v1/products/default-product.jpg"
        product["price"] = float(product["price"]) if "price" in product else None

    return {"products": products, "totalPages": total_pages}

