const mongoose = require('mongoose')

if(process.argv.length<3) {
    console.log(
        'give password as argument'
    )
}

const password = process.argv[2]

const url = `mongodb+srv://quantumvector988:${password}@cluster0.crdhyjk.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

const name = process.argv[3]
const number = process.argv[4]

if (process.argv.length === 5) {
    const person = new Person({
        name: name,
        number: number,
    })
    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}

if (process.argv.length === 3) {
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}