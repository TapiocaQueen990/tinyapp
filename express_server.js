const express = require("express");
const app = express();
const PORT = 8000; // default port 8080
const cookieSession = require("cookie-session")
const bcrypt = require("bcryptjs");
const { generateRandomString, findUser, urlCheck, urlsForUser } = require("./helpers")
//MIDDLEWARES
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ['oncidium']
}));

// WHY DO THE EDIT BUTTONS ALL LEAD TO TSN !!!!!!!!!!!!
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  }
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
}


//LOGIN/LOGOUT
app.post("/login", (req, res) => {
  console.log(req.body,"BODY", req.params, "PARAM", req.session, "COOKIES");
  if(!findUser(req.body.email, users)) {
    return res.status(403).send("Email can not be found!");
  }
  let user = findUser(req.body.email, users);
  // if(user.password !== req.body.password){
    let secret = bcrypt.hashSync(req.body.password, 10);
  if(!bcrypt.compareSync(`${req.body.password}`, user.password)) {
    return res.status(403).send("Incorrect password!");
  }
  res.session.user_id = user.id
  // ("user_id", user.id)
  // res.cookie("username", req.body.username);
  // console.log('Cookies: ', req.cookies)
  res.redirect("/urls")
})
//GET LOGIN
app.get("/login", (req, res) => {
  if(!req.session.user_id){
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  return res.render("login.ejs", templateVars);
  } else {
    return res.redirect("/urls");
  }
})

//REGISTER
app.get("/register", (req, res) => {
  
  if(!req.session.user_id){
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  return res.render("register.ejs", templateVars)
  } else {
    return res.redirect("/urls");
  }
})
//LOGOUT
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
})



app.post("/register", (req, res) => {

if(!req.body.email || !req.body.password){
  return res.status(400).send("invalid username/password");
}
if (findUser(req.body.email, users)){
  return res.status(400).send("email is already in use!");
}
let id = generateRandomString();
users[id] = {
  id: id,
  email: req.body.email,
  password: bcrypt.hashSync(req.body.password, 10)
}
console.log(users);
req.session.user_id = id;
res.redirect("/urls");
})

app.get("/urls", (req, res) => {
  if(!req.session.user_id){
    return res.send("please register or log in!")
  }
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  
  if(!req.session.user_id){
   return  res.send("please register and sign in before shortening urls!");
  }
  let id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
 // Log the POST request body to the console
  return res.redirect(`/urls/${id}`);
})

//UPDATES URL RESOURCE
app.post("/urls/:id", (req, res) => {
  
let newURL = req.body.longURL;
let id = req.params.id;
let oldURL = urlDatabase[id];
oldURL.longURL = newURL;
res.redirect('/urls');
})

//MAKE NEW LINK
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  if(!req.session.user_id){
    return res.redirect("/login");
  }
 
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_new", templateVars);
});

// SHOW INFORMATION ABOUT LINK 
app.get("/urls/:id", (req, res) => {
  if(!req.session.user_id){
    return res.send("please log in first");
  }
  let urlID = req.params.id;
  let urlKey = urlDatabase[urlID];
  let long = urlKey.longURL
  const user_id = req.session.user_id;
  const user = users[user_id];
  let userURLs = urlsForUser(user_id);

  const templateVars = { id: req.params.id, longURL: long, url: userURLs, user: user, userURLs: userURLs };
  console.log(templateVars, "TEMPLATE VARS")
  if (urlKey.userID === user_id){
  
  res.render("urls_show", templateVars);
  } else {
    return res.status(403).send("No access for you ;)");
}
});

//DELETION
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body,"BODY", req.params, "PARAM", req.session, "COOKIES");
  console.log(urlDatabase, "URLS");
  if(!req.session.user_id){
    return res.send("please sign in first!")
  }
  console.log(urlDatabase);
  let urlID = req.params.id
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
  if(urlCheck(id)){
  let long = urlDatabase[req.params.id];
  let actualURL = long.longURL
  res.redirect(actualURL)
  } else {
    res.send("This link does not exist");
  }
})

//ETC BELOW
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


