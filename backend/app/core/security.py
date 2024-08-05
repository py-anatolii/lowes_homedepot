from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Any, Annotated
from datetime import datetime, timedelta
from pydantic import ValidationError
from sqlmodel import Session
import jwt
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext

from app.db import get_db
from app.settings import settings
from app.models import User, TokenPayload, UserLogin

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_PREFIX}/user/login"
)

SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[UserLogin, Depends(reusable_oauth2)]

def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.utcnow() + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=settings.ALGORITHM
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = session.get(User, token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user