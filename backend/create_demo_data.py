#!/usr/bin/env python3
"""
Script to create demo data for the DUH AI Gateway
"""
import asyncio
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.user import Department, User
from app.models.assistant import Assistant


async def create_demo_data():
    """Create demo data for testing"""
    async with AsyncSessionLocal() as session:
        try:
            # Create departments
            departments = [
                Department(
                    key="it",
                    name="Information Technology"
                ),
                Department(
                    key="hr",
                    name="Human Resources"
                ),
                Department(
                    key="marketing",
                    name="Marketing"
                ),
                Department(
                    key="sales",
                    name="Sales"
                )
            ]
            
            for dept in departments:
                session.add(dept)
            await session.commit()
            
            # Get department IDs
            dept_result = await session.execute(select(Department))
            dept_list = dept_result.scalars().all()
            dept_map = {dept.key: dept.id for dept in dept_list}
            
            # Create users
            users = [
                User(
                    ext_subject="admin@duh.ai",
                    ext_subject_hash="admin_hash",
                    display_name="Admin User",
                    dept_id=dept_map["it"],
                    role="admin"
                ),
                User(
                    ext_subject="user@duh.ai",
                    ext_subject_hash="user_hash",
                    display_name="Regular User",
                    dept_id=dept_map["hr"],
                    role="user"
                )
            ]
            
            for user in users:
                session.add(user)
            await session.commit()
            
            # Create assistants
            assistants = [
                Assistant(
                    name="General Assistant",
                    provider="openai",
                    model="gpt-4",
                    system_prompt="Du bist ein hilfreicher KI-Assistent für verschiedene Aufgaben.",
                    dept_scope=["it", "hr", "marketing", "sales"],
                    tools=[],
                    visibility="internal",
                    provider_assistant_id="asst_general"
                ),
                Assistant(
                    name="IT Support",
                    provider="openai",
                    model="gpt-4",
                    system_prompt="Du bist ein IT-Support-Assistent, spezialisiert auf IT-bezogene Fragen.",
                    dept_scope=["it"],
                    tools=[],
                    visibility="internal",
                    provider_assistant_id="asst_it"
                ),
                Assistant(
                    name="HR Assistant",
                    provider="openai",
                    model="gpt-4",
                    system_prompt="Du bist ein HR-Assistent, der bei HR-bezogenen Fragen hilft.",
                    dept_scope=["hr"],
                    tools=[],
                    visibility="internal",
                    provider_assistant_id="asst_hr"
                )
            ]
            
            for assistant in assistants:
                session.add(assistant)
            await session.commit()
            
            print("✅ Demo data created successfully!")
            print(f"   - {len(departments)} departments")
            print(f"   - {len(users)} users")
            print(f"   - {len(assistants)} assistants")
            
        except Exception as e:
            print(f"❌ Error creating demo data: {e}")
            await session.rollback()


if __name__ == "__main__":
    asyncio.run(create_demo_data())
