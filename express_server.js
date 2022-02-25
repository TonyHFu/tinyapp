//Importing requirements
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');


const {
  generateRandomString,
  getUserEmail,
  checkUserExistFromEmail,
  checkLoggedIn,
  getUserURLs,
  checkUserOwnShortURL,
  checkURLExist,
  getUserByEmail,
  createShortURL,
  checkUserOwnLongURL,
  editShortURL,
  createNewUser,
  parseLongURL,
  updateVisits
} = require("./helpers.js");

const {urlDatabase, users} = require("./data");

//Setting Up App
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));
app.use(cookieSession({
  name: 'session',
  keys: ["This is for tinyapp from LHL"],
  maxAge: 24 * 60 * 60 * 1000 
}));
app.use(methodOverride('_method'));

//Routes
app.get("/", (req, res) => {
  if (checkLoggedIn(req.session.user_id, users)) {
    return res.redirect("/urls");
  }
  return res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const userURLs = getUserURLs(req.session.user_id, urlDatabase);
  const email = getUserEmail(users, req.session.user_id);
  const loggedIn = checkLoggedIn(req.session.user_id, users);
  const templateVars = {
    urls: userURLs,
    username: email,
    loggedIn: loggedIn
  };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!checkLoggedIn(req.session.user_id, users)) {
    res.statusCode = 401;
    return res.redirect("/login");
  } 
  const email = getUserEmail(users, req.session.user_id);
  const templateVars = {
    username: email
  }
  return res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!checkLoggedIn(req.session.user_id, users)) {
    res.statusCode = 401;
    return res.end("You are not logged in");
  } 
  //Check for http:// and prepend if not there
  const longURL = parseLongURL(req.body.longURL);
  
  if (checkUserOwnLongURL(req.session.user_id, longURL, urlDatabase)) {
    res.statusCode = 405;
    return res.end("You already have a short URL for this long URL");
  }

  const shortURL = createShortURL(longURL, urlDatabase, req.session.user_id);

  return res.redirect("/urls/" + shortURL);
});

app.get("/urls/:shortURL", (req, res) => {
  
  if(!checkLoggedIn(req.session.user_id, users)) {
    res.statusCode = 401;
    return res.end("You need to login to do this");
  }
  
  if (!checkURLExist(req.params.shortURL, urlDatabase)) {
    res.statusCode = 404;
    return res.end("This shortened URL is not registered");
  }

  if (!checkUserOwnShortURL(req.session.user_id, urlDatabase, req.params.shortURL)) {
    res.statusCode = 401;
    return res.end("You do not have permission to access this short url");
  }

  const email = getUserEmail(users, req.session.user_id);
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    username: email,
    visits: urlDatabase[req.params.shortURL].visits,
    visitors: urlDatabase[req.params.shortURL].visitors
  };
  return res.render("urls_show", templateVars);
    
});

app.delete("/urls/:shortURL", (req, res) => {
  if (!checkURLExist(req.params.shortURL, urlDatabase)) {
    res.statusCode = 404;
    return res.end("This shortened URL is not registered");
  }
  if (!checkUserOwnShortURL(req.session.user_id, urlDatabase, req.params.shortURL)) {
    res.statusCode = 401;
    return res.end("You do not own this short URL");
  }

  delete urlDatabase[req.params.shortURL];
  return res.redirect("/urls");
    
});

app.put("/urls/:shortURL", (req, res) => {
  if (!req.body.newURL) {
    res.statusCode = 400;
    return res.end("You need to enter a new URL");
  }
  //If POST request was made outside browser
  if (!checkURLExist(req.params.shortURL, urlDatabase)) {
    res.statusCode = 404;
    return res.end("This shortened URL is not registered");
  }
  if (!checkUserOwnShortURL(req.session.user_id, urlDatabase, req.params.shortURL)) {
    res.statusCode = 401;
    return res.end("You do not own this short URL");
  }
  const newURL = parseLongURL(req.body.newURL);
  editShortURL(req.params.shortURL, urlDatabase, newURL);

  return res.redirect("/urls");
    
});

app.get("/u/:shortURL", (req,res) => {
  if(!checkURLExist(req.params.shortURL, urlDatabase)) {
    res.statusCode = 404;
    return res.end("Sorry, this short URL is not registered");
  }
  if (!req.session.visitor_id) {
    req.session.visitor_id = generateRandomString(6);
  }
  
  const longURL = urlDatabase[req.params.shortURL].longURL;
  updateVisits(req.params.shortURL, urlDatabase, req.session.visitor_id);
  return res.redirect(longURL);
});

app.get("/login", (req, res) => {
  if (checkLoggedIn(req.session.user_id, users)) {
    return res.redirect("/urls");
  }
  const templateVars = {
    username: undefined
  };
  return res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    console.log("User with email " + req.body.email + " does not exist");
    res.statusCode = 403;
    return res.end("User email and password does not match");
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    console.log("Login from user email " + req.body.email + " failed because of wrong password");
    res.statusCode = 403;
    return res.end("User email and password does not match");
  }
  req.session.user_id = user.id;  
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (checkLoggedIn(req.session.user_id, users)) {
    res.statusCode = 403;
    return res.redirect("/urls");
  }
  const templateVars = {
    username: undefined
  };
  return res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (checkLoggedIn(req.session.user_id, users)) {
    res.statusCode = 403;
    return res.end("Can't register while logged in");
  }
  if (req.body.email === "") {
    res.statusCode = 400;
    return res.end("You need to enter an email");
  } 
  if (checkUserExistFromEmail(req.body.email, users)) {
    res.statusCode = 400;
    return res.end("User already exists");
  } 
  if (req.body.password === "") {
    res.statusCode = 400;
    return res.end("You need to choose a password");
  } 
  req.session.user_id = createNewUser(req.body.email, req.body.password, users);
  return res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});