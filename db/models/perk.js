import mongoose from 'mongoose'
const { Schema } = mongoose

const perkSchema = new Schema({
  URIName: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  iconURL: { type: String, required: true },
  content: { type: String, required: true },
  contentText: { type: String, required: true },
  character: { type: Schema.Types.ObjectId, ref: 'Character', required: false }
}, { discriminatorKey: 'type', collection: 'perks' })

export const Perk = mongoose.model('Perk', perkSchema)

const survivorPerkSchema = new Schema({})
export const SurvivorPerk = Perk.discriminator('SurvivorPerk', survivorPerkSchema)

const killerPerkSchema = new Schema({})
export const KillerPerk = Perk.discriminator('KillerPerk', killerPerkSchema)
