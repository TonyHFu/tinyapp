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
 return urlDatabase[shortURL].userID === req.session.user_id;
};

const checkURLExist = (req, urlDatabase) => {
  return req.params.shortURL in urlDatabase;
};

module.exports = {
  generateRandomString,
  getUserEmail,
  checkUserExistFromEmail,
  getUserIdFromEmail,
  checkLoggedIn,
  getUserURLs,
  checkUserOwnShortURL,
  checkURLExist
}