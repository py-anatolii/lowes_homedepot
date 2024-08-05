from datetime import timedelta
from typing import Annotated
from sqlmodel import Session
from fastapi import APIRouter, Depends, HTTPException

from app import crud
from app.db import get_db
from app.settings import settings
from app.core.security import create_access_token, get_current_user
from app.models import UserRegister, UserLogin, User, Message, Token

SessionDep = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]

router = APIRouter()

@router.post("/login")
def login_user(session: SessionDep, form_data: UserLogin) -> Token:
    user = crud.authenticate(session=session, email=form_data.email, password=form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token=create_access_token(user.id, expires_delta=access_token_expires)
    return Token(access_token=access_token, expire_time=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
  
@router.post("/register")
def create_user(*, session: SessionDep, user_in: UserRegister) -> Message:
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="The user with this email already exists.")

    user = crud.create_user(session=session, user_create=user_in)
    return Message(message="Your account is created successfully")
   