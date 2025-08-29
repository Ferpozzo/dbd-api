import express from 'express'

// Project imports
import { KillerPerk } from '../../../db/models/perk.js'
import Prettify from '../../../utils/prettify.js'

// Create new router
const router = express.Router()

function handleRead (req, res) {
  const query = req.query
  KillerPerk.find(query).then((perks) => {
    try {
      res.status(200).send(Prettify._JSON(perks))
    } catch (error) {
      res.status(500).send(Prettify._JSON({ error }))
    }
  })
}

// Only READ (GET) until we have auth in place
router.get('/killer_perks', handleRead)

// Read by ID
function handleReadById (req, res) {
  const id = req.params.id
  KillerPerk.findById(id).then((perk) => {
      try {
        res.status(200).send(Prettify._JSON(perk))
      } catch (error) {
        res.status(500).send(Prettify._JSON({ error }))
      }
  });
}
router.get('/killer_perks/:id', handleReadById)


// Return router for Express to use as Middleware
export default router
