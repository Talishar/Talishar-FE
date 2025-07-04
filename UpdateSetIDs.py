import requests
import json
from unidecode import unidecode
import re

version_str = "super-slam"

ordered_sets = ['WTR', 'ARC', 'CRU', "MON", "ELE", "EVR", "UPR", "DVR", "RVD", "DYN", "OUT", "DTD", "TCC", "EVO", "HVY",
               "AKO", "MST", "ROS", "TER", "AIO", "AJV", "HNT", "AST", "AMX", "SEA", "AGB", "MPG", "ASR", "APR", "AVS", "BDD",
                "SMP"]
other_sets = ["AUR", "BOL", "FAB", "HER", "JDG", "LGS", "LSS", "ROG"]

setIds_loc = "./src/utils/multilanguage/collectionMaps/setIDs.ts"

raw_data_loc = f'https://raw.githubusercontent.com/the-fab-cube/flesh-and-blood-cards/refs/heads/{version_str}/json/english/card.json'
data = requests.get(raw_data_loc).json()

delimiter = "_"
def getCardIdentifier(name, pitch):
    ID = unidecode(name.lower().replace("//", delimiter)).replace(' ', delimiter)
    ID = ID.replace("-", delimiter)
    ID = re.sub(r'[^a-z0-9 _]', "", ID)
    suffix = ""
    if pitch == 1 or pitch == "1":
        suffix = "_red"
    elif pitch == 2 or pitch == "2":
        suffix = "_yellow"
    elif pitch == 3 or pitch == "3":
        suffix = '_blue'
    return ID+suffix

def ShouldDuplicate(card):
    hasAction, hasEquipment, hasInstant = False, False, False
    for t in card['types']:
        if t == "Action":
            hasAction = True
        elif t == "Equipment":
            hasEquipment = True
        elif t == "Instant":
            hasInstant = True
    return (hasAction and hasEquipment) or (hasInstant and hasEquipment)

card_dict = {}
inverted_dict = {}
for l in data:
    new_cardID = getCardIdentifier(l['name'], l['pitch'])
    set_ids = []
    for printing in l['printings']:
        set_ids.append(printing['id'])
        if 'double_sided_card_info' in printing and not printing['double_sided_card_info'][0]['is_front'] and printing['rarity'] != "T":
            set_num = 400+int(printing['id'][3:])
            old_cardID = printing['id'][:3] + str(set_num)
        else:
            old_cardID = printing['id']
        if new_cardID != "inner_chi_blue":
            card_dict[old_cardID] = new_cardID
        else:
            card_dict[old_cardID] = printing['id'] + "_" + new_cardID
        if ShouldDuplicate(l):
            set_num = 400+int(printing['id'][3:])
            dupe_old_cardID = printing['id'][:3] + str(set_num)
            card_dict[dupe_old_cardID] = new_cardID + "_equip"
    earliest_printing = sorted(set_ids, key = lambda x: ordered_sets.index(x[:3]) if x[:3] in ordered_sets else 100)[0]
    inverted_dict[new_cardID] = earliest_printing
    
with open(f'../card_dictionary_{version_str}.json', 'w+') as f:
    json.dump(card_dict, f)

# just a few exceptions that need to be hardcoded
inverted_dict['minerva_themis'] = "MON405"
inverted_dict['lady_barthimont'] = "MON406"
inverted_dict['the_librarian'] = "MON404"

inverted_dict['MST000_inner_chi_blue'] = 'MST400'
inverted_dict['MST010_inner_chi_blue'] = 'MST410'
inverted_dict['MST032_inner_chi_blue'] = 'MST432'
inverted_dict['MST053_inner_chi_blue'] = 'MST453'
inverted_dict['MST095_inner_chi_blue'] = 'MST495'
inverted_dict['MST096_inner_chi_blue'] = 'MST496'
inverted_dict['MST097_inner_chi_blue'] = 'MST497'
inverted_dict['MST098_inner_chi_blue'] = 'MST498'
inverted_dict['MST099_inner_chi_blue'] = 'MST499'
inverted_dict['MST100_inner_chi_blue'] = 'MST500'
inverted_dict['MST101_inner_chi_blue'] = 'MST501'
inverted_dict['MST102_inner_chi_blue'] = 'MST502'

inverted_dict['nitro_mechanoida'] = 'DYN492a'
inverted_dict['nitro_mechanoidb'] = 'DYN492b'
inverted_dict['nitro_mechanoidc'] = 'DYN492c'
inverted_dict['teklovossen_the_mechropotenta'] = "EVO410a"
inverted_dict['teklovossen_the_mechropotentb'] = "EVO410b"

inverted_dict['evo_steel_soul_memory_blue_equip'] = "EVO426"
inverted_dict['evo_steel_soul_processor_blue_equip'] = "EVO427"
inverted_dict['evo_steel_soul_controller_blue_equip'] = "EVO428"
inverted_dict['evo_steel_soul_tower_blue_equip'] = "EVO429"

with open(f'../inverted_card_dictionary_{version_str}.json', 'w+') as f:
    json.dump(inverted_dict, f)


file = "export const setIDs: { [index: string]: string } = {\n"

for key in inverted_dict:
    if key[:1].isdigit():
        row = f"'{key}': '{inverted_dict[key]}',\n" 
    else:
        row = f"{key}: '{inverted_dict[key]}',\n" 
    file += row
file = file[:-2] + '\n};'

with open(setIds_loc, 'w+') as f:
    f.write(file)