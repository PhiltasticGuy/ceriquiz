const express = require("express");
// const cors = require('cors');
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongo = require("mongodb");
const mongoClient = mongo.MongoClient;
const pgClient = require("pg");
var crypto = require("crypto");

// Chargement des variables d'environnement.
const configResult = dotenv.config();

// Terminer l'exécution immédiatement s'il est impossible de charger les
// variables d'environnement.
if (configResult.error) {
  throw configResult.error;
}

// Constantes
const PORT = process.env.PORT_NODE || 3021;
const ANGULAR_FILES = "/ceriquiz-spa/dist/ceriquiz-spa/";

const app = express();

// Configuration du module 'body-parser' pour parser les données des POST.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "10mb" }));
// app.use(cors({credentials: true}));
// app.use(cors());

// Configuration du serveur MongoDB.
const dsnMongoDb = "mongodb://127.0.0.1:27017/db";

// Configuration des sessions sur MongoDB.
var store = new MongoDBStore({
  uri: dsnMongoDb,
  collection: "mySessions3022",
  touchAfter: 24 * 3600
});
store.on("error", function (error) {
  console.log(error);
});
app.use(session({
  secret: "Security through obscurity!",
  // secret: "",
  saveUninitialized: false,
  resave: false,
  store: store,
  cookie: { maxAge: 24 * 3600 * 1000, httpOnly: true, secure: false }
}));

// Pool de connection à la base de donnée PostgreSQL.
const pgPool = new pgClient.Pool({
  user: process.env.POSTGRESQL_USERNAME,
  password: process.env.POSTGRESQL_PASSWORD,
  host: process.env.POSTGRESQL_HOST,
  port: process.env.POSTGRESQL_PORT,
  database: process.env.POSTGRESQL_DATABASE
});

// Gestion des requêtes pour les ressources statiques.
app.use(express.static(path.join(__dirname, ANGULAR_FILES)));

// Gestion de méthode GET sur '/'.
app.get("/", function (request, response) {
  // Terminer la requête en retournant la page index.html.
  response.sendFile(path.join(__dirname, ANGULAR_FILES, "index.html"));
});

// Gestion de méthode POST sur '/login'.
app.post("/api/auth/login", function (request, response) {
  console.log(`[POST: /api/auth/login] - Start`);

  // Extraire l'information de la requête HTTP afin de la traiter.
  const username = request.body.username;
  const password = request.body.password;

  // Afficher le contenu JSON transmis par la requête HTTP dans la console.
  console.log(JSON.stringify(request.body));

  // Demander au pool un client connecté à la BD pour notre requête.
  pgPool.connect(function (err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server.\n\n" + err.stack);
      response.sendStatus(500);
    }
    else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL retournant le mot de passe hashé de l'utilisateur.
      const sql = `SELECT * FROM fredouil.users WHERE identifiant=$1;`;

      client.query(sql, [ username ], (err, res) => {
        // Utiliser SHA1 afin de calculer le hash du mot de passe.
        const hashedPassword = crypto
          .createHash("sha1")
          .update(password)
          .digest("hex");

        if (err) {
          console.log("Error executing SQL query.\n\n" + err.stack);
          response.sendStatus(500);
        }
        else if (res.rows.length > 0 && res.rows[0].motpasse == hashedPassword) {
          // Créer la session pour cet utilisateur valide.
          let data = {
            authenticated: true,
            id: res.rows[0].id,
            username: username,
            firstname: res.rows[0].prenom,
            lastname: res.rows[0].nom,
            newLoginDate: new Date(),
          };
          request.session.user = data;

          setConnectedFlag(data.id, true);
          emitPlayerConnected({ id: data.id, username: data.username });

          console.log(
            `${request.session.id} expire dans ${request.session.cookie.maxAge}`
          );

          // Terminer la requête en retournant le data.
          response.send(request.session.user);
        }
        else {
          console.log("Invalid user credentials.");
          response.sendStatus(401);
        }
      });
      client.release();
    }
  });
});

