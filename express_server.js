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
} = require("./helpers");

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


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

app.get("/", (req, res) => {
  return res.redirect(302, "/login");
});

//LOGIN/LOGOUT
app.post("/login", (req, res) => {
  if (!getUserByEmail(req.body.email, users)) {
    return res.status(403).send("Email can not be found!");
  }
  let user = getUserByEmail(req.body.email, users);
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
  } else {
    return res.redirect("/urls");
  }
});

//REGISTER
app.get("/register", (req, res) => {
  if (!req.session.user_id) {
    const user_id = req.session.user_id;
    const user = users[user_id];
    const templateVars = { urls: urlDatabase, user: user };
    return res.render("register.ejs", templateVars);
  } else {
    return res.redirect("/urls");
  }
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
  let id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  console.log(users);
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
  let id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  return res.redirect(`/urls/${id}`);
});

//UPDATES URL RESOURCE
app.post("/urls/:id", (req, res) => {
  console.log(req.body, "BODY", req.params, "PARAM", req.session, "COOKIES");
  let newURL = req.body.longURL;
  let id = req.params.id;
  let oldURL = urlDatabase[id];
  oldURL.longURL = newURL;
  res.redirect("/urls");
});

//MAKE NEW LINK
app.get("/urls/new", (req, res) => {
  console.log("User ID:", req.session.user_id);
  if (!req.session.user_id) {
    console.log("Redirecting to login...");
    return res.redirect(302, "/login");
  }
  const user_id = req.session.user_id;
  const user = users[user_id];

  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_new", templateVars);
});

// SHOW INFORMATION ABOUT LINK
app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.send("please log in first");
  }
  let urlID = req.params.id;
  if (!urlDatabase[urlID]) {
    return res.status(403).send("Url doesnt exist");
  }
  let urlKey = urlDatabase[urlID];
  const user_id = req.session.user_id;
  const user = users[user_id];
  const long = urlKey.longURL;
  if (req.params.id !== urlKey) {
    return res.status(404).send("This does not exist");
  }
  if (urlKey.userID !== user_id) {
    return res.status(403).send("This does not belong to you");
  }
  let userURLs = urlsForUser(user_id);

  const templateVars = {
    id: req.params.id,
    longURL: long,
    url: userURLs,
    user: user,
    userURLs: userURLs,
  };
  console.log(templateVars, "TEMPLATE VARS");
  if (urlKey.userID === user_id) {
    res.render("urls_show", templateVars);
  } else {
    return res.status(403).send("No access for you ;)");
  }
});

//DELETION
app.post("/urls/:id/delete", (req, res) => {
  console.log(urlDatabase, "URLS");
  if (!req.session.user_id) {
    return res.send("please sign in first!");
  }
  console.log(urlDatabase);
  let urlID = req.params.id;
  let urlData = urlDatabase[urlID];

  if (!urlData) {
    return res.send("This URL doesnt exist");
  }
  if (urlData.userID !== req.session.user_id) {
    return res.send("This URL doesnt belong to you");
  }
  delete urlDatabase[urlID];
  res.redirect("/urls");
});

//REDIRECT TO ACTUAL LINK
app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  let url = urlDatabase[id];
  if (urlCheck(id, urlDatabase)) {
    let long = urlDatabase[req.params.id];
    let actualURL = long.longURL;
    res.redirect(actualURL);
  } else {
    res.send("This link does not exist");
  }
});

//ETC BELOW

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
