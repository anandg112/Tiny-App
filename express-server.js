const express =require("express");
const bodyParser = require("body-parser");
const generateRandNum = require("./random.js");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

const app = express();

app.set("view engine", "ejs");
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

let urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca",
              userID:  "userRandomID"
            },
  "9sm5xK": { longURL: "http://www.google.com",
              userID:  "user2RandomID"
            },
};


//Homepage routing
app.get("/", (req, res) => {
  res.end("Hello!"); // Homepage
});

//Showing the urlDatabase
app.get("/apis", (req, res) => {
  res.json({urls: urlDatabase, user: users}); //showing the database
});

function urlsForUser(id){
  const userURLs = {};
  for(shortURL in urlDatabase){
    if(id === urlDatabase[shortURL].userID){
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

//Showing the URL index page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.cookies["userCookie"]), user_id: users[req.cookies["userCookie"]] };
  res.render("urls_index", templateVars);
});

//Routing the new short URL page
app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase, user_id: req.cookies["userCookie"],  users: users  };
  if(req.cookies.userCookie){
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Showing the URLs
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user_id: req.cookies["userCookie"],  users: users};
  res.render("urls_show", templateVars);
});

//Generating a shortURL for longURL
app.post("/urls", (req, res) => {
  console.log('REQ BODY', req.body);  // debug statement to see POST parameters
  let newShortURL = generateRandNum();
  let longURL = req.body.longURL;
  urlDatabase[newShortURL] = {longURL: longURL, userID:req.cookies["userCookie"]};
  res.redirect("/urls"+"/"+newShortURL);
});

//Deleting an URL
app.post("/urls/:id/delete", (req, res) =>{
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//Redirecting to the long URL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Updating the URL
app.post("/urls/:id/update", (req, res) => {
  let newLongURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = newLongURL;
  console.log(urlDatabase[req.params.id]);
  res.redirect("/urls");
});

app.get("/login", (req, res) =>{
  res.render("login.ejs")
});

//Routing login page
app.post("/login", (req, res) => {
  let userName = req.body.email;
  let pwd = req.body.password;
  for(let user_id in users){
    const match = bcrypt.compareSync(pwd, users[user_id].password);
      if(users[user_id].email === userName && (match === true)){
        res.cookie('userCookie', user_id);
        console.log(users);
        res.redirect("/urls");
    }
  }
  res.status(403).send("You have not registered yet!");
});

//Routing logout page
app.post("/logout", (req, res) => {
  res.clearCookie("userCookie");
  res.redirect("/urls");
});

//Routing register page
app.get("/register", (req, res) => {
  res.render("user-reg.ejs");
});

//Getting form data and posting to the users database
app.post("/register", (req, res) => {
  let email = req.body.email;
  let pwd = req.body.password;
  let hashed_password = bcrypt.hashSync(pwd, 10);
  let user_id = generateRandNum();

  if(email === "" || pwd === ""){
    res.status(400).send("Please specify both fields");
  }

  for(let k in users) {
    if(users[k].email === email){
      res.status(400).send("Your email was already registered");
      return;
    }
      users[user_id] = {email: email, password: hashed_password };
      res.cookie("userCookie", user_id);
      console.log(users);
      res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