app.get("/api/profile/:userId", function (request, response) {
  console.log(`[GET: /api/profile/${request.params.userId}] - (UserId: ${request.session.user.id}, Username: ${request.session.user.username})`);

  // Extraire l'information de la requête HTTP afin de la traiter.
  const userId = request.params.userId;

  pgPool.connect(function (err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server.\n\n" + err.stack);
      response.sendStatus(500);
    } 
    else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL retournant le mot de passe hashé de l'utilisateur.
      const sql = `SELECT * FROM fredouil.users WHERE id=$1;`;

      client.query(sql, [userId],  (err, res) => {
        if (err) {
          console.log("Error executing SQL query.\n\n" + err.stack);
          response.sendStatus(500);
        }
        else if (res.rows.length > 0) {
          // Créer la session pour cet utilisateur valide.
          const data = {
            username: res.rows[0].identifiant,
            lastname: res.rows[0].nom,
            firstname: res.rows[0].prenom,
            dateBirth: res.rows[0].date_naissance,
            avatarUrl: res.rows[0].avatar,
            status: res.rows[0].humeur,
            isConnected: (res.rows[0].statut_connexion === 1),
            scores: [],
            medals: []
          };
          
          // Charger l'historique des scores.
          getScores(userId, (scores) => {
            if (Array.isArray(scores)) {
              data.scores = scores;

              // Charger la liste de médailles.
              getMedals(userId, (medals) => {
                if (Array.isArray(medals)) {
                  data.medals = medals;

                  // Terminer la requête en retournant le data.
                  response.send(data);
                }
              });
            }
          });
        }
        else {
          console.log("User does not exist.");
          response.sendStatus(500);
        }
      });
      client.release();
    }
  });
});

app.put("/api/profile/:userId", function(request, response) {
  console.log(`[PUT: /api/profile/${request.params.userId}] - (UserId: ${request.session.user.id}, Username: ${request.session.user.username})`);

  const userId = request.params.userId;
  const profile = request.body;

  pgPool.connect(function(err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server.\n\n" + err.stack);
      response.sendStatus(500);
    }
    else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL retournant le mot de passe hashé de l'utilisateur.
      // const sql = `UPDATE fredouil.users SET nom='${profile.lastname}', prenom='${profile.firstname}', date_naissance='${profile.dateBirth}', avatar='${profile.avatarUrl}', humeur='${profile.status}' WHERE identifiant='${username}';`;
      const sql = `UPDATE fredouil.users SET avatar=$1, humeur=$2 WHERE id=$3;`;

      client.query(sql, [profile.avatarUrl, profile.status, userId], (err, res) => {
        if (err) {
          console.log("Error executing SQL query.\n\n" + err.stack);
          response.sendStatus(500);
        }
        else if (res.rowCount > 0) {
          // Si un record a été modifié, on retourne un HTTP 200.
          console.log(`Utilisateur '${userId}' modifié avec succès.`);
          response.status(200).send({ status: 'OK'})
        }
        else {
          console.log("User does not exist.");
          response.sendStatus(500);
        }
      });
      client.release();
    }
  });
});

app.post("/api/profile/:id/score", function (request, response) {
  console.log(`[POST: /api/profile/${request.params.id}/score] - (UserId: ${request.session.user.id}, Username: ${request.session.user.username})`);

  // Extraire l'information de la requête HTTP afin de la traiter.
  const userId = request.params.id;
  const score = request.body;

  pgPool.connect(function (err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server.\n\n" + err.stack);
      response.sendStatus(500);
    }
    else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL sauvegardant le score de l'utilisateur.
      const sql = `INSERT INTO fredouil.historique (id_user, date_jeu, niveau_jeu, nb_reponses_corr, temps, score) SELECT DISTINCT id, NOW(), $1::integer, $2::integer, $3::integer, $4::integer FROM fredouil.users WHERE id=$5;`

      client.query(sql, [parseInt(score.difficulty), parseInt(score.correctAnswers), parseInt(score.timeInSeconds), parseInt(score.score), userId], (err, res) => {
        if (err) {
          console.log("Error executing SQL query.\n\n" + err.stack);
          response.sendStatus(500);
        }
        else if (res.rowCount > 0) {
          // Si un record a été inséré, on retourne un HTTP 200.
          console.log(`Score de l'utilisateur '${score.username}' inséré avec succès.`);

          isInTop10(userId, score.score, (players) => {
            if (Array.isArray(players) && players.length > 0) {
              emitTop10Updated(players);
            }
          });

          response.status(200).send({ status: 'OK'});
        }
        else {
          console.log("No score log for this user.\n\n" + JSON.stringify(res));
          response.sendStatus(500);
        }
      });
      client.release();
    }
  });
});

