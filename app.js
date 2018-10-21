const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const multer = require("multer");
const upload = multer();
//jwt
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt"); //pour gerer les tokens

//faker pour générer données
const faker = require("faker");

//les données pour s'identifier sur mongoose
const config = require("./config");

//mongoose
const mongoose = require("mongoose");
const options = { useNewUrlParser: true };
mongoose.connect(
  `mongodb://${config.db.user}:${
    config.db.pwd
  }@ds131743.mlab.com:31743/expressmovies`,
  options
);
const db = mongoose.connection;
db.on(
  "error",
  console.error.bind(console, "connection error: cannot connect to my DB")
);
db.once("open", () => {
  console.log("connected to the DB");
});

//creation d'un schema pour mongoose
const movieSchema = mongoose.Schema({
  movieTitle: String,
  movieYear: Number
});

//creation d'un modele Movie car la collection mongo est Movies
const Movie = mongoose.model("Movie", movieSchema);
//genérer de fausse information
const title = faker.lorem.sentence(Math.floor(Math.random() * 5) + 1);
const year = Math.floor(Math.random() * 70) + 1948;

//creation d'un instance de Movie
const myMovie = new Movie({ movieTitle: title, movieYear: year });
// //creer automatiquement la collection dans mlab
// myMovie.save((err, savedMovie) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log("savedMovie", savedMovie);
//   }
// });

const axios = require("axios");
const port = 3000;
let frenchMovies = [];
const secret =
  "qsdjS12ozehdoIJ123DJOZJLDSCqsdeffdg123ER56SDFZedhWXojqshduzaohduihqsDAqsdq";

//on déclare où sont nos views
app.set("views", "./views");

//on déclare le view engine
app.set("view engine", "ejs");

//middleware pour utiliser des fichiers statiques dans le dossier public
app.use("/public", express.static("public"));

app.use(
  expressJwt({ secret: secret }).unless({
    path: [
      "/",
      "/login",
      "/movies",
      "/movie-search",
      new RegExp("/movies.*/", "i")
    ]
  })
); //unless permet de définir une page ne nécessitant pas le jwt

// // parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }));
// // s'applique à tous le code

app.get("/movies", (req, res) => {
  // res.send("bientôt une liste de film ici !");
  const title = `Films américains`;

  // frenchMovies = [
  //   { title: `Tron`, year: 1978 },
  //   { title: "Terminator", year: 1983 },
  //   { title: `2001 odysée de l'espace`, year: 1968 }
  // ];

  //on recupere les datas de mongoose
  frenchMovies = [];
  Movie.find((err, movies) => {
    if (err) {
      console.error("could not retrieve movies from DB");
      res.sendStatus(500);
    } else {
      frenchMovies = movies;
      res.render("movies", { movies: frenchMovies, title: title });
    }
  });
  // res.render("movies", { movies: frenchMovies, title: title });
});

// s'applique uniquement à /movies
const urlencoded = bodyParser.urlencoded({ extended: false });
// app.post("/movies", urlencoded, (req, res) => {
// console.log("title :", req.body.movieTitle);
// console.log("year: ", req.body.movieYear);

// const newMovie = { title: req.body.movieTitle, year: req.body.movieYear };
// frenchMovies = [...frenchMovies, newMovie];
// console.log(frenchMovies);

// res.sendStatus(201);
// });

//bien penser à ajouter un tableau vide dans upload.fields
app.post("/movies", upload.fields([]), (req, res) => {
  if (!req.body) {
    return res.sendStatus(500);
  } else {
    const formData = req.body;
    console.log("formdata", formData);
    // const newMovie = { title: req.body.movieTitle, year: req.body.movieYear };
    // frenchMovies = [...frenchMovies, newMovie];
    // res.sendStatus(201);

    const title = req.body.movieTitle;
    const year = req.body.movieYear;
    const myMovie = new Movie({ movieTitle: title, movieYear: year });
    myMovie.save((err, savedMovie) => {
      if (err) {
        console.error(err);
        return;
      } else {
        console.log(savedMovie);
        res.sendStatus(201);
      }
    });
  }
});

app.get("/movies/add", (req, res) => {
  res.send("route add");
});

app.get("/movies/:id/:title", (req, res) => {
  const id = req.params.id;
  const title = req.params.title;
  // res.send(`vous regardez le film numéro ${id}`);
  res.render("movie-details", { moviesid: id, movietitle: title });
});

app.put("/movies/:id", urlencoded, (req, res) => {
  const id = req.params.id;
  if (!req.body) {
    return res.sendStatus(500);
  } else {
    console.log("req body", req.body);
    console.log("moviesTitle", req.body.movieTitle, req.body.movieYear);
    Movie.findByIdAndUpdate(
      id,
      {
        $set: {
          movieTitle: req.body.movieTitle,
          moviesYear: req.body.movieYear
        }
      },
      { new: true },
      (err, movie) => {
        if (err) {
          console.log(err);
          return res.send(`le film n'a pas pu être mis à jour`);
        } else {
          return res.sendStatus(200);
        }
      }
    );
  }
  // // pour vérifier avec postman ce que nous recevons
  // res.send(`PUT request to make of id ${id}`);
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/movie-search", (req, res) => {
  res.render("movie-search");
});

const fakeuser = {
  email: "cc",
  password: "cc"
};

app.get("/login", (req, res) => {
  res.render("login", { title: "Espace Membre" });
});

app.post("/login", urlencoded, (req, res) => {
  if (!req.body) {
    res.sendStatus(500);
  } else {
    if (
      req.body.email === fakeuser.email &&
      req.body.password === fakeuser.password
    ) {
      const myToken = jwt.sign(
        {
          iss: "http://expressmovies.fr",
          user: "sam",
          role: "moderator"
        },
        secret
      );
      res.json(myToken);
    } else {
      res.sendStatus(401);
    }
  }
  console.log("login post", req.body);
});

app.get("/member-only", (req, res) => {
  console.log("req.user", req.user);
  res.send(req.user);
});

app.listen(port, () => {
  console.log(`listen on the port ${port}`);
});

// mlab user
//Sam
// samsam69
