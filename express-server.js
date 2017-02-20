const express =require("express");
const bodyParser = require("body-parser");
const generateRandNum = require("./random");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");

const app = express();

app.set("view engine", "ejs");
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


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

function checkForHttpPrefix(string) {
  var prefix = '';
  if (!/^(http|https|ftp):\/\/.*$/.test(string)) {
    prefix = "http://"
  }
  return `${prefix}${string}`;
};


//Homepage routing
app.get("/", (req, res) => {
  res.render("/urls"); // Homepage
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
  let templateVars = { urls: urlsForUser(req.session.userCookie),
  user_id: users[req.session.userCookie] };
  res.render("urls_index", templateVars);
});

//Routing the new short URL page
app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase,
    user_id: req.session.userCookie,
    users: users  };
  if(req.session.userCookie){
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Showing the URLs
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user_id: req.session.userCookie,
    users: users};
  res.render("urls_show", templateVars);
});

//Generating a shortURL for longURL
app.post("/urls", (req, res) => {
  //console.log('REQ BODY', req.body);  // debug statement to see POST parameters
  let newShortURL = generateRandNum();
  let longURL = req.body.longURL;
  urlDatabase[newShortURL] = {longURL: longURL, userID:req.session.userCookie};
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
        req.session.userCookie = user_id;
        res.redirect("/urls");
    }
  }
  res.status(403).send("You have not registered yet!");
});

//Routing logout page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Routing register page
app.get("/register", (req, res) => {
  let templateVars = {urls: urlDatabase,
  user_id: req.session.userCookie,
  users: users  };
  if(req.session.userCookie){
    res.render("urls", templateVars);
  } else {
    res.render("user-reg.ejs");
}
});

//Getting form data and posting to the users database
app.post("/register", (req, res) => {
  let email = req.body.email;
  let pwd = req.body.password;

  if(email === "" || pwd === ""){
    res.status(400).send("Please specify both fields");
  }

  let hashed_password = bcrypt.hashSync(pwd, 10);
  let user_id = generateRandNum();

  for(let k in users) {
    if(users[k].email === email){
      res.status(400).send("Your email was already registered");
      return;
    }
      users[user_id] = {email: email, password: hashed_password };
      req.session.userCookie = user_id;
      res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
