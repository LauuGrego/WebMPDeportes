"""from fastapi import APIRouter, Depends
from schemas import user
from fastapi import HTTPException
from typing import List, Optional


router = APIRouter()

#Registar Usuario
@router.post("/registrar_usuario", response_model=user.User)
async def register_user(user: user.UserCreate, db: Session = Depends(get_db)):
    return users.register_user(db, user)

"""