app.get("/api/players/top10", function (request, response) {
  console.log(`[GET: /api/players/top10] - (UserId: ${request.session.user.id}, Username: ${request.session.user.username})`);

  getTop10((players) => {
    if (!Array.isArray(players) || !players.length) {
      response.sendStatus(500);
    }
    else {
      // Terminer la requête en retournant le data.
      response.send(players);
    }
  });
});

app.get("/api/players", function (request, response) {
  console.log(`[GET: /api/players] - (UserId: ${request.session.user.id}, Username: ${request.session.user.username})`);

  pgPool.connect(function (err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server.\n\n" + err.stack);
      response.sendStatus(500);
    }
    else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL retournant l'historique des scores de l'utilisateur.
      const sql = `SELECT id, identifiant AS "username", nom AS "lastname", prenom AS "firstname", avatar AS "avatarUrl" FROM fredouil.users ORDER BY identifiant;`;

      client.query(sql, (err, res) => {
        if (err) {
          console.log("Error executing SQL query.\n\n" + err.stack);
          response.sendStatus(500);
        }
        else if (res.rows.length > 0) {
          // Mapping des noms de colonne de la BD à l'interface TypeScript.
          const data = res.rows.map(x => ({
            id: x.id,
            username: x.username,
            lastname: x.lastname,
            firstname: x.firstname,
            avatarUrl: x.avatarUrl
          }));

          // Terminer la requête en retournant le data.
          response.send(data);
        }
        else {
          console.log("Could not find any players.");
          response.sendStatus(500);
        }
      });
      client.release();
    }
  });
});

app.get("/api/players/online", function (request, response) {
  console.log(`[GET: /api/players/online] - (UserId: ${request.session.user.id}, Username: ${request.session.user.username})`);

  pgPool.connect(function (err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server.\n\n" + err.stack);
      response.sendStatus(500);
    }
    else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL retournant l'historique des scores de l'utilisateur.
      const sql = `SELECT id, identifiant AS "username", nom AS "lastname", prenom AS "firstname", avatar AS "avatarUrl" FROM fredouil.users WHERE statut_connexion=1 ORDER BY identifiant;`;

      client.query(sql, (err, res) => {
        if (err) {
          console.log("Error executing SQL query.\n\n" + err.stack);
          response.sendStatus(500);
        }
        else if (res.rows.length > 0) {
          // Mapping des noms de colonne de la BD à l'interface TypeScript.
          const data = res.rows.map(x => ({
            id: x.id,
            username: x.username,
            lastname: x.lastname,
            firstname: x.firstname,
            avatarUrl: x.avatarUrl
          }));

          // Terminer la requête en retournant le data.
          response.send(data);
        }
        else {
          console.log("No users connected at the moment.");
          response.sendStatus(500);
        }
      });
      client.release();
    }
  });
});

app.get('/api/players/:userId/challenges', (request, response) => {
  console.log(`[GET: /api/players/${request.params.userId}/challenges] - (UserId: ${request.session.user.id}, Username: ${request.session.user.username})`);

  // Extraire l'information de la requête HTTP afin de la traiter.
  const userId = request.params.userId;

  mongoClient.connect(dsnMongoDb, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, mongoClient) {
    if (err) {
      console.log("Error connecting to MongoDB server.\n\n" + err.stack);
      response.sendStatus(500);
    }
    else if (mongoClient) {
      const findRequest = {
        $and : [
          { 'gameId': parseInt(process.env.PORT_ANGULAR) },
          { 'challengeeUserId': userId }
        ]        
      };
      console.log(findRequest);
      mongoClient.db().collection('defi').find(findRequest)
      // Mapping des noms de colonne de la BD à l'interface TypeScript.
      .map(item => ({
        id: item._id,
        gameId: item.gameId,
        challengerUserId: item.challengerUserId,
        challengerUsername: item.challengerUsername,
        challengeeUserId: item.challengeeUserId,
        challengeeUsername: item.challengeeUsername,
        targetScore: item.targetScore,
        quiz: item.quiz
      }))
      .toArray(function (err, data) {
        if (err) {
          console.log("Error executing query on MongoDB server.\n\n" + err.stack);
          response.sendStatus(500);
        }
        else if(data) {
          response.send(data);
        }
        mongoClient.close();
      });
    }
  });
});

