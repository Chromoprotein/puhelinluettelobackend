//Express on ohjelmointirajapintakirjasto, joka helpottaa palvelimen koodin tekemistä Node.js:llä
const express = require('express')
const app = express()

//body parser auttaa pääsemään käsiksi pyynnon mukana lähetettyyn dataan eli bodyyn
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const cors = require('cors')

app.use(cors())

app.use(express.static('build'))

//loggausta tekevä middleware
const morgan = require('morgan')
app.use(morgan('tiny'))

let persons = [  
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
      },  
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },  
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      }
    ]

//juuren tapahtumakäsittelijä
app.get('/', (req, res) => {
    res.send('<h1>Hello World! :)</h1>')
})

//infon tapahtumakäsittelijä
app.get('/info', (req, res) => {
  const infos = persons.length
  const date = new Date()
  res.send(`<p>Phonebook has info for ${infos} people</p> </p>${date}</p>`)
})

//kaikkien resurssien haku
app.get('/api/persons', (req, res) => {
    res.json(persons)
})

//yksittäisen resurssin haku
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {    
      response.json(person)  
  } 
  else {    
      response.status(404).end()  
  }
})

//resurssin poisto
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

//uusien puhelinnumerojen lähettäminen
const generateId = (min, max) => {
  return Math.floor(Math.random() * Math.floor(99999));
}

app.post('/api/persons', (request, response) => {
  //käyttää body parseria
  const body = request.body

  //nimi puuttuu
  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  //nimi on jo luettelossa
  const duplicate = persons.find(person => person.name === body.name)
  if(duplicate) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  //numero puuttuu
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    important: body.important || false,
    id: generateId()
  }

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})