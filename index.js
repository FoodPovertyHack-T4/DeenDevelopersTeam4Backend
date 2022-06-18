const { PrismaClient } = require('@prisma/client')
const { parseISO } = require('date-fns')
const prisma = new PrismaClient()

const express = require('express')
const app = express()
const port = process.env.PORT || 8080
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.get('/user', async (req, res) => {
    const getAllUsers = await prisma.users.findMany()
    res.json(getAllUsers)
})


app.get('/camp', async (req, res) => {
    const getAllCamps = await prisma.org.findMany()
    res.json(getAllCamps)
})

app.post('/camp',jsonParser, async (req, res) =>{
    console.log("adding new camp")
    const { Name} = req.body
    const creationDate = new Date()
    console.log("new date", creationDate)
    const camp = await prisma.org.create({
        data: {
          Name,
          creationDate
        },
      }).catch(error => {
          console.log(error)
      })
    res.json(camp)
})

app.post('/user',jsonParser ,async (req, res) => {
    console.log("in here with users")
    const { firstName, lastName, dob,campid,headOfFamily} = req.body
    console.log("the old date", dob)
    const dateParts = dob.split("/");
    const dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    const DOB = dateObject
    const user = await prisma.users.create({
      data: {
        firstName,
        lastName,
        DOB,
        campid,
        headOfFamily
      },
    }).catch(error => {
        console.log(error)
    })
    res.json(user)
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })