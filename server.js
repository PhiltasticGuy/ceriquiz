const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoSessions = require('connect-mongodb-session')(session);
const pgClient = require('pg');
var crypto = require('crypto')

// Chargement des variables d'environnement.
const configResult = dotenv.config();

// Terminer l'exécution immédiatement s'il est impossible de charger les 
// variables d'environnement.
if (configResult.error) {
    throw configResult.error;
}

// Constantes
const PORT = process.env.PORT_NODE || 3021;
const ANGULAR_FILES = '/ceriquiz-spa/dist/ceriquiz-spa/';

const app = express();

// Configuration du module 'body-parser' pour parser les données des POST.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));

// Configuration des sessions sur MongoDB.
app.use(session({
    secret: "Security through obscurity!",
    // secret: "",
    saveUninitialized: false,
    resave: false,
    store: new mongoSessions({
        uri: "mongodb://127.0.0.1:27017/db",
        // uri: "mongodb://localhost:27017/db",
        collection: "mySessions3022",
        touchAfter: 24 * 3600
    }),
    cookie: { maxAge: 24 * 3600 * 1000 }
}));

// Gestion des requêtes pour les ressources statiques.
app.use(express.static(path.join(__dirname, ANGULAR_FILES)));

// Gestion de méthode GET sur '/'.
app.get('/', function(request, response) {
    // Terminer la requête en retournant la page index.html.
    response.sendFile(path.join(__dirname, ANGULAR_FILES, 'index.html'));
});

// Gestion de méthode GET sur '/login'.
app.get('/login', function(request, response) {
    // Terminer la requête en retournant la page index.html.
    response.sendFile(path.join(__dirname, ANGULAR_FILES, 'index.html'));
});

// Gestion de méthode POST sur '/login'.
app.post('/auth/login', function(request, response) {
    // Extraire l'information de la requête HTTP afin de la traiter.
    const username = request.body.username;
    const password = request.body.password;

    // Afficher le contenu JSON transmis par la requête HTTP dans la console.
    console.log(JSON.stringify(request.session));
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
    let data = {
        authenticated: false,
        username: username,
        firstname: '',
        lastname: ''
    };
    pgPool.connect(function(err, client, done) {
        if (err) {
            console.log('Error connecting to PostgreSQL server.' + err.stack);
        }
        else {
            console.log('Connection established with PostgreSQL server.');

            // Requête SQL retournant le mot de passe hashé de l'utilisateur.
            const sql = `SELECT motpasse FROM fredouil.users WHERE identifiant='${username}';`;

            client.query(sql, (err, res) => {
                // Utiliser SHA1 afin de calculer le hash du mot de passe.
                const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
                
                if (err) {
                    console.log('Error executing SQL query.' + err.stack);
                }
                else if ((res.rows.length > 0) && (res.rows[0].motpasse == hashedPassword)) {
                    // Créer la session pour cet utilisateur valide.
                    request.session.isConnected = true;
                    request.session.username = username;
                    request.session.save();
                    // data.authenticated = true;
                    // data.firstname = res.rows[0].firstname;
                    // data.lastname = res.rows[0].lastname;
                    console.log(JSON.stringify(request.session));
                    console.log(`${request.session.id} expire dans ${request.session.cookie.maxAge}`);
                }
                else {
                    console.log('Invalid user credentials.');
                }
            });
            client.release();
        }
    });

    // Terminer la requête en retournant le data.
    response.send(data);
});

// Instantiation du serveur Node pour l'écoute sur le port désigné par les 
// variables d'environnement.
var server = app.listen(PORT, function() {
    console.log(`Listening on port ${PORT}`);
    console.log(`Root: ${__dirname}\n`);
    console.log(`[LOGS]`);
});
