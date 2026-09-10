require('dotenv').config();

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb')
const app = express();

// Serve all /public files
app.use(express.static('public'));

// DB connection string:
const dbUri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`;
const dbClient = new MongoClient(dbUri);
app.use(express.json()); // Parse JSON and urlencoded request bodies

const run = async () => {
  // Connect to DB
  await dbClient.connect();
  const dbCollection = await dbClient.db('a3-ryancarignan').collection('a3-ryancarignan-collection');

  // check for DB connection before each HTTP method call
  app.use( (req, res, next) => {
    if (dbCollection !== null) {
      next();
    } else {
      res.status(503).send();
    }
  })

  app.get('/dbtest', async (req, res) => {
    const result = await dbCollection.find({}).toArray();
    res.json(result);
  });

  app.post('/dbtest', async (req, res) => {
    const result = await dbCollection.insertOne(req.body);
    res.json(result);
  });

  app.put('/dbtest', async (req, res) => {
    const result = await dbCollection.updateOne(
      { _id: new ObjectId(req.body._id) },
      { $set: { name: req.body.name }} // assuming an object with a "name" field
    );
    res.json(result);
  });

  app.delete('/dbtest', async (req, res) => {
    const result = await dbCollection.deleteOne({
      _id: new ObjectId(req.body._id)
    });
    res.json(result);
  });
};

run();
app.listen(process.env.MY_PORT || 3000);
