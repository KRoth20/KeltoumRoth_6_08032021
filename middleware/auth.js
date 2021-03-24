const jwt = require('jsonwebtoken');// vérifie que les requêtes proviennent bien du même utilisateur (un consommateur ne pourra pas supprimer la sauce qu'un autre a créé)

module.exports = (req, res, next) => {
  try { //try et catch pour envisager toutes les erreurs
    const token = req.headers.authorization.split(' ')[1]; //on récupère le 2e élément du tableau en splitant l'espace devant la clé (1er élément =bearer, 2e élément) si erreur = catch
    const decodedToken = jwt.verify(token, process.env.TOKEN);//on vérifie le Token avec la clé secrète, si erreur =catch
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) { // on vérifie si c'est le bon useriD dans la requête que Token, sinon =catch
      throw 'Invalid user ID';//vérifie si l'Id est valide
    } else {
      next();
    }
  } catch {
    res.status(401).json({ // 401 pour erreur authentification
      error: new Error('Invalid request!')
    });
  }
};