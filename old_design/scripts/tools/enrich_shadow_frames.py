import json

data_file = 'portfolio-next/src/data/portfolioData.json'

# Rich content for Shadow Frames
rich_data = {
    "full_description": "A psychological horror game set in a 1960s Irish pub. Audio is not just atmospheric—it's the primary detection mechanic.\n\nDeveloped in collaboration with RITCS (Narrative) and KASK Conservatory (Music). My role focused on the entire audio pipeline: from recording foley to implementing complex Wwise systems in Unreal Engine C++.",
    "tags": ["Horror", "Wwise", "Unreal Engine C++", "Spatial Audio", "Game Audio"],
    "technologies": ["Unreal Engine 5", "Wwise", "C++", "Blueprints", "Reaper"],
    "code_snippets": [
        {
            "title": "Real-Time Parameter Control (C++)",
            "language": "cpp",
            "description": "Updates the Wwise RTPC for enemy proximity every tick. Normalized distance ensures consistent audio behavior regardless of map scale.",
            "code": "void UEnemyPresenceComponent::TickComponent(float DeltaTime...)\n{\n    // 1. Logic: Find closest enemy & calculate distance\n    UpdateClosestEnemy();\n\n    // 2. Math: Normalize distance to 0.0 - 100.0 range\n    float NormDist = (Distance - MinDist) / (MaxDist - MinDist);\n    float Proximity = FMath::Clamp((1.f - NormDist) * 100.f, 0.f, 100.f);\n\n    // 3. Audio: Update Wwise RTPC in real-time\n    UAkGameplayStatics::SetRTPCValue(\n        RTPC_EnemyProximity,\n        Proximity,\n        0, // Interpolation (handled by Wwise)\n        GetOwner()\n    );\n}"
        },
        {
            "title": "Physical Surface Detection",
            "language": "cpp",
            "description": "Raycasts downwards to detect the physical material and map it to a Wwise Switch Group for correct footstep sounds.",
            "code": "FName UFootstepComponent::DetectSurface()\n{\n    FHitResult Hit;\n    FVector Start = Location;\n    FVector End = Start - FVector(0, 0, 100);\n\n    bool bHit = World->LineTraceSingleByChannel(\n        Hit, Start, End, ECC_WorldStatic, Params\n    );\n\n    if (bHit && Hit.PhysMaterial.IsValid())\n    {\n        return GetSwitchFromPhysMat(Hit.PhysMaterial);\n    }\n\n    return \"Concrete\"; // Fallback\n}"
        }
    ],
    "media": {
        "thumbnail": "assets/images/projects-shadowframes/shadowframesconceptmenu.png",
        "video": "assets/images/projects-shadowframes/Menugif.mp4",
        "images": [
            "assets/images/projects-shadowframes/BP_PlayerOneshotAudioManager.png",
            "assets/images/projects-shadowframes/SwitchContainer.png",
            "assets/images/projects-shadowframes/bgshadow.jpeg",
            "assets/images/projects-shadowframes/nicedae.jpg"
        ]
    },
    "links": {
        "video": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", # Placeholder or use real one if found
        "documentation": "assets/images/projects-shadowframes/Sound_Grp22_ShadowFrames.pdf"
    }
}

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Helper to update project
def update_project(project_list):
    for p in project_list:
        if p['id'] == 'shadow_frames':
            p.update(rich_data)
            print("Updated Shadow Frames")
            return True
    return False

# Try updating in both lists
if not update_project(data.get('featured_projects', [])):
    update_project(data.get('additional_projects', []))

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Done.")
