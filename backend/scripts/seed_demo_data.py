import asyncio
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.user import Department, User
from app.models.assistant import Assistant
from app.models.chat import Thread, Message


async def seed():
    async with AsyncSessionLocal() as session:  # type: AsyncSession
        # Department
        dept = (await session.execute(select(Department).where(Department.key == "it"))).scalar_one_or_none()
        if not dept:
            dept = Department(id=uuid.uuid4(), key="it", name="IT")
            session.add(dept)

        # User
        user = (
            await session.execute(select(User).where(User.ext_subject == "local-test"))
        ).scalar_one_or_none()
        if not user:
            user = User(
                id=uuid.uuid4(),
                ext_subject="local-test",
                ext_subject_hash="0" * 64,
                display_name="Local Tester",
                dept_id=dept.id,
                role="admin",
            )
            session.add(user)

        # Assistants
        assistants = []
        existing = (await session.execute(select(Assistant))).scalars().all()
        if not existing:
            a1 = Assistant(
                id=uuid.uuid4(),
                name="HR Assistant",
                provider="openai",
                provider_assistant_id="asst_demo_hr",
                model="gpt-4o-mini",
                system_prompt="Du bist der HR Assistant.",
                dept_scope=["hr"],
                tools=[],
                visibility="internal",
            )
            a2 = Assistant(
                id=uuid.uuid4(),
                name="IT Support",
                provider="openai",
                provider_assistant_id="asst_demo_it",
                model="gpt-4o-mini",
                system_prompt="Du bist der IT Support Assistant.",
                dept_scope=["it"],
                tools=[],
                visibility="internal",
            )
            a3 = Assistant(
                id=uuid.uuid4(),
                name="Sales Helper",
                provider="openai",
                provider_assistant_id="asst_demo_sales",
                model="gpt-4o-mini",
                system_prompt="Du bist der Sales Assistant.",
                dept_scope=["sales"],
                tools=[],
                visibility="internal",
            )
            session.add_all([a1, a2, a3])
            assistants = [a1, a2, a3]
        else:
            assistants = existing

        await session.flush()

        # Threads and Messages (minimal)
        for asst in assistants[:2]:
            # thread exists?
            thr = (
                await session.execute(
                    select(Thread).where(Thread.assistant_id == asst.id)
                )
            ).scalar_one_or_none()
            if not thr:
                thr = Thread(id=uuid.uuid4(), assistant_id=asst.id, user_id=user.id, status="open")
                session.add(thr)
                await session.flush()

                # messages
                m1 = Message(
                    id=uuid.uuid4(),
                    thread_id=thr.id,
                    role="user",
                    content_ciphertext=b"demo",
                    content_sha256="0" * 64,
                    tokens_in=20,
                    tokens_out=0,
                    cost_in_cents=1,
                    cost_out_cents=0,
                    latency_ms=300,
                    redaction_map={},
                )
                m2 = Message(
                    id=uuid.uuid4(),
                    thread_id=thr.id,
                    role="assistant",
                    content_ciphertext=b"reply",
                    content_sha256="f" * 64,
                    tokens_in=0,
                    tokens_out=40,
                    cost_in_cents=0,
                    cost_out_cents=2,
                    latency_ms=800,
                    redaction_map={},
                )
                session.add_all([m1, m2])

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())


