const express = require("express");
const app = express();
const PORT = 8000; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
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
  // res.cookie("username", req.body.username);
  // console.log('Cookies: ', req.cookies)
  res.redirect("/urls")
})
//GET LOGIN
app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("login.ejs", templateVars);
})

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

//REGISTER
app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("register.ejs", templateVars)
})

app.post("/register", (req, res) => {
console.log(req.body,"BODY", req.param, "PARAM", req.cookies, "COOKIES");
if(!req.body.email || !req.body.password){
  return res.status(400).send("invalid username/password");
}
if (findUser(req.body.email)){
  return res.status(400).send("email is already in use!");
}
let id = generateRandomString();
users[id] = {
  id: id,
  email: req.body.email,
  password: req.body.password
}
res.cookie("user_id", id)
res.redirect("/urls");
})

app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
 // Log the POST request body to the console
  res.redirect(`/urls/${id}`);
})

//UPDATES URL RESOURCE
app.post("/urls/:id", (req, res) => {
let newURL = req.body.longURL;
let id = req.params.id;
urlDatabase[id] = newURL;
res.redirect('/urls');
})

//MAKE NEW LINK
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_new", templateVars);
});

// SHOW INFORMATION ABOUT LINK 
app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], urls: urlDatabase, user: user };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

//DELETION
app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id;
  console.log(id);
  delete urlDatabase[id];
  res.redirect("/urls");
})

//REDIRECT TO ACTUAL LINK
app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL)
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



function generateRandomString() {
  let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
  let result="";
  for (let i = 0; i < 6; i++){
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
};

const findUser = function(email) {
  for (const user in users){
    const foundUser = users[user];
    if (foundUser.email === email) {
      return foundUser
    }
  }
  return null;
}