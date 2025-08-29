import HTMLParser from 'node-html-parser'
import webReader from '../utils/web_reader.js'
import { Survivor, Killer } from '../db/models/character.js'

class charJobs {
  static #addURL = 'https://deadbydaylight.fandom.com'
  static #charactersURL = 'https://deadbydaylight.fandom.com/wiki/Characters'

  // Selectors simples: pega o span dentro do h2
  static #survivorsSelector = "span[id^='Survivors']"
  static #killersSelector = "span[id^='Killers']"

  static async #retrieveCharacters(selector) {
    if (!selector) return []

    const data = await webReader.readWebsite(this.#charactersURL)
    const parsedHTML = HTMLParser.parse(data)

    // 1️⃣ pega o h2 pai do span
    const h2 = parsedHTML.querySelector(selector)?.parentNode
    if (!h2) throw new Error(`H2 com seletor "${selector}" não encontrado`)

    const siblings = h2.parentNode.childNodes
    const h2Index = siblings.indexOf(h2)
    if (h2Index === -1) throw new Error('H2 não encontrado entre os filhos do pai')

    const Characters = []
    const isKiller = selector === this.#killersSelector

    // 2️⃣ percorre todos os irmãos até o próximo H2/H3
    for (let i = h2Index + 1; i < siblings.length; i++) {
      const sibling = siblings[i]
      if (!sibling.tagName) continue

      if (['H2','H3'].includes(sibling.tagName)) break

      // processa apenas containers que podem ter personagens
      if (['DIV'].includes(sibling.tagName)) {
        sibling.querySelectorAll('a').forEach(a => {
          const name = a.innerText.trim()
          if (!name) return

          const URIName = a.attributes.href.split('/').pop()
          const link = this.#addURL + a.attributes.href
          const killerName = isKiller ? a.parentNode.childNodes[1].innerText.split(' - ').pop().trim() : undefined
          const iconURL = sibling.querySelector('img')?.attributes['data-src'] || null

          Characters.push({ name, URIName, iconURL, killerName, link })
        })
      }
    }

    if (!Characters.length) throw new Error('Nenhum personagem encontrado')
    return Characters
  }

  static async retrieveSurvivors() {
    const survivors = await this.#retrieveCharacters(this.#survivorsSelector)
    const bulkOps = survivors.map(survivor => ({
      updateOne: { filter: { name: survivor.name }, update: survivor, upsert: true }
    }))
    await Survivor.bulkWrite(bulkOps)
    console.log('Successfully fetched Survivors.')
  }

  static async retrieveKillers() {
    const killers = await this.#retrieveCharacters(this.#killersSelector)
    const bulkOps = killers.map(killer => ({
      updateOne: { filter: { name: killer.name }, update: killer, upsert: true }
    }))
    await Killer.bulkWrite(bulkOps)
    console.log('Successfully fetched Killers.')
  }

  static async updateKillersAndSurvivors() {
    console.log('Updating character database...')
    await Promise.all([this.retrieveSurvivors(), this.retrieveKillers()])
    console.log('Successfully updated character database.')
  }
}

export default charJobs
