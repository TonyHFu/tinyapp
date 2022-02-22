const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require("morgan");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan("dev"));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

};

function generateRandomString(nums) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = '';
  for (let i = 0; i < nums; i++) {
    const letterCase = Math.round(Math.random());
    const randomLetter = alphabet[Math.floor(Math.random() * 36)];
    if (letterCase) {
      randomString += randomLetter.toLowerCase();
    } else {
      randomString += randomLetter;
    }
  }
  return randomString;
};

function getUserEmail(users, req) {
  return users[req.cookies["user_id"]] ? users[req.cookies["user_id"]].email : undefined;
};

const checkUserExistFromEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

const getUserIdFromEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  // console.log(req.cookies);
  const email = getUserEmail(users, req);
  const templateVars = {
    urls: urlDatabase,
    username: email
  };
  console.log("templateVars", templateVars);
  console.log("users", users);

  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const email = getUserEmail(users, req);
  const templateVars = {
    username: email
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.get("/urls/:shortURL", (req, res) => {
  const email = getUserEmail(users, req);
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: email
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  res.redirect(req.url);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const existingLongURL = urlDatabase[req.params.shortURL] 
  urlDatabase[req.body.newURL] = existingLongURL;
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req,res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const email = getUserEmail(users, req);
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: email
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  console.log("users", users);
  if (checkUserExistFromEmail(req.body.email, users) ){
    const userId = getUserIdFromEmail(req.body.email, users);
    if (users[userId].password === req.body.password) {
      res.cookie("user_id", userId);
    } else {
      res.statusCode = 403;
      res.end("Password does not match");
    }
  } else {
    res.statusCode = 403;
    res.end("User email does not exist")
  }
  
  
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const email = getUserEmail(users, req);
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
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
      password: req.body.password
    };
    res.cookie("user_id", userRandomID);
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