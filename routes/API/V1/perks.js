import express from 'express'
import { Perk, PerkSynergy } from '../../../db/models/perk.js'
import Prettify from '../../../utils/prettify.js'

const router = express.Router()

// GET /perks - retorna todos perks
function handleRead(req, res) {
  const query = req.query
  Perk.find(query)
    .then((perks) => {
      try {
        res.status(200).send(Prettify._JSON(perks))
      } catch (error) {
        res.status(500).send(Prettify._JSON({ error }))
      }
    })
}

// GET /perks/:id - retorna perk por ID
function handleReadById(req, res) {
  const id = req.params.id
  Perk.findById(id)
    .then((perk) => {
      try {
        res.status(200).send(Prettify._JSON(perk))
      } catch (error) {
        res.status(500).send(Prettify._JSON({ error }))
      }
    })
}

// GET /suggest-perks?keywords=healing,chase&type=Survivor
async function handleSuggest(req, res) {
  try {
    const keywords = (req.query.keywords || '')
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean)
    if (!keywords.length)
      return res.status(400).send(Prettify._JSON({ error: 'No keywords provided' }))

    const type = req.query.type
      ? req.query.type.charAt(0).toUpperCase() + req.query.type.slice(1).toLowerCase()
      : null
    if (!['Survivor', 'Killer'].includes(type))
      return res.status(400).send(Prettify._JSON({ error: 'Invalid or missing type parameter' }))

    const perks = await Perk.find({
      $and: keywords.map((k) => ({ [`vector.${k}`]: { $gt: 0 } }))
    })
    if (!perks.length)
      return res.status(404).send(Prettify._JSON({ error: 'No perks match the keywords and type' }))

    const perkIds = perks.map(p => p._id)
    const synergies = await PerkSynergy.find({
      type,
      perk: { $in: perkIds },
      targetPerk: { $in: perkIds }
    })

    const results = []
    const topN = 10
    const perkMap = new Map(perks.map(p => [p._id.toString(), p]))
    const neighborsMap = new Map()
    for (const perk of perks) {
      const neighbors = synergies
        .filter(s => s.perk.equals(perk._id))
        .sort((a,b) => b.similarity - a.similarity)
        .slice(0, topN)
        .map(s => perkMap.get(s.targetPerk.toString()))
        .filter(Boolean)
      neighborsMap.set(perk._id.toString(), neighbors)
    }

    const seenCombos = new Set()

    for (const perkA of perks) {
      const neighborsA = neighborsMap.get(perkA._id.toString())
      for (let i = 0; i < neighborsA.length; i++) {
        const perkB = neighborsA[i]
        const neighborsB = neighborsMap.get(perkB._id.toString())
          .filter(p => p._id.toString() !== perkA._id.toString())
        for (let j = 0; j < neighborsB.length; j++) {
          const perkC = neighborsB[j]
          const neighborsC = neighborsMap.get(perkC._id.toString())
            .filter(p => ![perkA._id.toString(), perkB._id.toString()].includes(p._id.toString()))
          for (let k = 0; k < neighborsC.length; k++) {
            const perkD = neighborsC[k]
            const combo = [perkA, perkB, perkC, perkD]

            const comboKey = combo.map(p => p._id.toString()).sort().join('-')
            if (seenCombos.has(comboKey)) continue
            seenCombos.add(comboKey)

            // soma similarity entre cada par
            let similaritySum = 0
            let pairCount = 0
            for (let a = 0; a < 4; a++) {
              for (let b = a + 1; b < 4; b++) {
                const s = synergies.find(sy =>
                  (sy.perk.equals(combo[a]._id) && sy.targetPerk.equals(combo[b]._id)) ||
                  (sy.perk.equals(combo[b]._id) && sy.targetPerk.equals(combo[a]._id))
                )
                if (s) similaritySum += s.similarity
                pairCount++
              }
            }

            const avgSimilarity = pairCount > 0 ? (similaritySum / pairCount) * 100 : 0
            results.push({
              perks: combo,
              avgSimilarity: parseFloat(avgSimilarity.toFixed(5)) // arredonda 5 casas decimais
            })
          }
        }
      }
    }

    results.sort((a,b) => b.avgSimilarity - a.avgSimilarity)
    const top3 = results.slice(0,3)

    res.status(200).send(Prettify._JSON(top3))
  } catch(err) {
    console.error('Error generating perk suggestions:', err)
    res.status(500).send(Prettify._JSON({ error: err.message }))
  }
}


router.get('/perks', handleRead)
router.get('/perks/:id', handleReadById)
router.get('/suggest-perks', handleSuggest)

export default router
