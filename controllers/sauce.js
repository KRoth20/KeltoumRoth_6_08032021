const Sauce = require ('../models/Sauce'); //utiliser le modèle Sauce
const fs = require('fs');//file systeme
const validator = require ('validator'); //empêcher les caractères spéciaux $ et = dans les champs de saisie

//POST//
exports.createSauce = (req, res, next) => {
  let createOk = true;
  const sauceObject = JSON.parse(req.body.sauce);//pour extraire l'objet json de sauce
  delete sauceObject._id;//on n'a pas besoin de l'Id qui est implémenté automatiquement
  let entriesArray = Object.values(sauceObject);
  for(value in entriesArray){//pour éviter les intrusions par l'insertion de caractères spéciaux dans les champs de saisie
    if(validator.contains(entriesArray[value].toString(),'$') || validator.contains(entriesArray[value].toString(),'=')){
      console.log(entriesArray[value] + " : ce texte est invalide");
      createOk = false;
    }
  }
  if (createOk){
    const sauce = new Sauce({
      ...sauceObject,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: [],
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`//récupérer les segments dynamiques où se trouve notre image
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Sauce enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  }
  else{
    res.status(401).json({ error: 'Certains caractères ne sont pas autorisés' });
  }
};

//PUT // 
exports.modifySauce = (req, res, next) => {
  let createOk = true;
  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];// Supprime l'ancienne image
        fs.unlink(`images/${filename}`, (err) => {
          if (err) throw err;
        });
      })
      .catch(error => res.status(400).json({ error }));
  }
  // Met à jour l'image et les infos
  const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  let entriesArray = Object.values(sauceObject);
  for(value in entriesArray){
    if(validator.contains(entriesArray[value].toString(),'$') || validator.contains(entriesArray[value].toString(),'=')){
      console.log(entriesArray[value] + " : ce texte est invalide");
      canSave = false;
    }
  }
  // Si toutes les entrées sont correctes
  if(createOk){
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
      .catch(error => res.status(400).json({ error }));
  } else{
    res.status(401).json({ error: 'Certains caractères ne sont pas autorisés' });
  }
};

//DELETE//
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];//on splite en un tableau de 2 élements,autour de/images/ et on récupère le 2e élément donc le nom du fichier
      fs.unlink(`images/${filename}`, () => { //unlink pour supprimer le fichier
        Sauce.deleteOne({ _id: req.params.id }) //on supprime l'objet relié au fichier
          .then(() => res.status(200).json({ message: 'Sauce supprimée!'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

//GET//
exports.getOneSauce = (req, res, next) => { //affiche une sauce en gros plan
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          res.status(200).json(sauce)
        })
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauce =  (req, res, next) => { //affiche toutes les sauces
    Sauce.find()
        .then((sauces) => {
          res.status(200).json(sauces)
        }) //things = collection de thing
        .catch(error => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => { //permet de liker ou disliker
  const userId = req.body.userId;
  if (req.body.like === -1) { //disliked
    const userId = req.body.userId;

    Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 } })
      .then(() => res.status(200).json({ message: " Sauce aimée !" }))
      .catch((error) => res.status(400).json({ error }));

    Sauce.updateOne(
      { _id: req.params.id },
      { $push: { usersDisliked: userId } }
    )
      .then(() =>
        res.status(200).json({
          message: " Sauce non aimée !",
        })
      )
      .catch((error) => res.status(400).json({ error }));
  }

  if (req.body.like === 1) {
    Sauce.updateOne(
      { _id: req.params.id },
      { $push: { usersLiked: userId }, $inc: { likes: 1 } } //liked
    )
      .then(() => res.status(200).json({ message: " Sauce aimée !" }))
      .catch((error) => res.status(400).json({ error }));
  }

  if (req.body.like === 0) {
    const sauceId = req.params.id;
    Sauce.findOne({ _id: req.params.id }) //enlever le like ou le dislike
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
          )
            .then(() => res.status(200).json({ message: "Like retiré !" }))
            .catch((error) => res.status(400).json({ error }));
        }
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
          )
            .then(() => res.status(200).json({ message: "Dislike retiré !" }))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(404).json({ error }));
  }
};


  
