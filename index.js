const { PrismaClient } = require('@prisma/client')
const { parseISO } = require('date-fns')
const prisma = new PrismaClient()

const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.get('/user', async (req, res) => {
    const getAllUsers = await prisma.users.findMany()
    res.json(getAllUsers)
})

app.post('/user',jsonParser ,async (req, res) => {
    console.log("in here with users")
    const { firstName, lastName, dob,campid} = req.body
    console.log("the old date", dob)
    const dateParts = dob.split("/");
    const dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    const DOB = dateObject
    const user = await prisma.users.create({
      data: {
        firstName,
        lastName,
        DOB,
        campid
      },
    }).catch(error => {
        console.log(error)
    })
    res.json(user)
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })