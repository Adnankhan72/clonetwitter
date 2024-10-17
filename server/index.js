const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const requestIp = require('request-ip');
const useragent = require('user-agent');
const { MongoClient, ServerApiVersion } = require('mongodb');
const authRoutes = require('./authRoutes');
const uploadRoutes = require('./uploadRoutes');
const subscriptionRoutes = require('./subscriptionbackend');
const postRoutes = require('./routes/postroutes');

const uri = "mongodb+srv://adnankhan958975:admin@websitetweet.ztqhr.mongodb.net/";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use('/posts', postRoutes);

app.post('/api/save-login-history', (req, res) => {
  const { email, browserInfo, ipAddress } = req.body;
  console.log('Login History Saved:', { email, browserInfo, ipAddress });
  res.status(200).send({ message: 'Login history saved successfully' });
});

let usercollection;
let postcollection;

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("databaseName");
    usercollection = database.collection("users");
    postcollection = database.collection("posts");

    app.use((req, res, next) => {
      req.usercollection = usercollection;
      req.postcollection = postcollection;
      next();
    });

    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    
    app.use('/auth', authRoutes);
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    app.use('/upload', uploadRoutes);
    app.use('/subscriptions', subscriptionRoutes);

    app.post("/register", async (req, res) => {
      const user = req.body;
      const result = await req.usercollection.insertOne(user);
      res.send(result);
    });

    app.get("/loggedinuser", async (req, res) => {
      const email = req.query.email;
      const user = await req.usercollection.find({ email: email }).toArray();
      res.send(user);
    });

    app.post("/post", async (req, res) => {
      const post = req.body;
      const result = await req.postcollection.insertOne(post);
      res.send(result);
    });

    app.get("/post", async (req, res) => {
      const post = (await req.postcollection.find().toArray()).reverse();
      res.send(post);
    });

    app.get("/userpost", async (req, res) => {
      const email = req.query.email;
      const post = (
        await req.postcollection.find({ email: email }).toArray()
      ).reverse();
      res.send(post);
    });

    app.get("/user", async (req, res) => {
      const user = await req.usercollection.find().toArray();
      res.send(user);
    });

    app.patch("/userupdate/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const profile = req.body;
        const filter = { email };
        const updateDoc = { $set: profile };
        const result = await req.usercollection.updateOne(filter, updateDoc, { upsert: true });
        res.send(result);
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Error updating user");
      }
    });

    app.get("/", (req, res) => {
      res.send("Twiller is working");
    });

    app.listen(port, () => {
      console.log(`Twiller clone is working on port ${port}`);
    });

  } catch (error) {
    console.error("Connection Error:", error);
  }
}

run().catch(console.dir);
