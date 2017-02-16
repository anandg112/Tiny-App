const express =require("express");
const bodyParser = require("body-parser");
const generateRandNum = require("./random.js");
const cookieParser = require("cookie-parser");

const app = express();

app.set("view engine", "ejs");
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!"); // Homepage
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //showing the database
});

// app.get("/hello", (req, res) =>{
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase,  username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id],  username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log('REQ BODY', req.body);  // debug statement to see POST parameters
  let newShortURL = generateRandNum();
  let longURL = req.body.longURL;
  urlDatabase[newShortURL] = longURL;
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect("/urls"+"/"+newShortURL);
});

//POST /urls/:id/delete
app.post("/urls/:id/delete", (req, res) =>{
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//POST /urls/:id
app.post("/urls/:id/update", (req, res) => {
  let newLongURL = req.body.longURL;
  urlDatabase[req.params.id] = newLongURL;
  console.log(urlDatabase[req.params.id]);
  res.redirect("/urls");
});

app.post("/login/", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username);
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
