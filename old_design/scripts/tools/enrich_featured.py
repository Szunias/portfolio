import json

data_file = 'portfolio-next/src/data/portfolioData.json'

updates = {
    "not_today_darling": {
        "media": {
            "thumbnail": "assets/images/projects-nottoday/highqualitythumbnail.jpg",
            "video": "https://www.youtube-nocookie.com/embed/6lFEvyicea0", # YouTube
            "images": [
                "assets/images/projects/NotTodayPic1.png",
                "assets/images/projects/NotTodayPic2.png",
                "assets/images/projects-nottoday/SoundClasses.png",
                "assets/images/projects-nottoday/MS_Pickup.png"
            ]
        },
        "full_description": "Solo audio designer on a 6-person student team. 320+ audio events, all built with MetaSounds.\n\nBuilt entirely on MetaSounds for procedural audio. Parameters drive real-time modulation, and priority-based mixing keeps the chaos under control. Released on itch.io in May 2025.",
        "code_snippets": [
            {
                "title": "Global UI Audio Manager (C++)",
                "language": "cpp",
                "description": "Centralized GameInstance subsystem to handle UI audio globally, preventing duplication across blueprints.",
                "code": "void UAudioManager::PlayUISelect()\n{\n    if (UISelectSound)\n    {\n        UGameplayStatics::PlaySound2D(GetWorld(), UISelectSound);\n    }\n}\n\nvoid UAudioManager::PlayUIHover()\n{\n    if (UIHoverSound)\n    {\n        UGameplayStatics::PlaySound2D(GetWorld(), UIHoverSound);\n    }\n}"
            },
            {
                "title": "Item Audio Switch (C++)",
                "language": "cpp",
                "description": "Determines which MetaSound to play based on the item type enum.",
                "code": "void UItemHolderComponent::PlayMetasound(EItemType ItemType) const\n{\n    switch (ItemType)\n    {\n    case EItemType::CreamPie:\n        if (PickupSound_CreamPie)\n            UGameplayStatics::PlaySound2D(this, PickupSound_CreamPie);\n        break;\n    case EItemType::Handpin:\n        if (PickupSound_HandPin)\n            UGameplayStatics::PlaySound2D(this, PickupSound_HandPin);\n        break;\n    }\n}"
            }
        ],
        "links": {
            "demo": "https://freyaspes.itch.io/not-today-darling",
            "video": "https://www.youtube.com/watch?v=6lFEvyicea0"
        }
    },
    "amorak": {
        "media": {
            "thumbnail": "assets/images/projects-amorak/amoraktitle.png",
            "video": "https://www.youtube.com/embed/VZgEK1CjlNM", # YouTube
            "images": [
                "assets/images/projects-amorak/basement.png",
                "assets/images/projects-amorak/creatureviewfrombasement.png",
                "assets/images/projects-amorak/chimneywithaknife.png"
            ]
        },
        "full_description": "World-building through immersive audio design and creature sound signatures. Atmospheric Horror.\n\nEvery creature growl, environmental layer, and spatial detail was crafted to create immersive tension that scales dynamically with the visuals.",
        "links": {
            "video": "https://www.youtube.com/watch?v=VZgEK1CjlNM"
        }
    },
    "transientica_audiolab": {
        "media": {
            "thumbnail": "assets/images/projects/maxresdefault.jpg",
            "video": "assets/videos/AudioLab_2425_Szuniewiczigor_NIMEorGAMEDemoVideo_Title.mp4", # Local
            "images": []
        },
        "full_description": "Real-time ML beatbox detection system. Control rhythm games with your voice.\n\nOptimized audio buffer sizes and ML inference pipeline to stay well below the 60ms threshold for rhythm games. Decoupled Python analysis and Unity gameplay communicating via UDP/OSC ensures zero frame drops.",
        "links": {}
    }
}

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_list(lst):
    for p in lst:
        if p['id'] in updates:
            p.update(updates[p['id']])
            print(f"Updated {p['id']}")

update_list(data.get('featured_projects', []))
update_list(data.get('additional_projects', []))

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Done.")
