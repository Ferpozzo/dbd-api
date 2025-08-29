import express from 'express'

// Project imports
import { Survivor } from '../../../db/models/character.js'
import Prettify from '../../../utils/prettify.js'

// Create new router
const router = express.Router()

function handleRead (req, res) {
  const query = req.query
  Survivor.find(query).then((survivors) => {
    try {
      res.status(200).send(Prettify._JSON(survivors))
    } catch (error) {
      res.status(500).send(Prettify._JSON({ error }))
    }
  })
}

// Only READ (GET) until we have auth in place
router.get('/survivors', handleRead)

// Read by ID
function handleReadById (req, res) {
  const id = req.params.id
  Survivor.findById(id).then((survivor) => {
      try {
        res.status(200).send(Prettify._JSON(survivor))
      } catch (error) {
        res.status(500).send(Prettify._JSON({ error }))
      }
  });
}
router.get('/survivors/:id', handleReadById)

// Return router for Express to use as Middleware
export default router
