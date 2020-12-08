const express = require("express");
// const cors = require('cors');
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
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

// Configuration des sessions sur MongoDB.
var store = new MongoDBStore({
  uri: "mongodb://127.0.0.1:27017/db",
  // uri: "mongodb://localhost:27017/db",
  collection: "mySessions3022",
  touchAfter: 24 * 3600,
});
store.on("error", function (error) {
  console.log(error);
});
app.use(
  session({
    secret: "Security through obscurity!",
    // secret: "",
    saveUninitialized: false,
    resave: false,
    store: store,
    cookie: { maxAge: 24 * 3600 * 1000, httpOnly: true, secure: false },
  })
);

// Gestion des requêtes pour les ressources statiques.
app.use(express.static(path.join(__dirname, ANGULAR_FILES)));

// Gestion de méthode GET sur '/'.
app.get("/", function (request, response) {
  // Terminer la requête en retournant la page index.html.
  response.sendFile(path.join(__dirname, ANGULAR_FILES, "index.html"));
});

// Gestion de méthode POST sur '/login'.
app.post("/auth/login", function (request, response) {
  // Extraire l'information de la requête HTTP afin de la traiter.
  const username = request.body.username;
  const password = request.body.password;

  // Afficher le contenu JSON transmis par la requête HTTP dans la console.
  console.log(JSON.stringify(request.body));

  // Instancier un pool de connection à la BD.
  let pgPool = new pgClient.Pool({
    user: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    host: process.env.POSTGRESQL_HOST,
    port: process.env.POSTGRESQL_PORT,
    database: process.env.POSTGRESQL_DATABASE
  });

  // Demander au pool un client connecté à la BD pour notre requête.
  pgPool.connect(function (err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server." + err.stack);
      response.sendStatus(500);
    } else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL retournant le mot de passe hashé de l'utilisateur.
      const sql = `SELECT * FROM fredouil.users WHERE identifiant='${username}';`;

      client.query(sql, (err, res) => {
        // Utiliser SHA1 afin de calculer le hash du mot de passe.
        const hashedPassword = crypto
          .createHash("sha1")
          .update(password)
          .digest("hex");

        if (err) {
          console.log("Error executing SQL query." + err.stack);
          response.sendStatus(500);
        } else if (res.rows.length > 0 && res.rows[0].motpasse == hashedPassword) {
          // Créer la session pour cet utilisateur valide.
          let data = {
            authenticated: true,
            username: username,
            firstname: res.rows[0].prenom,
            lastname: res.rows[0].nom,
            newLoginDate: new Date(),
          };
          request.session.user = data;

          // TODO: Flip the online flag in the PostgreSQL database.

          console.log(
            `${request.session.id} expire dans ${request.session.cookie.maxAge}`
          );

          // Terminer la requête en retournant le data.
          response.send(request.session.user);
        } else {
          console.log("Invalid user credentials.");
          response.sendStatus(401);
        }
      });
      client.release();
    }
  });
});

app.get("/profile/:username", function (request, response) {
  console.log(JSON.stringify(request.session.user));

  // Extraire l'information de la requête HTTP afin de la traiter.
  const username = request.params.username;

  // Instancier un pool de connection à la BD.
  let pgPool = new pgClient.Pool({
    user: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    host: process.env.POSTGRESQL_HOST,
    port: process.env.POSTGRESQL_PORT,
    database: process.env.POSTGRESQL_DATABASE
  });

  pgPool.connect(function (err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server." + err.stack);
      response.sendStatus(500);
    } else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL retournant le mot de passe hashé de l'utilisateur.
      const sql = `SELECT * FROM fredouil.users WHERE identifiant='${username}';`;

      client.query(sql, (err, res) => {
        if (err) {
          console.log("Error executing SQL query." + err.stack);
          response.sendStatus(500);
        } else if (res.rows.length > 0) {
          // Créer la session pour cet utilisateur valide.
          const data = {
            username: res.rows[0].identifiant,
            lastname: res.rows[0].nom,
            firstname: res.rows[0].prenom,
            dateBirth: res.rows[0].date_naissance,
            avatarUrl: res.rows[0].avatar,
            status: res.rows[0].humeur,
            isConnected: (res.rows[0].statut_connexion === 1)
          };
          // request.session.user = data;

          // Terminer la requête en retournant le data.
          response.send(data);
        } else {
          console.log("User does not exist.");
          response.sendStatus(500);
        }
      });
      client.release();
    }
  });
});

app.put("/profile/:username", function(request, response) {
  const username = request.params.username;
  const profile = request.body;

  let pgPool = new pgClient.Pool({
    user: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    host: process.env.POSTGRESQL_HOST,
    port: process.env.POSTGRESQL_PORT,
    database: process.env.POSTGRESQL_DATABASE
  });

  pgPool.connect(function(err, client, done) {
    if (err) {
      console.log("Error connecting to PostgreSQL server." + err.stack);
      response.sendStatus(500);
    } else {
      console.log("Connection established with PostgreSQL server.");

      // Requête SQL retournant le mot de passe hashé de l'utilisateur.
      // const sql = `UPDATE fredouil.users SET nom='${profile.lastname}', prenom='${profile.firstname}', date_naissance='${profile.dateBirth}', avatar='${profile.avatarUrl}', humeur='${profile.status}' WHERE identifiant='${username}';`;
      const sql = `UPDATE fredouil.users SET avatar='${profile.avatarUrl}', humeur='${profile.status}' WHERE identifiant='${username}';`;

      // Log pour le troubleshooting de commande SQL.
      // console.log(sql);

      client.query(sql, (err, res) => {
        if (err) {
          console.log("Error executing SQL query." + err.stack);
          response.sendStatus(500);
        } else if (res.rowCount > 0) {
          // Si un record a été modifié, on retourne un HTTP 200.
          console.log(`Utilisateur '${username}' modifié avec succès.`);
          response.sendStatus(200);
        } else {
          console.log("User does not exist.");
          response.sendStatus(500);
        }
      });
      client.release();
    }
  });
});

app.get("/*", function (request, response) {
  response.sendFile(path.join(__dirname, ANGULAR_FILES, "index.html"));
});

// Instantiation du serveur Node pour l'écoute sur le port désigné par les
// variables d'environnement.
var server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`Root: ${__dirname}\n`);
  console.log(`[LOGS]`);
});
