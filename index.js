require('dotenv').config()
const express = require('express')
const Person  = require('./models/person')
const app = express()

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

var morgan = require('morgan')
app.use(express.static('dist'))
app.use(requestLogger)
app.use(express.json())

// app.use(morgan('tiny'))

morgan.token('type', (request, response) => {
    if(request.method === 'POST') {
        return JSON.stringify(request.body)
    }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))

const cors = require('cors')
app.use(cors())

//Route handler for root path('/') endpoint
// Update the route to handle both /api and /api/
app.get(['/api', '/api/'], (request, response) => {
    response.send(`<h1>Hello World!</h1>`)
})

//Route handler for 'api/notes' endpoint
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons) // Send persons array as JSON
    })
})


app.get('/info', async (request, response) => {
    const count =  await Person.countDocuments({})
    response.send( `
        <div>Phonebook has info for ${count} people</div> <br/>
        ${new Date()}`)
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))  // Add this error handling
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    const person = {
        name: name,
        number: number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            if(updatedPerson) {
                response.json(updatedPerson)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => {
            response.status(400).send({ error: 'malformatted id' })
        })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(errorHandler)
app.use(unknownEndpoint)

// Use the provided port or default to 3001
const PORT = process.env.PORT || 3001 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})