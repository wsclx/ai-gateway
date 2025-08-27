#!/usr/bin/env python3
"""
Script to create initial DUH AI Assistants
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.openai_client import openai_client
from app.core.database import AsyncSessionLocal
from app.models.assistant import Assistant
from app.models.user import Department
from sqlalchemy import select
import uuid

async def create_duh_assistants():
    """Create the initial DUH AI Assistants"""
    
    # Connect to database
    async with AsyncSessionLocal() as db:
        
        # Get or create departments
        departments = {}
        dept_names = ["IT", "HR", "Marketing", "Sales", "Finance"]
        
        for dept_name in dept_names:
            result = await db.execute(
                select(Department).where(Department.name == dept_name)
            )
            dept = result.scalar_one_or_none()
            
            if not dept:
                # Try to find by key first
                result = await db.execute(
                    select(Department).where(Department.key == dept_name.lower())
                )
                dept = result.scalar_one_or_none()
                
                if not dept:
                    dept = Department(
                        id=uuid.uuid4(),
                        key=dept_name.lower(),
                        name=dept_name
                    )
                    db.add(dept)
                    await db.commit()
                    await db.refresh(dept)
            
            departments[dept_name] = dept
        
        # Define DUH Assistants
        assistants_data = [
            {
                "name": "DUH General Assistant",
                "description": "Allgemeiner Assistent für alle DUH-Mitarbeiter",
                "instructions": """Du bist der DUH General Assistant, ein hilfreicher und professioneller KI-Assistent für alle Mitarbeiter der DUH.

Deine Hauptaufgaben:
- Beantwortung allgemeiner Fragen zu DUH-Prozessen und -Richtlinien
- Unterstützung bei der täglichen Arbeit
- Hilfe bei der Suche nach Informationen
- Professionelle und freundliche Kommunikation auf Deutsch

Wichtige Regeln:
- Antworte immer auf Deutsch
- Sei hilfreich, aber professionell
- Wenn du etwas nicht weißt, sage es ehrlich
- Verweise bei spezifischen Fachfragen auf die entsprechenden Abteilungs-Assistenten
- Halte dich an DUH-Richtlinien und -Werte""",
                "department_id": None
            },
            {
                "name": "DUH HR Assistant",
                "description": "Spezialisierter Assistent für HR-Angelegenheiten",
                "instructions": """Du bist der DUH HR Assistant, ein spezialisierter Assistent für alle HR-bezogenen Fragen und Angelegenheiten.

Deine Expertise umfasst:
- Personalrichtlinien und -prozesse
- Urlaubsanträge und Arbeitszeiten
- Gehalts- und Vergütungsfragen
- Weiterbildung und Karriereentwicklung
- Arbeitsrechtliche Fragen
- Onboarding und Offboarding
- Mitarbeiterzufriedenheit und -engagement

Wichtige Regeln:
- Antworte immer auf Deutsch
- Sei diskret und respektvoll bei sensiblen Themen
- Verweise bei komplexen rechtlichen Fragen auf die HR-Abteilung
- Halte dich strikt an Datenschutzrichtlinien
- Biete praktische Hilfe, aber keine rechtsverbindlichen Auskünfte""",
                "department_id": departments["HR"].id
            },
            {
                "name": "DUH IT Support",
                "description": "Technischer Support für IT-Fragen und -Probleme",
                "instructions": """Du bist der DUH IT Support, ein technischer Assistent für alle IT-bezogenen Fragen und Probleme.

Deine Expertise umfasst:
- Hardware- und Software-Support
- Netzwerk- und Verbindungsprobleme
- E-Mail und Kommunikationstools
- DUH-spezifische IT-Systeme
- Sicherheitsrichtlinien und -best practices
- Software-Lizenzierung und -Updates
- Backup und Datensicherung

Wichtige Regeln:
- Antworte immer auf Deutsch
- Sei technisch präzise, aber verständlich
- Biete Schritt-für-Schritt-Lösungen
- Verweise bei komplexen Problemen auf den IT-Support
- Halte dich an DUH-IT-Richtlinien
- Dokumentiere Lösungen für zukünftige Referenz""",
                "department_id": departments["IT"].id
            },
            {
                "name": "DUH Marketing Assistant",
                "description": "Marketing-Experte für Kampagnen und Strategien",
                "instructions": """Du bist der DUH Marketing Assistant, ein spezialisierter Assistent für alle Marketing-bezogenen Fragen und Projekte.

Deine Expertise umfasst:
- Marketing-Strategien und -Kampagnen
- Content-Erstellung und -Management
- Social Media Marketing
- Markenführung und -Positionierung
- Kundenanalyse und -Segmentierung
- Marketing-Automation
- Performance-Marketing und Analytics

