const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qxen6yj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        // DB COLLECTIONS
        const carouselCollection = client.db('wristcharm').collection('carousels');
        const categoryCollection = client.db('wristcharm').collection('categories');
        const productCollection = client.db('wristcharm').collection('products');
        const userCollection = client.db('wristcharm').collection('users');





        // CAROUSEL DATA FROM DB TO CLIENT SIDE
        app.get('/carousels', async (req, res) => {
            const result = await carouselCollection.find().toArray();
            res.send(result);
        })

        //CATEGORY DATA FORM DB TO CLIENT SIDE
        app.get('/category', async (req, res) => {
            const result = await categoryCollection.find().toArray();
            res.send(result);
        })

        //PRODUCTS DATA FROM DB TO CLIENT SIDE
        app.get('/products', async (req, res) => {
            const result = await productCollection.find().toArray();
            res.send(result);
        })

        //CATEGORY DATA ACCORDING TO CATEGORY NAME FORM DB TO CLENT SIDE
        app.get('/categories/:category', async (req, res) => {
            const category = req.params.category;
            const result = await productCollection.find().toArray();
            const newCategories = result.filter(ctg => ctg.category === category);
            res.send(newCategories);

        })




        // -------------------
        // USER related API
        // -------------------

        // inserting user info to DB
        app.post('/users', async (req, res) => {
            const user = req.body;
            // inserted user's email if it doesn't exist to DB
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })




        app.get('/', (req, res) => {
            res.send('wristcharm is ticking');
        })

        app.listen(port, () => {
            console.log(`WristCharm is ticking on port, ${port}`)
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
