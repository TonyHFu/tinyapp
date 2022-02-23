const { assert } = require('chai');

const { getUserIdFromEmail } = require('../helpers.js');

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

describe('getUserIdFromEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserIdFromEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedUserID);
  });
  it ("should return undefined if given non-existent email", () => {
    const user = getUserIdFromEmail("user3@example.com", testUsers)
    // Write your assert statement here
    assert.equal(user, undefined);
  });
});