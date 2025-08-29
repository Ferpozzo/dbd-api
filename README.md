
# Dead by Daylight - Database (Modified Version)

**Modified by Luis Fernando Machado Pozzobon**  

Fetches new information from the [Dead by Daylight Wiki](https://deadbydaylight.fandom.com/wiki/Dead_by_Daylight_Wiki) every hour.  
*Original project by [Techial](https://github.com/Techial/DBD-Database). Thanks to the original author for creating the base project!*

---

## Features

- **Organized and reliable:** structured and normalized data for characters and perks.
- **Always up-to-date:** scrapes the Dead by Daylight Wiki every hour.
- **Unified character model:** uses a single Character model with discriminators for Survivors and Killers.
- **Improved perk model:** supports perks with or without an associated character and links them directly to Character documents.
- **Enhanced scraping:** robust HTML parsing for perks and characters, handling missing images or links.
- **Unified endpoints** unified endpoints to show all characters and perks without discriminators.
- **Ready for analytics:** structured models make it easy to calculate statistics like perk usage, win rates, and character combinations.

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

## Data Structure

### Perk
```json
{
  "_id": "mongoDB generated unique ObjectID",
  "name": "Perk display name (With space and all characters)",
  "URIName": "URL safe string (name of perk)",
  "iconURL": "Perk icon URL",
  "character": "ObjectID of Character perk belongs to - omitted if no character",
  "content": "Display text (with HTML elements) scraped from the Wiki",
  "contentText": "Same as \`content\` without HTML elements",
  "type": "survivor|killer"
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

## Support

If you find any missing information or bugs, feel free to open an issue or submit a pull request. All contributions are welcome!  

**Acknowledgements:** This project is based on the original [DBD-Database](https://github.com/Techial/DBD-Database) by Techial. Many thanks to the original author for creating a solid foundation.
