
function generateRandomString() {
  let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
  let result="";
  for (let i = 0; i < 6; i++){
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
};

const findUser = function(email, database) {
  for (const user in database){
    const foundUser = database[user];
    if (foundUser.email === email) {
      return foundUser
    }
  }
  return null;
}

const urlCheck = function(ourID) {
  for (const urls in urlDatabase){
    if (ourID === urls){
      return urls;
    }
    }
    return null;
  }

  const urlsForUser = function(id) {
    let urls = {};
    for (let url in urlDatabase){
      if (urlDatabase[url].userID === id) {
        urls[url]= urlDatabase[url].longURL;
      }
    }
    return urls;
  }


  module.exports = { generateRandomString, findUser, urlCheck, urlsForUser}