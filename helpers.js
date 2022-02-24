const bcrypt = require('bcryptjs');

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
  return users[req.session.user_id] ? users[req.session.user_id].email : undefined;
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
  return undefined;
};

const getUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
}


const checkLoggedIn = (req, users) => {
  return Object.keys(users).includes(req.session.user_id);
};

const getUserURLs = (user_id, urlDatabase) => {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === user_id) {
      userURLs[shortURL] = {
        longURL: urlDatabase[shortURL].longURL,
        userID: user_id
      };
    }
  }
  return userURLs;
};

const checkUserOwnShortURL = (req, urlDatabase, shortURL) => {
  if (! (shortURL in urlDatabase)) {
    return false;
  }
 return urlDatabase[shortURL].userID === req.session.user_id;
};

const checkURLExist = (shortURL, urlDatabase) => {
  return shortURL in urlDatabase;
};

const createShortURL = (longURL, urlDatabase, user_id) => {
  const shortURL = generateRandomString(6);
  while(shortURL in urlDatabase) {
    shortURL = generateRandomString(6);
  }
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user_id,
    visits: [],
    visitors: {}
  };
  
  return shortURL;
  
};

const checkUserOwnLongURL = (user_id, longURL,  urlDatabase) => {
  const userURLs = getUserURLs(user_id, urlDatabase);
  for (let url in userURLs) {
    if (userURLs[url].longURL === longURL) {
      return true;
    }
  }
  return false;
};

const editShortURL = (shortURL, urlDatabase, user_id, newURL) => {
  const existingLongURL = urlDatabase[shortURL].longURL;
  urlDatabase[newURL] = {
    longURL: existingLongURL,
    userID: user_id
  };
  delete urlDatabase[shortURL];
};

const createNewUser = (email, password, users) => {
  const userRandomID = generateRandomString(6);
  users[userRandomID] = {
    id: userRandomID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  return userRandomID;
};
const parseLongURL = (longURL) => {
  if (/^[(\/\/)(http:\/\/)]/.test(longURL)) {
    return longURL;
  }
  return "http://" + longURL;
};

module.exports = {
  generateRandomString,
  getUserEmail,
  checkUserExistFromEmail,
  getUserIdFromEmail,
  checkLoggedIn,
  getUserURLs,
  checkUserOwnShortURL,
  checkURLExist,
  getUserByEmail,
  createShortURL,
  checkUserOwnLongURL,
  editShortURL,
  createNewUser,
  parseLongURL
}