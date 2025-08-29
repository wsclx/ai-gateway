import asyncio
from app.core.database import get_db
from app.models.user import User
from sqlalchemy import select, update


async def main():
    db = await anext(get_db())
    
    # Update first user to admin role
    result = await db.execute(
        update(User)
        .where(User.role == 'user')
        .values(role='admin')
    )
    
    await db.commit()
    print('Updated user role to admin')
    
    # Verify the change
    result = await db.execute(select(User))
    users = result.scalars().all()
    print('Users after update:')
    for u in users:
        print(f'- {u.display_name} ({u.ext_subject}): {u.role}')


if __name__ == "__main__":
    asyncio.run(main())
