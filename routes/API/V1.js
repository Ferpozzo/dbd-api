import express from 'express'

import CharactersRouter from './v1/characters.js'

import KillersRouter from './v1/killers.js'
import SurvivorsRouter from './v1/survivors.js'

import PerkRouter from './v1/perks.js'

import KillerPerksRouter from './v1/killer_perks.js'
import SurvivorPerksRouter from './v1/survivor_perks.js'

const v1 = '/api/v1'

// Create new router
const router = express.Router()

router.use(v1, CharactersRouter)

router.use(v1, KillersRouter)
router.use(v1, SurvivorsRouter)

router.use(v1, PerkRouter)

router.use(v1, KillerPerksRouter)
router.use(v1, SurvivorPerksRouter)

// Return router for Express to use as Middleware
export default router
