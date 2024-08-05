from sqlmodel import create_engine, Session

from app.settings import settings

engine = create_engine(str(settings.POSTGRESQL_DATABASE_URI))

def get_db():
    with Session(engine) as session:
        yield session
