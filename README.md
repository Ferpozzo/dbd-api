
# Dead by Daylight - API

**Modified by Luis Fernando Machado Pozzobon**  

Fetches new information from the [Dead by Daylight Wiki](https://deadbydaylight.fandom.com/wiki/Dead_by_Daylight_Wiki) and generate suggestions of perk combos based on keywords.
*Original project by [Techial](https://github.com/Techial/DBD-Database). Thanks to the original author for creating the base scraper project!*

---

## Features

- **Organized and reliable:** structured and normalized data for characters and perks.
- **Always up-to-date:** scrapes the Dead by Daylight Wiki every hour.
- **Unified character model:** uses a single Character model with discriminators for Survivors and Killers.
- **Improved perk model:** supports perks with or without an associated character and links them directly to Character documents.
- **Enhanced scraping:** robust HTML parsing for perks and characters, handling missing images or links.
- **Unified endpoints** unified endpoints to show all characters and perks without discriminators.
- **Ready for analytics:** structured models make it easy to calculate statistics like perk usage, win rates, and character combinations.
- **Added feature to analyse perks using NLP** saving to database the categories and vectors of each perk, used to generate similarity  marker for each pair of perks
- **Suggest perks based on categories** using previous analyse to search by categories and generate 3 combos based on the highest similarities between perks
---

## API Endpoints

### Retrieve all characters
```
GET /API/v1/characters
```
Returns an array of Character objects.
### Retrieve one character
```
GET /API/v1/characters/:id
```
Returns an Character object.

### Retrieve Killers
```
GET /API/v1/killers
```
Returns an array of Killer objects.

### Retrieve one Killer
```
GET /API/v1/killers/:id
```
Returns an Killer objects.

### Retrieve Survivors
```
GET /API/v1/survivors
```
Returns an array of Survivor objects.

### Retrieve all Perks
```
GET /API/v1/perks
```
Returns an array of Perk objects.

### Retrieve one Perk
```
GET /API/v1/perks/:id
```
Returns an Perk object.

### Retrieve Killer Perks
```
GET /API/v1/killer_perks
```
Returns an array of Perk objects from all killers.

### Retrieve Survivor Perks
```
GET /API/v1/survivor_perks
```
### Suggest Combo Perks
```
GET /API/v1/suggest-perks?keywords=info,chase&type=Killer
GET /API/v1/suggest-perks?keywords=stealth,gen&type=Survivor
```

## Data Structure

### Perk
```json
{
  "_id": "68b2900e42ba57826f1f37bc",
  "type": "SurvivorPerk",
  "name": "Chemical Trap",
  "URIName": "Chemical_Trap",
  "categories": [
    "speed",
    "info",
    "gen",
    "chase",
    "debuff",
    "mobility"
  ],
  "character": "68b2900d42ba57826f1f3790",
  "content": "Content in html",
  "contentText": "This description",
  "createdAt": "2025-08-30T05:45:50.463Z",
  "iconURL": "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/9/9a/IconPerks_chemicalTrap.png/revision/latest?cb=20230808160213",
  "tags": [],
  "updatedAt": "2025-08-30T06:54:41.587Z",
  "vector": {
    "healing": 0,
    "speed": 1,
    "stealth": 0,
    "info": 2,
    "gen": 2,
    "chase": 4,
    "protection": 0,
    "debuff": 1,
    "hex": 0,
    "altruism": 0,
    "lategame": 0,
    "antituneling": 0,
    "mobility": 4,
    "mindgame": 0,
    "item": 0
    }
}
```
### Character
```json
{
  "_id": "mongoDB generated unique ObjectID",
  "name": "Character display name (With space and all characters)",
  "URIName": "URL safe string (name of survivor)",
  "iconURL": "Character image URL",
  "link": "Character URL at https://deadbydaylight.fandom.com/",
  "type": "Survivor | Killer"
}
```

### Survivor
```json
{
  "_id": "mongoDB generated unique ObjectID",
  "name": "Character display name (With space and all characters)",
  "URIName": "URL safe string (name of survivor)",
  "iconURL": "Character image URL",
  "link": "Character URL at https://deadbydaylight.fandom.com/",
  "type": "Survivor"
}
```

### Killer
```json
{
  "_id": "mongoDB generated unique ObjectID",
  "name": "Full Character name (With space and all characters)",
  "killerName": "Short name used in-game (e.g Trapper, Wraith etc)",
  "URIName": "URL safe string (name of Killer)",
  "iconURL": "Character image URL",
  "link": "Character URL at https://deadbydaylight.fandom.com/",
  "type": "Killer"
}
```
### Suggested Combo Perks
```json
[
  {
    "perks": [
      {
        "_id": "68b2900e42ba57826f1f37bc",
        "type": "SurvivorPerk",
        "name": "Chemical Trap",
        "URIName": "Chemical_Trap",
        "categories": [
          "speed",
          "info",
          "gen",
          "chase",
          "debuff",
          "mobility"
        ],
        "character": "68b2900d42ba57826f1f3790",
        "content": "Content in html",
        "contentText": "This description",
        "createdAt": "2025-08-30T05:45:50.463Z",
        "iconURL": "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/9/9a/IconPerks_chemicalTrap.png/revision/latest?cb=20230808160213",
        "tags": [],
        "updatedAt": "2025-08-30T06:54:41.587Z",
        "vector": {
          "healing": 0,
          "speed": 1,
          "stealth": 0,
          "info": 2,
          "gen": 2,
          "chase": 4,
          "protection": 0,
          "debuff": 1,
          "hex": 0,
          "altruism": 0,
          "lategame": 0,
          "antituneling": 0,
          "mobility": 4,
          "mindgame": 0,
          "item": 0
          }
      },
    ...
    ],
    "avgSimilarity": 71.62412
  }
]
```

## Support

If you find any missing information, bugs or improves, feel free to open an issue or submit a pull request. All contributions are welcome!
