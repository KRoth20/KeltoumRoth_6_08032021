const multer = require('multer');//gère les fichiers entrants avec destination et filename
const fs = require ('fs');//file system

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({ //config pour enregistrer sur le disque
  destination: (req, file, callback) => {//avec la destination
    callback(null, 'images');
  },
  filename: (req, file, callback) => { //avec quel nom
    const name = file.originalname.split(' ').join('_'); //nom avant l'extension, en éliminant les éventuels les espaces les remplacant par des underscores
    const random = Math.floor(Math.random() * Math.pow(10,10)).toString();
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);//mine_type = img.jpg par ex (on définit tous les cas)et on ajoute un timestamp + un point et l'extension
  }
});

module.exports = multer({storage: storage}).single('image');