app.post('/api/players/challenges', (request, response) => {
  console.log(`[POST: /api/players/challenges] - (UserId: ${request.session.user.id}, Username: ${request.session.user.username})`);
  const challenge = request.body;

  mongoClient.connect(dsnMongoDb, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, mongoClient) {
    if (err) {
      console.log("Error connecting to MongoDB server.\n\n" + err.stack);
      response.sendStatus(500);
    }
    else if (mongoClient) {
      mongoClient.db().collection('defi').insertOne(challenge, (error, result) => {
        if (error) {
          console.log("Error executing query on MongoDB server.\n > " + error);
          response.sendStatus(500);
        }
        else if (!result.result.ok) {
          console.log("Error executing query on MongoDB server.\n");
          console.log(result);
          response.sendStatus(500);
        }
        else if(result.insertedCount > 0) {
          challenge.id = result.insertedId.valueOf();
          response.send(challenge);
          emitPlayerChallenged(challenge);
        }
        mongoClient.close();
      });
    }
  });
});

app.delete('/api/players/challenges/:id', (request, response) => {
  console.log(`[DELETE: /api/players/challenges/${request.params.id}] - (UserId: ${request.session.user.id}, Username: ${request.session.user.username})`);

  const challengeId = request.params.id;
  let challenge;

  mongoClient.connect(dsnMongoDb, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, mongoClient) {
    if (err) {
      console.log("Error connecting to MongoDB server.\n\n" + err.stack);
      response.sendStatus(500);
    }
    else if (mongoClient) {
      mongoClient.db().collection('defi').findOne({ "_id": new mongo.ObjectId(challengeId) }, (error, result) => {
        if (error) {
          console.log("Error executing query on MongoDB server.\n > " + error);
          response.sendStatus(500);
        }
        else if (result) {
          challenge = result;
          console.log(result);
        }
        else {
          console.log("Error executing query on MongoDB server.\n");
          console.log(result);
          response.sendStatus(500);
        }
      });

      mongoClient.db().collection('defi').deleteOne(
        { "_id": new mongo.ObjectId(challengeId) },
        (error, result) => {
          if (error) {
            console.log("Error executing query on MongoDB server.\n > " + error);
            response.sendStatus(500);
          }
          else if (result.deletedCount > 0) {
            saveChallengeResult(challenge.challengerUserId, challenge.challengeeUserId, _ => {
              response.status(200).send({ status: 'OK'});
            });
          }
          else {
            console.log("Error executing query on MongoDB server.\n");
            console.log(result);
            response.sendStatus(500);
          }
          mongoClient.close();
      });
    }
  });
});

app.get('/api/quiz', (request, response) => {
  console.log(`[GET: /api/quiz] - (UserId: ${request.session.user.id}, Username: ${request.session.user.username})`);

  mongoClient.connect(dsnMongoDb, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, mongoClient) {
    if (err) {
      console.log("Error connecting to MongoDB server.\n\n" + err.stack);
      response.sendStatus(500);
    }
    else if (mongoClient) {
      mongoClient.db().collection('quizz').find()
      // Projection des données pour ne sélectionner que quelques champs.
      .project({
        "_id": 1,
        "fournisseur": 1,
        "rédacteur": 1,
        "thème": 1
      })
      // Mapping des noms de colonne de la BD à l'interface TypeScript.
      .map(q => ({
        id: q._id,
        provider: q.fournisseur,
        writer: q.rédacteur,
        theme: q.thème
      }))
      .toArray(function (err, data) {
        if (err) {
          console.log("Error executing query on MongoDB server.\n\n" + err.stack);
          response.sendStatus(500);
        }
        else if(data) {
          response.send(data);
        }
        mongoClient.close();
      });
    }
  });
});

app.get('/api/quiz/:quizId/questions', (request, response) => {
  console.log(`[GET: /api/quiz/${request.params.quizId}/questions] - (UserId: ${request.session.user.id}, Username: ${request.session.user.username})`);

  mongoClient.connect(dsnMongoDb, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, mongoClient) {
    if (err) {
      console.log("Error connecting to MongoDB server.\n\n" + err.stack);
      response.sendStatus(500);
    }
    else if (mongoClient) {
      mongoClient.db().collection('quizz').findOne(
        { "_id": new mongo.ObjectId(request.params.quizId) },
        // Projection des données pour ne sélectionner que quelques champs.
        { projection: {
          "_id": 0,
          "quizz.id": 1,
          "quizz.question": 1,
          "quizz.propositions": 1,
          "quizz.anecdote": 1,
          "quizz.réponse": 1
        }},
        function (err, data) {
          if (err) {
            console.log("Error executing query on MongoDB server.\n\n" + err.stack);
            response.sendStatus(500);
          }
          else if(data) {
            // Si le niveau de difficulté est spécifié, filtrer les options.
            if (request.query.difficulty) {
              // Nombre de questions fixe par partie jouée.
              const questionCount = 5;

              // Déterminer le nombre d'options à choisir.
              let optionsCount;
              if (request.query.difficulty === '1') {
                optionsCount = 2;
              }
              else if (request.query.difficulty === '2') {
                optionsCount = 3
              }
              else {
                optionsCount = 4;
              }
  
              // Construire une liste de X questions pour le quiz.
              let finalCut = [];
              while (finalCut.length < questionCount) {
                // Choisir une question aléatoire.
                const random = data.quizz[Math.floor(Math.random() * data.quizz.length)];
  
                if (!finalCut.some(e => e.id === random.id)) {
                  // Choisir un index aléatoire pour la réponse.
                  const answerIndex = Math.floor(Math.random() * optionsCount);

                  // Construire une liste de X options pour la question.
                  let optionsCut = [];
                  while (optionsCut.length < optionsCount) {
                    // Si la réponse n'est pas déjà dans la liste et qu'on est à
                    // l'index aléatoire choisi pour la réponse...
                    if (random.réponse && answerIndex == optionsCut.length && !optionsCut.includes(random.réponse)) {
                      optionsCut.push(random.réponse);
                    }
                    // Sinon, ajouter une option aléatoire.
                    else {
                      // Choisir une option aléatoire.
                      const randomOption = random.propositions[Math.floor(Math.random() * random.propositions.length)];
                      
                      // Si l'option n'est pas déjà dans la liste, ajouter l'option.
                      if (!optionsCut.includes(randomOption)) {
                        optionsCut.push(randomOption);
                      }
                    }
                  }

                  // Remplacer la liste d'options originale par notre liste
                  // filtrée et aléatoire.
                  random.propositions = optionsCut;

                  finalCut.push(random);
                }
              }

              // Mapping des noms de colonne de la BD à l'interface TypeScript.
              const quiz = finalCut.map(q => ({
                id: q.id,
                question: q.question,
                options: q.propositions,
                funFact: q.anecdote
              }));
              
              response.send(quiz);
            }
            // Sinon, retourner toutes les options.
            else {
              // Mapping des noms de colonne de la BD à l'interface TypeScript.
              const quiz = data.quizz.map(q => ({
                id: q.id,
                question: q.question,
                options: q.propositions,
                funFact: q.anecdote
              }));
              response.send(quiz);
            }
          }
          
          mongoClient.close();
      });
    }
  });
});

