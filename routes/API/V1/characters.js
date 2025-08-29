import express from 'express'

// Project imports
import { Character } from '../../../db/models/character.js'
import Prettify from '../../../utils/prettify.js'

// Create new router
const router = express.Router()

function handleRead (req, res) {
  const query = req.query
  Character.find(query).then((characters) => {
    try {
      res.status(200).send(Prettify._JSON(characters))
    } catch (error) {
      res.status(500).send(Prettify._JSON({ error }))
    }
  })
}

// Only READ (GET) until we have auth in place
router.get('/characters', handleRead)

// Read by ID
function handleReadById (req, res) {
  const id = req.params.id
  Character.findById(id).then((character) => {
      try {
        res.status(200).send(Prettify._JSON(character))
      } catch (error) {
        res.status(500).send(Prettify._JSON({ error }))
      }
  });
}
router.get('/characters/:id', handleReadById)

// Return router for Express to use as Middleware
export default router