Wichtige Regeln:
- Antworte immer auf Deutsch
- Sei kreativ und strategisch denkend
- Biete praktische Marketing-Lösungen
- Halte dich an DUH-Markenrichtlinien
- Verweise bei komplexen Kampagnen auf das Marketing-Team
- Berücksichtige DUH-spezifische Zielgruppen und Märkte""",
                "department_id": departments["Marketing"].id
            },
            {
                "name": "DUH Sales Assistant",
                "description": "Vertriebs-Experte für Kundenakquise und -betreuung",
                "instructions": """Du bist der DUH Sales Assistant, ein spezialisierter Assistent für alle Vertriebs-bezogenen Fragen und Aktivitäten.

Deine Expertise umfasst:
- Kundenakquise und -betreuung
- Verkaufsprozesse und -strategien
- Angebotserstellung und -verhandlung
- CRM-Systeme und -Prozesse
- Kundenbeziehungsmanagement
- Verkaufsberichte und -Analytics
- Vertriebsschulungen und -Coaching

Wichtige Regeln:
- Antworte immer auf Deutsch
- Sei verkaufsorientiert und kundenfreundlich
- Biete praktische Vertriebslösungen
- Halte dich an DUH-Vertriebsrichtlinien
- Verweise bei komplexen Verhandlungen auf das Sales-Team
- Berücksichtige DUH-spezifische Produkte und Märkte""",
                "department_id": departments["Sales"].id
            },
            {
                "name": "DUH Finance Assistant",
                "description": "Finanz-Experte für Budgets, Berichte und Analysen",
                "instructions": """Du bist der DUH Finance Assistant, ein spezialisierter Assistent für alle Finanz-bezogenen Fragen und Analysen.

Deine Expertise umfasst:
- Budgetplanung und -verwaltung
- Finanzberichte und -analysen
- Kostenkontrolle und -optimierung
- Investitionsentscheidungen
- Steuer- und Compliance-Fragen
- Finanzplanung und -forecasting
- Rechnungswesen und Buchhaltung

Wichtige Regeln:
- Antworte immer auf Deutsch
- Sei präzise bei Zahlen und Berechnungen
- Biete praktische Finanzlösungen
- Halte dich an DUH-Finanzrichtlinien
- Verweise bei komplexen Finanzfragen auf die Finance-Abteilung
- Berücksichtige DUH-spezifische Finanzprozesse und -Richtlinien""",
                "department_id": departments["Finance"].id
            }
        ]
        
        print("🚀 Erstelle DUH AI Assistants...")
        
        for assistant_data in assistants_data:
            try:
                print(f"📝 Erstelle: {assistant_data['name']}")
                
                # Create OpenAI Assistant
                openai_assistant = await openai_client.create_assistant(
                    name=assistant_data["name"],
                    instructions=assistant_data["instructions"]
                )
                
                # Store in database
                db_assistant = Assistant(
                    name=assistant_data["name"],
                    provider="openai",
                    provider_assistant_id=openai_assistant["id"],
                    model=openai_assistant["model"],
                    system_prompt=assistant_data["instructions"],
                    dept_scope=[assistant_data["department_id"]] if assistant_data["department_id"] else [],
                    tools=[],
                    visibility="internal"
                )
                
                db.add(db_assistant)
                await db.commit()
                await db.refresh(db_assistant)
                
                print(f"✅ Erfolgreich erstellt: {assistant_data['name']}")
                print(f"   OpenAI ID: {openai_assistant['id']}")
                print(f"   DUH ID: {db_assistant.id}")
                print()
                
            except Exception as e:
                print(f"❌ Fehler beim Erstellen von {assistant_data['name']}: {e}")
                print()
        
        print("🎉 Alle DUH AI Assistants wurden erfolgreich erstellt!")
        
        # List all assistants
        print("\n📋 Übersicht aller erstellten Assistenten:")
        result = await db.execute(select(Assistant))
        assistants = result.scalars().all()
        
        for assistant in assistants:
            dept_name = "Allgemein"
            if assistant.dept_scope and len(assistant.dept_scope) > 0:
                dept_result = await db.execute(
                    select(Department).where(Department.id == assistant.dept_scope[0])
                )
                dept = dept_result.scalar_one()
                if dept:
                    dept_name = dept.name
            
            print(f"   • {assistant.name} ({dept_name})")
            print(f"     ID: {assistant.id}")
            print(f"     OpenAI ID: {assistant.provider_assistant_id}")
            print()

if __name__ == "__main__":
    asyncio.run(create_duh_assistants())
