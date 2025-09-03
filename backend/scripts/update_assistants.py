import asyncio
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.database import AsyncSessionLocal
from app.models.assistant import Assistant


TARGET_ASSISTANTS = [
    {
        "name": "Newsletter Assistant",
        "provider": "openai",
        "model": "gpt-4o-mini",
        "system_prompt": "Hilf beim Erstellen und Optimieren von Newslettern (Struktur, Betreff, Preheader, A/B-Varianten).",
        "visibility": "internal",
        "status": "active",
        "dept_scope": ["marketing"],
        "tools": [],
    },
    {
        "name": "Spendenaufruf Assistant",
        "provider": "openai",
        "model": "gpt-4o-mini",
        "system_prompt": "Erstelle wirkungsvolle Spendenaufrufe und Landingpage-Texte in professionellem Ton, DSGVO-konform.",
        "visibility": "internal",
        "status": "active",
        "dept_scope": ["marketing", "sales"],
        "tools": [],
    },
    {
        "name": "Social Media Assistant",
        "provider": "openai",
        "model": "gpt-4o-mini",
        "system_prompt": "Liefere Social-Posts in unterschiedlichen Längen/Formaten (Twitter/X, LinkedIn, Instagram), inkl. Hashtags.",
        "visibility": "internal",
        "status": "active",
        "dept_scope": ["marketing"],
        "tools": [],
    },
    {
        "name": "Content Assistant (Bilder)",
        "provider": "openai",
        "model": "gpt-4o-mini",
        "system_prompt": "Generiere Bildideen und Alt-Texte; optional Prompts für Bildgeneratoren.",
        "visibility": "internal",
        "status": "active",
        "dept_scope": ["marketing", "design"],
        "tools": [],
    },
]

OLD_NAMES = {"General Assistant", "IT Support", "HR Assistant", "Sales Helper"}


async def main():
    async with AsyncSessionLocal() as db:  # type: AsyncSession
        # Delete known old assistants by name
        for name in OLD_NAMES:
            await db.execute(delete(Assistant).where(Assistant.name == name))

        # Upsert target assistants by name
        for data in TARGET_ASSISTANTS:
            row = await db.execute(select(Assistant).where(Assistant.name == data["name"]))
            existing = row.scalars().first()
            if existing:
                existing.provider = data["provider"]
                existing.model = data["model"]
                existing.system_prompt = data["system_prompt"]
                existing.visibility = data["visibility"]
                existing.status = data["status"]
                existing.dept_scope = data["dept_scope"]
                existing.tools = data["tools"]
            else:
                asst = Assistant(
                    id=uuid.uuid4(),
                    name=data["name"],
                    provider=data["provider"],
                    model=data["model"],
                    system_prompt=data["system_prompt"],
                    visibility=data["visibility"],
                    status=data["status"],
                    dept_scope=data["dept_scope"],
                    tools=data["tools"],
                )
                db.add(asst)

        await db.commit()
        print("✅ Assistants set updated")


if __name__ == "__main__":
    asyncio.run(main())


