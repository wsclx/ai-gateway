import asyncio
from app.core.database import get_db
from app.models.user import User
from sqlalchemy import select


async def main():
    db = await anext(get_db())
    result = await db.execute(select(User))
    users = result.scalars().all()
    print('Users:')
    for u in users:
        print(f'- {u.display_name} ({u.ext_subject}): {u.role}')


if __name__ == "__main__":
    asyncio.run(main())
