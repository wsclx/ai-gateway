#!/usr/bin/env python3
"""
Script to create demo assistants for the AI Gateway (idempotent)
"""
import asyncio
from sqlalchemy import select, delete
from app.core.database import AsyncSessionLocal
from app.models.assistant import Assistant


async def create_assistants():
    """Synchronize demo assistants without creating duplicates."""
    TARGET = [
        {
            "name": "Newsletter Assistant",
            "provider": "openai",
            "model": "gpt-4o-mini",
            "system_prompt": "Hilf beim Erstellen und Optimieren von Newslettern (Struktur, Betreff, Preheader, A/B-Varianten).",
            "dept_scope": ["marketing"],
            "tools": [],
            "visibility": "internal",
            "provider_assistant_id": "asst_newsletter",
        },
        {
            "name": "Spendenaufruf Assistant",
            "provider": "openai",
            "model": "gpt-4o-mini",
            "system_prompt": "Erstelle wirkungsvolle Spendenaufrufe und Landingpage-Texte in professionellem Ton, DSGVO-konform.",
            "dept_scope": ["marketing", "sales"],
            "tools": [],
            "visibility": "internal",
            "provider_assistant_id": "asst_donation",
        },
        {
            "name": "Social Media Assistant",
            "provider": "openai",
            "model": "gpt-4o-mini",
            "system_prompt": "Liefere Social-Posts in unterschiedlichen Längen/Formaten (Twitter/X, LinkedIn, Instagram), inkl. Hashtags.",
            "dept_scope": ["marketing"],
            "tools": [],
            "visibility": "internal",
            "provider_assistant_id": "asst_social",
        },
        {
            "name": "Content Assistant (Bilder)",
            "provider": "openai",
            "model": "gpt-4o-mini",
            "system_prompt": "Generiere Bildideen und Alt-Texte; optional promptet für Bildgeneratoren (keine Bildgenerierung lokal).",
            "dept_scope": ["marketing", "design"],
            "tools": [],
            "visibility": "internal",
            "provider_assistant_id": "asst_content_img",
        },
    ]

    OLD = {"General Assistant", "IT Support", "HR Assistant", "Sales Helper"}

    async with AsyncSessionLocal() as session:
        try:
            # Remove known old names
            await session.execute(delete(Assistant).where(Assistant.name.in_(OLD)))

            # Upsert by name
            for data in TARGET:
                res = await session.execute(select(Assistant).where(Assistant.name == data["name"]))
                existing = res.scalars().first()
                if existing:
                    existing.provider = data["provider"]
                    existing.model = data["model"]
                    existing.system_prompt = data["system_prompt"]
                    existing.dept_scope = data["dept_scope"]
                    existing.tools = data["tools"]
                    existing.visibility = data["visibility"]
                    existing.provider_assistant_id = data["provider_assistant_id"]
                else:
                    session.add(Assistant(**data))

            await session.commit()

            # Info output
            res = await session.execute(select(Assistant))
            total = len(res.scalars().all())
            print("✅ Assistants synchronized (idempotent)")
            print(f"   - total: {total}")
        except Exception as e:
            print(f"❌ Error creating assistants: {e}")
            await session.rollback()


if __name__ == "__main__":
    asyncio.run(create_assistants())