app.get('/api/quiz/:quizId/questions/:questionId', (request, response) => {
  console.log(`[GET: /api/quiz/${request.params.quizId}/questions/${request.params.questionId}] - (UserId: ${request.session.user.id}, Username: ${request.session.user.username})`);

  mongoClient.connect(dsnMongoDb, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, mongoClient) {
    if (err) {
      console.log("Error connecting to MongoDB server.\n\n" + err.stack);
      response.sendStatus(500);
    }
    else if (mongoClient) {
      // Pipeline d'aggrégation permettant de sélectionner que le champs réponse
      // d'une question.
      const pipeline = [
        { "$match": { '_id': new mongo.ObjectID(request.params.quizId) } },
        { "$unwind": "$quizz" },
        { "$match": { "quizz.id": parseInt(request.params.questionId) } },
        // Projection des données pour ne sélectionner que quelques champs.
        { "$project": { "_id": 0, "réponse": "$quizz.réponse" } }
      ];
      const aggCursor = mongoClient.db().collection("quizz")
        .aggregate(pipeline)
        .toArray(function (err, data) {
          if (err) {
            console.log("Error executing query on MongoDB server.\n\n" + err.stack);
            response.sendStatus(500);
          }
          else if(data) {
            // Utiliser la déconstruction pour extraire le premier élément du
            // tableau.
            const [first] = data.map(q => ({ "answer": q.réponse }));

            // Si le tableau contenait au moins un élément...
            if (first) {
              console.log(`Correct answer for question '${request.params.questionId}' in quiz '${request.params.quizId}': ${JSON.stringify(first)}`);
              response.send(first);
            }
            else {
              console.log(`The question '${request.params.questionId}' for quiz '${request.params.quizId}' does not exist.`);
              response.sendStatus(404);
            }
          }
          mongoClient.close();
        });
    }
  });
});

app.get("/api/players/online/test-connect", function (request, response) {
  testConnected();
  response.sendStatus(200);
});
app.get("/api/players/online/test-disconnect", function (request, response) {
  testDisconnected();
  response.sendStatus(200);
});

app.get("/api/players/top10/test-update", function (request, response) {
  testTop10Updated();
  response.sendStatus(200);
});
app.get("/api/players/top10/test-pass", function (request, response) {
  testTop10Updated_Pass();
  response.sendStatus(200);
});
app.get("/api/players/top10/test-fail", function (request, response) {
  testTop10Updated_Fail();
  response.sendStatus(200);
});

app.get("/api/players/challenges/test-new", function (request, response) {
  testNewChallenge();
  response.sendStatus(200);
});

app.get("/*", function (request, response) {
  response.sendFile(path.join(__dirname, ANGULAR_FILES, "index.html"));
});

function setConnectedFlag(userId, isConnected) {
  console.log(`[setConnectedFlag(${userId}, ${isConnected})]`);

  const sql = `UPDATE fredouil.users SET statut_connexion='${(isConnected === true ? 1 : 0)}' WHERE id=${userId};`;
  console.log(sql);

  // Demander au pool un client connecté à la BD pour notre requête.
  pgPool.connect(function (err, client, done) {
    client.query(sql, (err, res) => {
      if (err) {
        console.log("Error executing SQL query.\n\n" + err.stack);
      }
      else if (res.rowCount > 0) {
        // Si un record a été modifié, on retourne un HTTP 200.
        console.log(`Utilisateur '${userId}' modifié avec succès.`);
      }
      else {
        console.log("User does not exist.");
      }
    });
    client.release();
  });
}

function getMedals(userId, handleResponse) {
  console.log(`[getMedals(${userId})]`);

  pgPool.connect(function (err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server.\n\n" + err.stack);
      handleResponse(null);
    }
    else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL retournant l'historique des médailles de l'utilisateur.
      const sql = `SELECT u.id AS "opponent_id", u.identifiant AS "opponent_username", h.date_defi AS "date" FROM fredouil.hist_defi AS h JOIN fredouil.users AS u ON u.id=h.id_user_perdant WHERE h.id_user_gagnant=${parseInt(userId)};`;

      client.query(sql, (err, res) => {
        if (err) {
          console.log("Error executing SQL query.\n\n" + err.stack);
          handleResponse(null);
        }
        else if (res.rows.length > 0) {
          // Mapping des noms de colonne de la BD à l'interface TypeScript.
          const data = res.rows.map(x => ({
            opponentId: x.opponent_id,
            opponentUsername: x.opponent_username,
            challengeDate: x.date
          }));

          handleResponse(data);
        }
        else {
          console.log("No medal log for this user.");
          handleResponse([]);
        }
      });
      client.release();
    }
  });
}

