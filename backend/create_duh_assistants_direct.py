#!/usr/bin/env python3
"""
Direct HTTP script to create DUH AI Assistants using OpenAI v2 API
"""

import asyncio
import sys
import os
import json
import httpx

# OpenAI API configuration
OPENAI_API_KEY = "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"
OPENAI_BASE_URL = "https://api.openai.com/v1"

async def create_assistant_direct(name: str, instructions: str, model: str = "gpt-4o-mini"):
    """Create assistant using direct HTTP request"""
    
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
    }
    
    data = {
        "name": name,
        "instructions": instructions,
        "model": model,
        "tools": []
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{OPENAI_BASE_URL}/assistants",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error {response.status_code}: {response.text}")
            return None

async def create_duh_assistants_direct():
    """Create the initial DUH AI Assistants using direct HTTP"""
    
    # Define DUH Assistants
    assistants_data = [
        {
            "name": "DUH General Assistant",
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
- Halte dich an DUH-Richtlinien und -Werte"""
        },
        {
            "name": "DUH HR Assistant",
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
- Biete praktische Hilfe, aber keine rechtsverbindlichen Auskünfte"""
        },
        {
            "name": "DUH IT Support",
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
- Dokumentiere Lösungen für zukünftige Referenz"""
        },
        {
            "name": "DUH Marketing Assistant",
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
- Berücksichtige DUH-spezifische Zielgruppen und Märkte"""
        },
        {
            "name": "DUH Sales Assistant",
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
- Berücksichtige DUH-spezifische Produkte und Märkte"""
        },
        {
            "name": "DUH Finance Assistant",
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
- Berücksichtige DUH-spezifische Finanzprozesse und -Richtlinien"""
        }
    ]
    
    print("🚀 Erstelle DUH AI Assistants mit direkten HTTP-Requests...")
    
    created_assistants = []
    
    for assistant_data in assistants_data:
        try:
            print(f"📝 Erstelle: {assistant_data['name']}")
            
            # Create OpenAI Assistant using direct HTTP
            result = await create_assistant_direct(
                name=assistant_data["name"],
                instructions=assistant_data["instructions"]
            )
            
            if result:
                created_assistants.append({
                    "name": assistant_data["name"],
                    "openai_id": result["id"],
                    "model": result["model"]
                })
                
                print(f"✅ Erfolgreich erstellt: {assistant_data['name']}")
                print(f"   OpenAI ID: {result['id']}")
                print(f"   Modell: {result['model']}")
                print()
            else:
                print(f"❌ Fehler beim Erstellen von {assistant_data['name']}")
                print()
                
        except Exception as e:
            print(f"❌ Fehler beim Erstellen von {assistant_data['name']}: {e}")
            print()
    
    print("🎉 DUH AI Assistants wurden erstellt!")
    
    # Save to file for later use
    with open("duh_assistants_direct.json", "w") as f:
        json.dump(created_assistants, f, indent=2)
    
    print(f"📁 Assistenten-Informationen wurden in 'duh_assistants_direct.json' gespeichert")
    
    # List all created assistants
    print("\n📋 Übersicht aller erstellten Assistenten:")
    for assistant in created_assistants:
        print(f"   • {assistant['name']}")
        print(f"     OpenAI ID: {assistant['openai_id']}")
        print(f"     Modell: {assistant['model']}")
        print()

if __name__ == "__main__":
    asyncio.run(create_duh_assistants_direct())
