#!/usr/bin/env python3
"""
Script to create demo assistants for the DUH AI Gateway
"""
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.assistant import Assistant


async def create_assistants():
    """Create demo assistants for testing"""
    async with AsyncSessionLocal() as session:
        try:
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
            
            print("✅ Demo assistants created successfully!")
            print(f"   - {len(assistants)} assistants")
            
        except Exception as e:
            print(f"❌ Error creating assistants: {e}")
            await session.rollback()


if __name__ == "__main__":
    asyncio.run(create_assistants())
