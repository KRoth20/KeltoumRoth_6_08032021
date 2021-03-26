const Sauce = require ('../models/Sauce'); //utiliser le modèle Sauce
const fs = require('fs');//file systeme
const validator = require ('validator'); //empêcher les caractères spéciaux $ et = dans les champs de saisie

//POST//Capture et enregistre l'image, analyse la sauce en utilisant une chaîne de caractères et l'enregistre dans la base de données, en définissant correctement son image URL. Remet les sauces aimées et celles détestées à 0, et les sauces usersliked et celles usersdisliked aux tableaux vides.

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

//PUT // Met à jour la sauce avec l'identifiant fourni. Si une image est téléchargée, capturez-la et mettez à jour l'image URL des sauces. Si aucun fichier n'est fourni, les détails de la sauce figurent directement dans le corps de la demande (req.body.name, req.body.heat etc). Si un fichier est fourni, la sauce avec chaîne est en req.body.sauce.

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

//DELETE//Supprime la sauce avec l'ID fourni.
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
exports.getOneSauce = (req, res, next) => { //Renvoie la sauce avec l'ID fourni
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          res.status(200).json(sauce)
        })
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauce =  (req, res, next) => { //Renvoie le tableau de toutes les sauces dans la base de données
    Sauce.find()
        .then((sauces) => {
          res.status(200).json(sauces)
        }) //things = collection de thing
        .catch(error => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => { //Définit le statut "j'aime" pour userID fourni. Si j'aime = 1, l'utilisateur aime la sauce. Si j'aime = 0, l'utilisateur annule ce qu'il aime ou ce qu'il n'aime pas. Si j'aime = -1, l'utilisateur n'aime pas la sauce. L'identifiant de l'utilisateur doit être ajouté ou supprimé du tableau approprié, en gardant une trace de ses préférences et en l'empêchant d'aimer ou de ne pas aimer la même sauce plusieurs fois. Nombre total de "j'aime" et de "je n'aime pas" à mettre à jour avec chaque "j'aime".
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


  
