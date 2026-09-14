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

  /* BUSINESS LOGIC --------------------------------------- */
  const estimateValue = (item) => {
    const basePrice = 27500
    const depreciationRate = 0.075
    const avgMpg = 25

    const age = new Date().getFullYear() - item.year
    const mpg = item.mpg
    
    const ageFactor = (1 - depreciationRate) ** age
    const mpgFactor = Math.sqrt(mpg / avgMpg)

    return Math.round(basePrice * ageFactor * mpgFactor)
  };

  /* VEHICLE DB ACTIONS ----------------------------------- */

  app.get('/vehicles', async (req, res) => {
    const result = await dbCollection.find({}).toArray();
    res.json(result);
  });

  app.post('/vehicles', async (req, res) => {
    let vehicle = {
      year: req.body.year,
      model: req.body.model,
      mpg: req.body.mpg,
    };
    vehicle.val = estimateValue(vehicle);

    const result = await dbCollection.insertOne(vehicle);
    res.json(result);
  });

  app.put('/vehicles', async (req, res) => {
    let vehicle = {
      year: req.body.year,
      model: req.body.model,
      mpg: req.body.mpg,
    };
    vehicle.val = estimateValue(vehicle);

    const result = await dbCollection.updateOne(
      { _id: new ObjectId(req.body._id) },
      { $set: vehicle }
    );
    res.json(result);
  });

  app.delete('/vehicles', async (req, res) => {
    const result = await dbCollection.deleteOne({
      _id: new ObjectId(req.body._id)
    });
    res.json(result);
  });
};

run();
app.listen(process.env.MY_PORT || 3000);