function getScores(userId, handleResponse) {
  console.log(`[getScores(${userId})]`);

  pgPool.connect(function (err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server.\n\n" + err.stack);
      handleResponse(null);
    }
    else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL retournant l'historique des scores de l'utilisateur.
      // const sql = `SELECT h.* FROM fredouil.historique AS h JOIN fredouil.users AS u ON u.id=h.id_user WHERE u.identifiant='${username}';`;
      const sql = `SELECT h.*, u.identifiant AS "username" FROM fredouil.historique AS h JOIN fredouil.users AS u ON u.id=h.id_user WHERE u.id=${userId};`;

      client.query(sql, (err, res) => {
        if (err) {
          console.log("Error executing SQL query.\n\n" + err.stack);
          handleResponse(null);
        }
        else if (res.rows.length > 0) {
          // Mapping des noms de colonne de la BD à l'interface TypeScript.
          const data = res.rows.map(x => ({
            id: userId,
            username: x.username,
            date: x.date_jeu,
            difficulty: x.niveau_jeu,
            correctAnswers: x.nb_reponses_corr,
            timeInSeconds: x.temps,
            score: x.score
          }));

          handleResponse(data);
        }
        else {
          console.log("No score log for this user.");
          handleResponse([]);
        }
      });
      client.release();
    }
  });
}

function getTop10(handleResponse) {
  console.log(`[getTop10()]`);

  pgPool.connect(function (err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server.\n\n" + err.stack);
      handleResponse(null);
    }
    else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL retournant l'historique des scores de l'utilisateur.
      const sql = `SELECT ROW_NUMBER () OVER (ORDER BY MAX(h.score) DESC) AS "ranking", h.id_user AS "id", u.identifiant AS "username", MAX(h.score) AS "score", u.statut_connexion AS "isConnected" FROM fredouil.historique AS h JOIN fredouil.users AS u ON u.id=h.id_user GROUP BY h.id_user, u.identifiant, h.score, u.statut_connexion ORDER BY MAX(h.score) DESC LIMIT 10;`;

      client.query(sql, (err, res) => {
        if (err) {
          console.log("Error executing SQL query.\n\n" + err.stack);
          handleResponse(null);
        }
        else if (res.rows.length > 0) {
          // Mapping des noms de colonne de la BD à l'interface TypeScript.
          const data = res.rows.map(x => ({
            id: x.id,
            ranking: x.ranking,
            username: x.username,
            score: x.score
          }));

          handleResponse(data);
        }
        else {
          console.log("No top 10 available at the moment.");
          handleResponse(null);
        }
      });
      client.release();
    }
  });
}

function isInTop10(userId, score, handleResponse) {
  console.log(`[isInTop10(${userId}, ${score})]`);

  getTop10((players) => {
    if (players.find(item => item.id === userId && item.score === score)) {
      console.log(`The score ${score} for user id ${userId} IS in the top 10 list!`);
      handleResponse(players);
    }
    else {
      console.log(`The score ${score} for user id ${userId} is NOT in the top 10 list.`);
      handleResponse(null);
    }
  });
}

function saveChallengeResult(winnerId, loserId, handleResponse) {
  console.log(`[saveChallengeResult(${winnerId}, ${loserId})]`);

  pgPool.connect(function (err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server.\n\n" + err.stack);
      handleResponse(null);
    }
    else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL retournant l'historique des scores de l'utilisateur.
      const sql = `INSERT INTO fredouil.hist_defi (id_user_gagnant, id_user_perdant, date_defi) VALUES (${parseInt(winnerId)}, ${parseInt(loserId)}, NOW());`;

      client.query(sql, (err, res) => {
        if (err) {
          console.log("Error executing SQL query.\n\n" + err.stack);
          handleResponse(null);
        }
        else if (res.rows.length > 0) {
          // Mapping des noms de colonne de la BD à l'interface TypeScript.
          const data = res.rows.map(x => ({
            id: x.id,
            ranking: x.ranking,
            username: x.username,
            score: x.score
          }));

          handleResponse(data);
        }
        else {
          console.log("No top 10 available at the moment.");
          handleResponse(null);
        }
      });
      client.release();
    }
  });
}

