import mongoose from 'mongoose'
const { Schema } = mongoose

const perkSchema = new Schema({
  URIName: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  iconURL: { type: String, required: true },
  content: { type: String, required: true },
  contentText: { type: String, required: true },
  character: { type: Schema.Types.ObjectId, ref: 'Character', required: false },

  // Compatibility analisys
  categories: [{ type: String }],
  tags: [{ type: String }],
  vector: { type: Map, of: Number, default: {} }
}, { discriminatorKey: 'type', collection: 'perks', timestamps: true })

export const Perk = mongoose.model('Perk', perkSchema)

const survivorPerkSchema = new Schema({})
export const SurvivorPerk = Perk.discriminator('SurvivorPerk', survivorPerkSchema)

const killerPerkSchema = new Schema({})
export const KillerPerk = Perk.discriminator('KillerPerk', killerPerkSchema)

const synergySchema = new Schema({
  perk: { type: Schema.Types.ObjectId, ref: 'Perk', required: true },
  targetPerk: { type: Schema.Types.ObjectId, ref: 'Perk', required: true },
  similarity: { type: Number, required: true },
  type: { type: String, enum: ['Survivor', 'Killer'], required: true }
});

export const PerkSynergy = mongoose.model('PerkSynergy', synergySchema);