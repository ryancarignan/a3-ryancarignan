require('dotenv').config();

const express = require('express');
const cookie = require('cookie-session');
const { MongoClient, ObjectId } = require('mongodb')
const app = express();

// DB connection string:
const dbUri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`;
const dbClient = new MongoClient(dbUri);
app.use(express.json()); // Parse JSON and urlencoded request bodies

const run = async () => {
  // Connect to DB
  await dbClient.connect();
  const vehiclesColl = await dbClient.db('a3-ryancarignan').collection('vehicles');
  const usersColl = await dbClient.db('a3-ryancarignan').collection('users');

  // check for DB connection before each HTTP method call
  app.use((req, res, next) => {
    if (vehiclesColl !== null && usersColl !== null) {
      next();
    } else {
      res.status(503).send();
    }
  });

  /* LOGIN ------------------------------------------------ */

  // cookie middleware
  app.use(cookie({
    name: 'session',
    keys: [process.env.COOKIE_KEY_1, process.env.COOKIE_KEY_2],
  }));

  // Keep the login page and its assets publicly accessible.
  app.use('/login', express.static('public/login'));

  // redirect to login if not logged in
  app.use((req, res, next) => {
    if (
      (req.path === '/login' && req.method === 'POST') ||
      (req.path === '/create-account' && req.method === 'POST') ||
      (req.path === '/logout' && req.method === 'POST') ||
      (req.path === '/robots.txt' && req.method === 'GET')
    ) {
      next();
    } else if (req.session?.userId) {
      next();
    } else {
      res.redirect('/login/index.html');
    }
  });

  // Serve protected /public files after authentication.
  app.use(express.static('public'));

  // attempt to login
  app.post('/login', async (req, res) => {
    const user = await usersColl.findOne({
      username: req.body.username,
      password: req.body.password,
    });
    if (user) {
      req.session.userId = user._id.toString();
      res.redirect('/index.html');
    } else {
      res.status(401).send();
    }
  });

  // create a new account
  app.post('/create-account', async (req, res) => {
    if (!req.body.username || !req.body.password) {
      res.status(400);
      return;
    }
    const newUser = {
      username: req.body.username,
      password: req.body.password,
    };
    const alreadyExists = await usersColl.findOne(newUser);
    if (alreadyExists) {
      res.status(409).send();
      return;
    }
    const user = await usersColl.insertOne(newUser);
    req.session.userId = user.insertedId.toString();
    res.redirect('/index.html');
  });

  // log out
  app.post('/logout', (req, res) => {
    req.session = null;
    res.sendStatus(204);
  });

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
    const result = await vehiclesColl.find({ userId: req.session.userId }).toArray();
    res.json(result);
  });

  app.post('/vehicles', async (req, res) => {
    let vehicle = {
      userId: req.session.userId,
      year: req.body.year,
      model: req.body.model,
      mpg: req.body.mpg,
    };
    vehicle.val = estimateValue(vehicle);

    const result = await vehiclesColl.insertOne(vehicle);
    res.json(result);
  });

  app.put('/vehicles', async (req, res) => {
    let vehicle = {
      year: req.body.year,
      model: req.body.model,
      mpg: req.body.mpg,
    };
    vehicle.val = estimateValue(vehicle);

    const result = await vehiclesColl.updateOne(
      { 
        _id: new ObjectId(req.body._id),
        userId: req.session.userId,
      },
      { $set: vehicle }
    );
    res.json(result);
  });

  app.delete('/vehicles', async (req, res) => {
    const result = await vehiclesColl.deleteOne({
      _id: new ObjectId(req.body._id),
      userId: req.session.userId,
    });
    res.json(result);
  });
};

run();
app.listen(process.env.MY_PORT || 3000);
