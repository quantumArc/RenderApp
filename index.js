const express = require('express')
const app = express()
var morgan = require('morgan')
app.use(express.static('dist'))

// app.use(morgan('tiny'))

morgan.token('type', (request, response) => {
    if(request.method === 'POST') {
        return JSON.stringify(request.body)
    }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))

app.use(express.json())

const cors = require('cors')
app.use(cors())


let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const date = new Date()
    response.send(
        '<div>Phonebook has info for ' + persons.length + ' people</div> <br/>'+ date
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if(person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const generateId =() => {
    const maxId = persons.length > 0
    ? Math.max(...persons.map(person => Number(person.id)))
    : 0
    return String(maxId + 1)
}

const generateRandomId = () => {
    return Math.floor(Math.random() * 100000)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name || !body.number) {
        return response.status(400).json ({
            error: 'content missing'
        })
    }

    if(persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateRandomId(),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(person)
    response.json(person)
})

// Use the provided port or default to 3001
// const PORT = process.env.PORT || 3001 
const PORT = 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})