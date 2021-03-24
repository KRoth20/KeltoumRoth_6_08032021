const dotenv= require ('dotenv');//utilisation de variables pour masquées les données sensibles
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); //met en relation les headers du localHost 3000 avec ceux du localHost 4200
const {expressShield} = require('node-shield');//protection OWASP pour Node
const helmet = require('helmet'); //sécurise les headers HTTP pour éviter les intrusions par le biais des données en transit
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');


mongoose.connect('mongodb+srv://'+ process.env.DB_USER +':'+ process.env.DB_PASS +'@cluster0.g7omk.mongodb.net/test?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//     next();
//   });

const app = express();
app.use(helmet());
app.use(cors());
app.use(
  expressShield({
    errorHandler: (shieldError, req, res, next) => {
      console.error(shieldError);
      res.sendStatus(400);
    },
  })
);
app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));//Cela indique à Express qu'il faut gérer la ressource images de manière statique (un sous-répertoire de notre répertoire de base, __dirname ) à chaque fois qu'elle reçoit une requête vers la route /images

app.use('/files',express.static(path.join(__dirname,'files')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;