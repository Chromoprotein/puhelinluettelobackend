//käynnistys: node index.js

require('dotenv').config() //sisältää tietokannan osoitteen ja salasanan
const Person = require('./models/person') //Mongoose-moduulin käyttöönotto

//Express on ohjelmointirajapintakirjasto, joka helpottaa palvelimen koodin tekemistä Node.js:llä
const express = require('express')
const app = express()
app.use(express.static('build'))

//body parser auttaa pääsemään käsiksi pyynnon mukana lähetettyyn dataan eli bodyyn
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const cors = require('cors')

app.use(cors())

//loggausta tekevä middleware
const morgan = require('morgan')
app.use(morgan('tiny'))

//juuren tapahtumakäsittelijä
app.get('/', (request, response) => {
    response.send('<h1>Hello World! :)</h1>')
})

//infon tapahtumakäsittelijä
app.get('/info', (request, response) => {
  const infos = persons.length
  const date = new Date()
  response.send(`<p>Phonebook has info for ${infos} people</p> </p>${date}</p>`)
})

//kaikkien resurssien haku
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
})

//yksittäisen resurssin haku
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end() //olio ei löydy
      }
    })
    .catch(error => next(error)) //id väärässä muodossa
})

//resurssin poisto
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error)) //virheenkäsittelyn siirtäminen middlewareen
})

//uusien puhelinnumerojen lähettäminen
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
    important: body.important || false
  })

  person.save()
  .then(savedPerson => savedPerson.toJSON()) //formatointi  
  .then(savedAndFormattedPerson => {      
    response.json(savedAndFormattedPerson)    
  }) 
  .catch(error => next(error)) //nimen ja numeron varmistus mongoosen sisäisellä validoinnilla
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

//expressin virheidenkäsittelijä
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') { //virheellinen id-formaatti
    return response.status(400).send({ error: 'malformatted id' })
  } 
  else if (error.name === 'ValidationError') { //validointivirheet
    return response.status(400).json({ error: error.message })  
  }

  next(error) //oletusarvoiselle virheenkäsittelijälle
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})