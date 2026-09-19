"""Run: python -m seed (from backend/) to reset and reseed."""

from app.database import Base, SessionLocal, engine
from app.models import Comment, Post, Reaction, Report
from app.services import seed_database


def main() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Clear is implicit after drop_all; seed only if empty
        for model in (Reaction, Comment, Report, Post):
            db.query(model).delete()
        db.commit()
        seed_database(db)
        print("Database reseeded.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
