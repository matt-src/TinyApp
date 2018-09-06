var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
app.use(cookieParser())
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//res.cookie('some_cross_domain_cookie', 'http://mysubdomain.example.com',{domain:'example.com', encode: String});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
  }
  res.render("partials/_header", templateVars)
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

app.get("/urls", (req, res) => {
    let templateVars = { 
      username: req.cookies["username"],
      urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/urls/:id", (req, res) => {
    let templateVars = { 
      username: req.cookies["username"],
        shortURL: req.params.id,
        urls: urlDatabase
     };
    res.render("urls_show", templateVars);
  });
  //Receive new url and add it 
  app.post("/urls", (req, res) => {
    console.log(req.body);  // debug statement to see POST parameters
    urlDatabase[generateRandomString(6)] = req.body.longURL
    res.send("Ok");         // Respond with 'Ok' (we will replace this)
    console.log("new URL db is " + JSON.stringify(urlDatabase))
  });
  //Receive a new url to update 
  app.post("/urls/:id", (req, res) => {
    var id = req.params.id
    var newURL = req.body.newURL
    console.log("Updating URL with id: " + id);  // debug statement to see POST parameters
    console.log("new URL is: " + newURL)
    console.log("Old db: " + JSON.stringify(urlDatabase))
    urlDatabase[id] = newURL
    console.log("New db: " + JSON.stringify(urlDatabase))
    res.redirect("/urls")
  });

  app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
  });

    // POST method route
    app.post('/urls/:id/delete', function (req, res) {
        var delTarg = req.body.delTarg
       console.log("Received delete request " + delTarg)
       console.log("Old db: " + JSON.stringify(urlDatabase))
       console.log("We are going to delete " + urlDatabase[delTarg])
       delete urlDatabase[delTarg]
       console.log("New db: " + JSON.stringify(urlDatabase))
       res.redirect("/urls")
        //res.send('POST request to the homepage')
    })

    //Handle login
    app.post("/login", (req, res) => {
      var username = req.body.username
      console.log("Logged in as " + username)
      res.cookie('username', username)
      res.redirect("/urls")
    });

    app.post("/logout", (req, res) => {
      console.log("Logging out")
      res.clearCookie('username')
      res.redirect("/urls")
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