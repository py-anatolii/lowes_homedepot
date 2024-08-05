from datetime import datetime
from typing import Optional
from pydantic import EmailStr, Field, model_validator
from sqlmodel import Field, SQLModel

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

class TokenPayload(SQLModel):
    sub: str
    exp: int
    
class Token(SQLModel):
    access_token: str
    expire_time: int
    token_type: str = "bearer"

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)

class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    password2: str = Field(min_length=8, max_length=40)
    
    @model_validator(mode='before')
    def check_passwords_match(cls, values):
        password = values.get('password')
        password2 = values.get('password2')
        if password != password2:
            raise ValueError('Passwords do not match')
        return values

class UserLogin(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)

