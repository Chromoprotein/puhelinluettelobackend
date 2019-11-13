const mongoose = require('mongoose')

const uniqueValidator = require('mongoose-unique-validator') //estää duplikaatit

const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.connect(url, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

//skeema määrittelee, millainen rakenne muistiinpanolla on
//required: true - nimen ja numeron varmistus mongoosen sisäisellä validoinnilla
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true //tämän pitää olla uniikki
  },
  number: {
    type: String,
    required: true
  },
  important: Boolean,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

//estää duplikaatit
personSchema.plugin(uniqueValidator, { message: 'name should be unique' });

//kokoelmaan muistiinpanot tallennetaan nimellä person
const Person = mongoose.model('Person', personSchema)

module.exports = mongoose.model('Person', personSchema)
