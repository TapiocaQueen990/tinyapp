const { urlDatabase, users } = require("./data.js");

function generateRandomString() {
  let characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}

const getUserByEmail = function (email, database) {
  for (const user in database) {
    const foundUser = database[user];
    if (foundUser.email === email) {
      return foundUser;
    }
  }
  return null;
};

const urlCheck = function (ourID, database) {
  for (const urls in database) {
    if (ourID === urls) {
      return urls;
    }
  }
  return null;
};

const urlsForUser = function (id) {
  let urls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url].longURL;
    }
  }
  return urls;
};

const checkAuthorization = (req, res, urlID, urlDatabase, users) => {
  if (!req.session.user_id) {
    return res.status(403).send("Please log in first.");
  }

  const urlData = urlDatabase[urlID];
  if (!urlData) {
    return res.status(403).send("This URL doesn't exist.");
  }

  const user_id = req.session.user_id;
  const user = users[user_id];

  if (urlData.userID !== user_id) {
    return res.status(403).send("This URL doesn't belong to you.");
  }

  return user;
};



module.exports = {
  generateRandomString,
  getUserByEmail,
  urlCheck,
  urlsForUser,
  checkAuthorization
};
