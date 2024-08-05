import os
import base64
from dotenv import load_dotenv
from random import SystemRandom
from pydantic_settings import BaseSettings

load_dotenv()

def get_url():
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    server = os.getenv("POSTGRES_SERVER")
    port = os.getenv("POSTGRES_PORT")
    db = os.getenv("POSTGRES_DB")
    return f"postgresql+psycopg://{user}:{password}@{server}:{port}/{db}"

DEFAULT_ENTROPY = 32  # number of bytes to return by default
_sysrand = SystemRandom()

def token_bytes(nbytes=None):
    if nbytes is None:
        nbytes = DEFAULT_ENTROPY
    return _sysrand.randbytes(nbytes)

def token_urlsafe(nbytes=None):
    tok = token_bytes(nbytes)
    return base64.urlsafe_b64encode(tok).rstrip(b'=').decode('ascii')

class Settings(BaseSettings):
    API_PREFIX: str = '/api/v1'
    POSTGRESQL_DATABASE_URI: str = get_url()
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    SECRET_KEY: str = token_urlsafe(32)
    ALGORITHM: str = "HS256"

settings = Settings()  # type: ignore
