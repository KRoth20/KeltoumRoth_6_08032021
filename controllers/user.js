const bcrypt = require ('bcrypt'); //crypte le mot de passe
const jwt = require('jsonwebtoken'); // vérifie que les requêtes proviennent bien du même utilisateur (un consommateur ne pourra pas supprimer la sauce qu'un autre a créé)
const CryptoJS = require ('crypto-js'); //crypte les données sensibles dans la BDD (email et mot de passe)
const validator = require ('validator');//empêcher les caractères spéciaux $ et = dans les champs de saisie
const User = require ('../models/User'); //utilise le modèle User



exports.signup = (req, res, next) => {//s'inscrire
    if(validator.isEmail(req.body.email,{blacklisted_chars:'$=""'})){
    bcrypt.hash(req.body.password, 10) //on demande de "hasher" 10x
    .then(hash => { // méthode async
      const user = new User({ //on utilise notre modèle
        email: CryptoJS.MD5(req.body.email).toString(), //récupère l'adresse mail passée dans la requête, et la crypte
        password: hash //mot de passe obtenu crypté
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' })) //201 creation de ressource
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error })); //erreur serveur
    }
    else{
      res.status(400).json({ error: "Le format de l'adresse n'est pas correct" })
    }
};

exports.login = (req, res, next) => { //se connecter
    let cryptedMail = CryptoJS.MD5(req.body.email).toString();
    User.findOne({ email: cryptedMail})//on rercherche l'utilisateur avec son email (qui est unique)
    .then(user => {
      if (!user) { // si on ne trouve pas l'user erreur "non autorisé" 401
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => { //pour comparer le mot de passe saisi avec le hash enregistré dans la BDD
          if (!valid) { //si la comparaison a retourné false
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({ //si la comparaison retourne true génère un Token =chaine de caractère (pas encore crypté)
            userId: user._id,
            token: jwt.sign( 
                { userId: user._id },//1er argument: donnéees qu'on veut encoder (payload) avec "sign" (utilisateur unique avec Id)
                process.env.TOKEN,//2e argument: clé secrète
                { expiresIn: '24h' } //3e argument: configuration de l'expiration du Token
            )
            });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};