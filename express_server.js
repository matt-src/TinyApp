var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/urls/:id", (req, res) => {
    let templateVars = { 
        shortURL: req.params.id,
        urls: urlDatabase
     };
    res.render("urls_show", templateVars);
  });

  app.post("/urls", (req, res) => {
    console.log(req.body);  // debug statement to see POST parameters
    res.send("Ok");         // Respond with 'Ok' (we will replace this)
  });

  app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(digits) {
    //Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < digits; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

console.log(generateRandomString(6))