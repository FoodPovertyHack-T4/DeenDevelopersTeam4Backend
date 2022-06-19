const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
var cors = require('cors')

const express = require('express')
const app = express()
const port = process.env.PORT || 8080
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(cors())

app.get('/user', async (req, res) => {
    const getAllUsers = await prisma.users.findMany()
    res.json(getAllUsers)
})


app.get('/user/camp/:id', async(req,res) => {
    const id = parseInt(req.params.id);
    const getUsersFromCamp = await prisma.users.findMany({
        where: {
            campid: id
          }
    }).catch(error => {
        console.log("error fetching users from camp")
    })
    res.json(getUsersFromCamp)
})

app.get('/camp', async (req, res) => {
    const getAllCamps = await prisma.org.findMany()
    res.json(getAllCamps)
})

app.post('/camp', jsonParser, async (req, res) => {
    console.log("adding new camp")
    const { Name } = req.body
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

app.post("/provision", jsonParser, async (req, res) => {
    console.log("adding new provisions")
    const { Name } = req.body
    const provision = await prisma.provisions.create({
        data: {
            Name,
        },
    }).catch(error => {
        console.log(error)
    })
    res.json(provision)
})

app.get("/provision", jsonParser, async (req, res) => {
    const provision = await prisma.provisions.findMany()
    res.json(provision)
})

app.get("/notification", jsonParser, async (req, res) => {
    const notification = await prisma.notifications.findMany()
    res.json(notification)
})

app.post("/provision/add", jsonParser, async (req, res) => {
    const { provisionId,userId, quantitiy} = req.body
    const date = new Date()
    const provision = await prisma.provisionHistory.create({
        data: {
            provisionId,
            userId,
            date,
            quantitiy
        },
    }).catch(error => {
        console.log(error)
    })
    res.json(provision)
})


app.post("/notification", jsonParser, async (req, res) => {
    console.log("in here with notifications")
    const { familyId,provisionId } = req.body
    const notifyDate = new Date(Date.now() + 12096e5);
    const notification = await prisma.notifications.create({
        data: {
            familyId,
            provisionId,
            notifyDate
        },
    }).catch(error => {
        console.log(error)
    })
    res.json(notification)
})

app.post('/user', jsonParser, async (req, res) => {
    console.log("in here with users")
    const { firstName, lastName, dob, campid, headOfFamily } = req.body
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

app.post('/family', jsonParser, async (req, res) => {
    if(req.body == null){
        res.status(500);
    }

    const { mainFirstName, mainLastName, mainAge, campName, dependants } = req.body;

    // Add Camp
    const camp = await prisma.org.create({
        data: {
            'Name': campName,
            'creationDate': new Date()
        },
    }).catch(error => {
        console.log(error);
        res.status(500);
    })

    const campId = camp.campid;
    const familyId = Math.floor((Math.random() * 2000000000) + 1);
    
    const currentDate = new Date()

    let familyMembers = []
    familyMembers.push({
        'firstName' : mainFirstName,
        'lastName': mainLastName,
        'DOB': new Date(currentDate.getFullYear() - mainAge, currentDate.getMonth(), currentDate.getDay()),
        'headOfFamily': true,
        'familyId': familyId,
        'campid': campId
    })

    familyMembers = familyMembers.concat(
        dependants.map((dependant) => {
            dependant.DOB = new Date(currentDate.getFullYear() - dependant.DOB, currentDate.getMonth(), currentDate.getDay());
            dependant.familyId = familyId;
            dependant.headOfFamily = false;
            dependant.campid = campId;
            return dependant
    }))

    console.log(`Adding to users table: ${JSON.stringify(familyMembers)}`);

    const count = await prisma.users.createMany({
        data: familyMembers,
    }).catch(error => {
        console.log(error);
        res.status(500);
    })
    console.log(`Successfully added: ${JSON.stringify(count)}`)
    res.json(count);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})