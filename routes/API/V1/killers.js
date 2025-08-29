import express from 'express'

// Project imports
import { Killer } from '../../../db/models/character.js'
import Prettify from '../../../utils/prettify.js'

// Create new router
const router = express.Router()

function handleRead (req, res) {
  const query = req.query
  Killer.find(query).then((killers) => {
    try {
      res.status(200).send(Prettify._JSON(killers))
    } catch (error) {
      res.status(500).send(Prettify._JSON({ error }))
    }
  })
}

// Only READ (GET) until we have auth in place
router.get('/killers', handleRead)

// Read by ID
function handleReadById (req, res) {
  const id = req.params.id
  Killer.findById(id).then((killer) => {
      try {
        res.status(200).send(Prettify._JSON(killer))
      } catch (error) {
        res.status(500).send(Prettify._JSON({ error }))
      }
  });
}
router.get('/killers/:id', handleReadById)

// Return router for Express to use as Middleware
export default router
