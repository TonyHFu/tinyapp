const bcrypt = require('bcryptjs');

function generateRandomString(nums) {
  //generates num length random alphanumerical string. Uses 1 extra boolean letterCase to determine letter casing.  
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = '';
  for (let i = 0; i < nums; i++) {
    const letterCase = Math.round(Math.random());
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    if (letterCase) {
      randomString += randomLetter.toLowerCase();
    } else {
      randomString += randomLetter;
    }
  }
  return randomString;
};

function getUserEmail(users, user_id) {
  return users[user_id] ? users[user_id].email : undefined;
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


const checkLoggedIn = (user_id, users) => {
  return Object.keys(users).includes(user_id);
};

const getUserURLs = (user_id, urlDatabase) => {
  //Returns sub-object of urlDatabase only belonging to user_id
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

const checkUserOwnShortURL = (user_id, urlDatabase, shortURL) => {
  if (! (shortURL in urlDatabase)) {
    return false;
  }
 return urlDatabase[shortURL].userID === user_id;
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

const editShortURL = (shortURL, urlDatabase, newURL) => {
  urlDatabase[shortURL].longURL = newURL;
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

const updateVisits = (shortURL, urlDatabase, visitor_id) => {
  let visitTime = new Date();
  visitTime = visitTime.toUTCString();
  //visits is an array of objects containing visitor ID and visit time
  urlDatabase[shortURL].visits.push({
    visitor_id,
    visitTime
  });
  //visitors is an object with keys visitor IDs that contain values visitor ID and and array of when that visitor ID visited the site. Able to more easily keep track of visitor-specific behaviour for future functionality
  if (!urlDatabase[shortURL].visitors[visitor_id]) {
    urlDatabase[shortURL].visitors[visitor_id] = {
      visitor_id,
      visits: [visitTime]
    };
  } else {
    urlDatabase[shortURL].visitors[visitor_id].visits.push(visitTime);
  }
  return urlDatabase[shortURL].visits;
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
  parseLongURL,
  updateVisits
}