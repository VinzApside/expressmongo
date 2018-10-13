const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const multer = require("multer");
const upload = multer();

const port = 3000;
let frenchMovies = [];

//on déclare où sont nos views
app.set("views", "./views");

//on déclare le view engine
app.set("view engine", "ejs");

//middleware pour utiliser des fichiers statiques dans le dossier public
app.use("/public", express.static("public"));

// // parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }));
// // s'applique à tous le code

app.get("/movies", (req, res) => {
  // res.send("bientôt une liste de film ici !");
  const title = `Films américains`;

  frenchMovies = [
    { title: `Tron`, year: 1978 },
    { title: "Terminator", year: 1983 },
    { title: `2001 odysée de l'espace`, year: 1968 }
  ];
  res.render("movies", { movies: frenchMovies, title: title });
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
    const newMovie = { title: req.body.movieTitle, year: req.body.movieYear };
    frenchMovies = [...frenchMovies, newMovie];
    res.sendStatus(201);
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

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/movie-search", (req, res) => {
  res.render("movie-search");
});

app.listen(port, () => {
  console.log(`listen on the port ${port}`);
});