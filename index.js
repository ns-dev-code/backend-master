import Vonage from '@vonage/server-sdk';
import dotenv from 'dotenv'
dotenv.config();

// init server
import express from 'express';
const app = express();
import bodyParser from 'body-parser';
app.use(bodyParser.json());

app.use((req, res, next) => {
  //allow access to current url. work for https as well
  res.setHeader('Access-Control-Allow-Origin', req.header('Origin'));
  res.removeHeader('x-powered-by');
  //allow access to current method
  res.setHeader('Access-Control-Allow-Methods', req.method);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
})

const nexmo = new Vonage(
  {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    applicationId: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
  },
  { debug: true },
);

/**
 * @description Generate user token
 */
app.post('/getJWT', function (req, res) {
  const jwt = nexmo.generateJwt({
    sub: req.body.name,
    acl: {
      paths: {
        '/*/users/**': {},
        '/*/conversations/**': {},
        '/*/sessions/**': {},
        '/*/devices/**': {},
        '/*/image/**': {},
        '/*/media/**': {},
        '/*/applications/**': {},
        '/*/push/**': {},
        '/*/knocking/**': {},
        '/*/legs/**': {},
      },
    },
  });
  res.send({ jwt: jwt });
});

/**
 * @description the client calls this endpoint to get a list of all users in the Nexmo application
 */
app.get('/getUsers', function (req, res) {
  nexmo.users.get({ ...req.query }, (err, response) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.send({ users: response?._embedded?.data?.users });
    }
  });
});

/**
 * @description the client calls this endpoint to get a list of all conversations in the Nexmo application
 */
app.get('/getConversations', function (req, res) {
  nexmo.conversations.get({}, (err, response) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.send({ conversations: response?._embedded?.data?.conversations });
    }
  })
});

/**
 * @description  the client calls this endpoint to create a new conversation in the Nexmo application,
 *  passing it a name and optional display name
 */
app.post('/createConversation', function (req, res) {
  nexmo.conversations.create(
    {
      name: req.body.name,
      display_name: req.body.display_name || req.body.name,
    },
    (err, response) => {
      if (err) {
        return res.status(400).send(err?.body);

      } else {
        res.send({ id: response });
      }
    },
  );
});

/**
 * @description  the client calls this endpoint to create a new user in the Nexmo application,
 *  passing it a username and optional display name
 */
app.post('/createUser', function (req, res) {
  nexmo.users.create(
    {
      name: req.body.name,
      display_name: req.body.display_name || req.body.name,
    },
    (err, response) => {
      if (err) {
        return res.status(400).send(err?.body);
      } else {
        res.send({ id: response.id });
      }
    },
  );
});

/**
 * @description endpoint to delete user
 */
app.delete('/deleteUser', function (req, res) {
  const userId = req?.query?.userId
  nexmo.users.delete(userId, (err, response) => {
    if (err) {
      return res.status(400).send(err?.body);
    } else {
      res.send(response);
    }
  })
})

// listen for requests :)
app.listen(process.env.PORT || 4000);

