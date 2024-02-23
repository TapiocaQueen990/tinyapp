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

//LOGIN/LOGOUT
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  console.log('Cookies: ', req.cookies)
  res.redirect("/urls")
})
//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

//REGISTER
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("register.ejs", templateVars)
})
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// SHOW INFORMATION ABOUT LINK 
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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