function deleteChallenge(challengeId, handleResponse) {
  console.log(`[deleteChallenge(${challengeId})]`);

  mongoClient.connect(dsnMongoDb, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, mongoClient) {
    if (err) {
      console.log("Error connecting to MongoDB server.\n\n" + err.stack);
      handleResponse(false);
    }
    else if (mongoClient) {
      mongoClient.db().collection('defi').deleteOne(
        { "_id": new mongo.ObjectId(challengeId) },
        (error, result) => {
          if (error) {
            console.log("Error executing query on MongoDB server.\n > " + error);
            handleResponse(false);
          }
          else if (result.deletedCount > 0) {
            handleResponse(true);
          }
          else {
            console.log("Error executing query on MongoDB server.\n");
            handleResponse(false);
          }
          mongoClient.close();
      });
    }
  });
}

function acceptChallenge(challengeId, handleResponse) {
  deleteChallenge(challengeId, () => {});
}

// Instantiation du serveur Node pour l'écoute sur le port désigné par les
// variables d'environnement.
var server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`Root: ${__dirname}\n`);
  console.log(`[LOGS]`);
});

const io = require('socket.io')(server);

io.on('connection', client => {
  client.on('playerConnected', data => {
    console.log(`Emitting playerConnected: ${data}`);
    setConnectedFlag(data, true);
    io.emit('playerConnected', data);
  });

  client.on('playerDisconnected', data => {
    console.log(`Emitting playerDisconnected: ${data}`);
    setConnectedFlag(data, false);
    io.emit('playerDisconnected', data);
  });

  client.on('playerAcceptedChallenge', data => {
    console.log(`Emitting playerAcceptedChallenge: ${data}`);
    acceptChallenge(data, () => {});
  });

  client.on('playerWonChallenge', data => {
    console.log(`Emitting playerWonChallenge: ${data}`);
    saveChallengeResult(data.winnerUserId, data.loserUserId, () => {});
  });
});

function emitPlayerConnected(user) { 
  console.log(`Emitting playerConnected: ${JSON.stringify(user)}`);
  io.emit('playerConnected', user);
}

function emitTop10Updated(players) { 
  console.log(`Emitting top10Updated: ${JSON.stringify(players)}`);
  io.emit('top10Updated', players);
}

function emitPlayerChallenged(challenge) { 
  console.log(`Emitting playerChallenged: ${JSON.stringify(challenge)}`);
  io.emit('playerChallenged', challenge);
}

let newId = -1;
function testConnected() { 
  io.emit('playerConnected', { id: newId--, username: 'MyTestUser' });
}

function testDisconnected() { 
  io.emit('playerDisconnected', { id: ++newId, username: 'MyTestUser' });
}

function testTop10Updated() {
  getTop10((players) => {
    players.push({ ranking: 11, username: 'MyTestUser', score: 9999 });
    io.emit('top10Updated', players);
  });
}

function testTop10Updated_Pass() {
  // username: quentin
  // score:    90000
  isInTop10(5, 90000, (players) => {
    if (Array.isArray(players) && players.length > 0) {
      players.push({ ranking: 11, username: 'MyTestUser', score: 9999 });
      emitTop10Updated(players);
    }
  });
}

function testTop10Updated_Fail() {
  isInTop10(-1, 9999, (players) => {
    if (Array.isArray(players) && players.length > 0) {
      emitTop10Updated(players);
    }
  });
}

function testNewChallenge() {
  io.emit(
    'playerChallenged',
    { 
      challengerUserId: 38,
      challengeeUserId: 37,
      challengerUsername: 'TestPlayer1',
      challengeeUsername: 'TestPlayer2',
      targetScore: 1000,
      quiz: {
        theme: 'Star Wars',
        difficulty: 'Difficile'
      }
    }
  );
}

