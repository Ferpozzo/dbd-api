import { stripHtml } from 'string-strip-html'
import HTMLParser from 'node-html-parser'
import webReader from '../utils/web_reader.js'
import { Character } from '../db/models/character.js'
import { SurvivorPerk, KillerPerk } from '../db/models/perk.js'

class perkJobs {
  static #addURL = 'https://deadbydaylight.fandom.com'
  static #perksURL = 'https://deadbydaylight.fandom.com/wiki/Perks'

  static #survivorPerksSelector = "span[id^='Survivor_Perks_']"
  static #killerPerksSelector = "span[id^='Killer_Perks_']"

  static async #retrievePerks(selector) {
    const data = await webReader.readWebsite(this.#perksURL)
    const parsedHTML = HTMLParser.parse(data)

    const span = parsedHTML.querySelector(selector)
    if (!span) throw new Error(`Span com seletor "${selector}" não encontrado`)

    const h3 = span.parentNode
    if (!h3 || h3.tagName !== 'H3') throw new Error('H3 pai não encontrado')

    let table = h3.nextElementSibling
    while (table && table.tagName !== 'TABLE') {
      table = table.nextElementSibling
    }
    if (!table) throw new Error('Tabela de perks não encontrada')

    const perks = []
    const isKiller = selector === this.#killerPerksSelector
    const tbody = table.querySelector('tbody')
    if (!tbody) throw new Error('Tabela sem tbody')

    for (const tr of tbody.querySelectorAll('tr')) {
      const ths = tr.querySelectorAll('th')
      const tds = tr.querySelectorAll('td')
      if (ths.length < 2 || tds.length < 1) continue

      const icon = ths[0].querySelector('a')
      const name = ths[1].querySelector('a')
      if (!icon || !name) continue

      const content = tds[0]
      const character = ths[2]?.querySelectorAll('a')[1]

      content.querySelectorAll('a').forEach(a => {
        if (a.rawAttributes.href && !a.rawAttributes.href.startsWith('http')) {
          a.setAttribute('href', this.#addURL + a.rawAttributes.href)
        }
      });

      let characterId = null
      if (character) {
        let characterDoc = null;
        if(character.attributes?.title === "The Troupe"){
          characterDoc = await Character.findOne({ name: {$regex: "Aestri Yazar &amp; Baermar Uraz"} });
        } else{
          characterDoc = await Character.findOne(isKiller ? { killerName: {$regex: character.attributes?.title} } : { name: {$regex: character.attributes?.title} });
        }
        if (characterDoc) characterId = characterDoc._id
      }
      if(!characterId && character?.attributes?.title){
        console.error(`Character not found for perk ${name.text}, character: ${character?.attributes?.title}`);  
      }

      perks.push({
        URIName: name.rawAttributes.href.split('/').pop(),
        name: name.text,
        iconURL: icon?.rawAttributes?.href || icon?.querySelector('img')?.rawAttributes?.src,
        content: content.innerHTML,
        contentText: stripHtml(content.innerHTML).result,
        character: characterId,
        isKiller
      })
    }

    if (!perks.length) throw new Error('Nenhum perk encontrado')
    return perks
  }

  static async retrieveSurvivorPerks() {
    const perks = await this.#retrievePerks(this.#survivorPerksSelector)
    const bulkOps = perks.map(perk => ({
      updateOne: { filter: { name: perk.name }, update: perk, upsert: true }
    }))
    await SurvivorPerk.bulkWrite(bulkOps)
    console.log('Successfully fetched Survivor perks.')
  }

  static async retrieveKillerPerks() {
    const perks = await this.#retrievePerks(this.#killerPerksSelector)
    const bulkOps = perks.map(perk => ({
      updateOne: { filter: { name: perk.name }, update: perk, upsert: true }
    }))
    await KillerPerk.bulkWrite(bulkOps)
    console.log('Successfully fetched Killer perks.')
  }

  static async updateKillerAndSurvivorPerks() {
    console.log('Updating perk database...')
    await Promise.all([this.retrieveSurvivorPerks(), this.retrieveKillerPerks()])
    console.log('Successfully updated perk database.')
  }
}

export default perkJobs
