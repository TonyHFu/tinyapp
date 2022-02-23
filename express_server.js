const express = require("express");
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const morgan = require("morgan");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session')
const {
  generateRandomString,
  getUserEmail,
  checkUserExistFromEmail,
  getUserIdFromEmail,
  checkLoggedIn,
  getUserURLs,
  checkUserOwnShortURL,
  checkURLExist,
  getUserByEmail,
  createShortURL
} = require("./helpers.js");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "abcdef"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "abcdef"
  }
};

const users = {
  "abcdef": {
    id: "abcef",
    email: "admin@me.com",
    password: '$2a$10$8dSIPxTcar9ytSyN/TuUV.nct8sadHEi7ZfoLJ2jHwW1DxfduVT8q'
  }
};

const app = express();
const PORT = 8080;




app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(morgan("dev"));
app.use(cookieSession({
  name: 'session',
  keys: ["This is for tinyapp from LHL"],
  maxAge: 24 * 60 * 60 * 1000 
}));


app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  // console.log(req.cookies);
  // console.log(checkLoggedIn(req));
  const userURLs = getUserURLs(req.session.user_id, urlDatabase);
  const email = getUserEmail(users, req);
  const loggedIn = checkLoggedIn(req, users);
  const templateVars = {
    urls: userURLs,
    username: email,
    loggedIn: loggedIn
  };
  // console.log("templateVars", templateVars);
  // console.log("users", users);

  return res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  if (!checkLoggedIn(req, users)) {
    res.statusCode = 401;
    return res.redirect("/login");
  } 
  const email = getUserEmail(users, req);
  const templateVars = {
    username: email
  }
  return res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!checkLoggedIn(req, users)) {
    res.statusCode = 401;
    return res.end("You are not logged in");
  } 
  // console.log(req.body);
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);

  createShortURL(longURL, urlDatabase, req.session.user_id);

  return res.redirect("/urls/" + shortURL);
  
  
});

app.get("/urls/:shortURL", (req, res) => {
  if (!checkURLExist(req, urlDatabase)) {
    res.statusCode = 404;
    return res.end("This shortened URL is not registered");
  }

  if (!checkUserOwnShortURL(req, urlDatabase, req.params.shortURL)) {
    res.statusCode = 401;
    return res.end("You do not have permission to access this short url");
  }

  const email = getUserEmail(users, req);
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    username: email
  };
  return res.render("urls_show", templateVars);
    
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!checkURLExist(req, urlDatabase)) {
    res.statusCode = 404;
    return res.end("This shortened URL is not registered");
  }
  if (!checkUserOwnShortURL(req, urlDatabase, req.params.shortURL)) {
    res.statusCode = 401;
    return res.end("You do not own this short URL");
  }

  delete urlDatabase[req.params.shortURL];
  return res.redirect("/urls");
    
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (!checkURLExist(req, urlDatabase)) {
    res.statusCode = 404;
    return res.end("This shortened URL is not registered");
  }
  if (!checkUserOwnShortURL(req, urlDatabase, req.params.shortURL)) {
    res.statusCode = 401;
    return res.end("You do not own this short URL");
  }
  
  const existingLongURL = urlDatabase[req.params.shortURL].longURL; 
  urlDatabase[req.body.newURL] = {
    longURL: existingLongURL,
    userID: req.session.user_id
  };
  delete urlDatabase[req.params.shortURL]
  // console.log(urlDatabase);
  return res.redirect("/urls");
    
});

app.get("/u/:shortURL", (req,res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  // console.log(users);
  const email = getUserEmail(users, req);
  const templateVars = {
    shortURL: req.params.shortURL, 
    // longURL: urlDatabase[req.params.shortURL].longURL,
    longURL: undefined,
    username: email
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  console.log("users", users);
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    res.statusCode = 403;
    return res.end("User email and password does not match");
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.statusCode = 403;
    return res.end("User email and password does not match");
  }
  req.session.user_id = user.id;  
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const email = getUserEmail(users, req);
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: undefined,
    username: email
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  
  if (req.body.email === "") {
    res.statusCode = 400;
    res.end("You need to enter an email");
  } else if (req.body.password === "") {
    res.statusCode = 400;
    res.end("You need to enter an password");
  } else if (checkUserExistFromEmail(req.body.email, users)) {
    res.statusCode = 400;
    res.end("User already exists");
  } else {
    const userRandomID = generateRandomString(6);
    users[userRandomID] = {
      id: userRandomID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = userRandomID;
    res.redirect("/urls");
  }
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});