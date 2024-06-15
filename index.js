const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const cartCollection = client.db('wristcharm').collection('carts');





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

        //FOR HAVING ALL THE USER DATA FROM DB
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        // FOR HAVING ADMIN DATA WITH ACCORDING TO EMAIL
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'unauthorized access' })
            }
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user) {
                admin = user?.role === 'admin'
            }
            res.send({ admin })

        })


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


        // UPDATING DATA MAKE ADMIN OF AN USER FROM DB
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        // DELETING USER DATA FROM DB
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })



         // -------------------------
        // cart related API
        // -------------------------

        // GETTING PRODUCT DATA ACCORDING TO USER EMAIL
        app.get('/carts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        })


        //ITEM ADDED TO THE CART COLLECTION
        app.post('/carts', async (req, res) => {
            const cartItem = req.body;
            const result = await cartCollection.insertOne(cartItem);
            res.send(result);
        })

        // DELETING CART ITEM FROM DB
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
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
