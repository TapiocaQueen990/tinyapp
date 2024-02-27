const express = require("express");
const app = express();
const PORT = 8000; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  getUserByEmail,
  urlCheck,
  urlsForUser,
  checkAuthorization
} = require("./helpers");
const { urlDatabase, users } = require("./data.js")
//MIDDLEWARES

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: ["oncidium"],
  })
);




app.get("/", (req, res) => {
  return res.redirect(302, "/login");
});

//LOGIN/LOGOUT
app.post("/login", (req, res) => {
  if (!getUserByEmail(req.body.email, users)) {
    return res.status(403).send("Email can not be found!");
  }
  const user = getUserByEmail(req.body.email, users);
  if (!bcrypt.compareSync(`${req.body.password}`, user.password)) {
    return res.status(403).send("Incorrect password!");
  }
  req.session.user_id = user.id;

  res.redirect("/urls");
});

//GET LOGIN
app.get("/login", (req, res) => {
  if (!req.session.user_id) {
    const user_id = req.session.user_id;
    const user = users[user_id];
    const templateVars = { urls: urlDatabase, user: user };
    return res.render("login.ejs", templateVars);
  }  
    return res.redirect("/urls");
  
});

//REGISTER
app.get("/register", (req, res) => {
  if (!req.session.user_id) {
    const user_id = req.session.user_id;
    const user = users[user_id];
    const templateVars = { urls: urlDatabase, user: user };
    return res.render("register.ejs", templateVars);
  } 
    return res.redirect("/urls");
  
});
//LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("invalid username/password");
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("email is already in use!");
  }
  const id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  
  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("please register or log in!");
  }
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("please register and sign in before shortening urls!");
  }
  const id = generateRandomString();
   urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  
  return res.redirect(`/urls/${id}`);
});

//UPDATES URL RESOURCE
app.post("/urls/:id", (req, res) => {
  
  const newURL = req.body.longURL;
  const id = req.params.id;
  const oldURL = urlDatabase[id];
  oldURL.longURL = newURL;
  res.redirect("/urls");
});

//MAKE NEW LINK
app.get("/urls/new", (req, res) => {
  
  if (!req.session.user_id) {
    
    return res.redirect(302, "/login")
  }
  const user_id = req.session.user_id;
  const user = users[user_id];

  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_new", templateVars);
});

// SHOW INFORMATION ABOUT LINK
app.get("/urls/:id", (req, res) => {
  
  if (!urlDatabase[req.params.id]) {
    return res.status(403).send("This does not exist");
  }

  const urlID = req.params.id;
  const user = checkAuthorization(req, res, urlID, urlDatabase, users);

  if (!user) {
    return;
  }
  
  const urlKey = urlDatabase[urlID];
  const user_id = req.session.user_id;
  
  const long = urlKey.longURL;
  if (urlKey.userID !== user_id) {
    return res.status(403).send("This does not belong to you");
  }
  
  
  const userURLs = urlsForUser(user_id);

  const templateVars = {
    id: req.params.id,
    longURL: long,
    url: userURLs,
    user: user,
    userURLs: userURLs,
  };
  
  if (urlKey.userID === user_id) {
    return res.render("urls_show", templateVars);
  } 
    return res.status(403).send("No access for you ;)");
  
});

//DELETION
app.post("/urls/:id/delete", (req, res) => {
  const urlID = req.params.id;
  const urlData = urlDatabase[urlID];
  
  const user = checkAuthorization(req, res, urlID, urlDatabase, users);

  if (!user) {
    return;
  }
 
  delete urlDatabase[urlID];
  res.redirect("/urls");
});

//REDIRECT TO ACTUAL LINK
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];
  if (urlCheck(id, urlDatabase)) {
    const long = urlDatabase[req.params.id];
    const actualURL = long.longURL;
    res.redirect(actualURL);
  } 
    res.send("This link does not exist");
 
});

//ETC BELOW
app.get("/", (req, res) => {
  const user = checkAuthorization(req, res, urlID, urlDatabase, users);
  if (!user) {
    return res.redirect(302, "/login");
  }
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
