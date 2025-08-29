import mongoose from 'mongoose'
const { Schema } = mongoose

const characterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  URIName: { type: String, required: true, unique: true },
  iconURL: { type: String, required: true },
  link: { type: String, required: true }
}, { discriminatorKey: 'type', collection: 'characters' })

export const Character = mongoose.model('Character', characterSchema)

const survivorSchema = new Schema({})
export const Survivor = Character.discriminator('Survivor', survivorSchema)

const killerSchema = new Schema({
  killerName: { type: String, required: true }
})
export const Killer = Character.discriminator('Killer', killerSchema)
