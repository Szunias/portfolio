import json

data_file = 'portfolio-next/src/data/portfolioData.json'

updates = {
    "shadow_frames": {
        "links": {
            "documentation": "assets/docs/Sound_Grp22_ShadowFrames.pdf"
        }
    },
    "pause_and_deserve": {
        "links": {
            "documentation": "assets/docs/2DAE12_Szuniewicz_Igor_Unreal_Proposal.pdf"
        }
    }
}

with open(data_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def update_list(lst):
    for p in lst:
        if p['id'] in updates:
            # Merge links
            if 'links' not in p: p['links'] = {}
            p['links'].update(updates[p['id']]['links'])
            print(f"Updated docs for {p['id']}")

update_list(data.get('featured_projects', []))
update_list(data.get('additional_projects', []))

with open(data_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
