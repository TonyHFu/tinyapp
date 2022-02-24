const { assert } = require('chai');

const { getUserByEmail, parseLongURL }= require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user, testUsers[expectedUserID]);
  });
  it ("should return undefined if given non-existent email", () => {
    const user = getUserByEmail("user3@example.com", testUsers)
    // Write your assert statement here
    assert.equal(user, undefined);
  });
});

describe('parseLongURL', function() {
  it('should return same URL if begins with http://', function() {
    const longURL = "http://google.com";
    const actual = parseLongURL(longURL);
    assert.equal(actual, longURL);
  });
  it('should return same URL if begins with //', function() {
    const longURL = "//google.com";
    const actual = parseLongURL(longURL);
    assert.equal(actual, longURL);
  });
  it('should return prepended URL if does not begin with http://', function() {
    const longURL = "google.com";
    const actual = parseLongURL(longURL);
    const expected = "http://google.com";
    assert.equal(actual, expected);
  });
});