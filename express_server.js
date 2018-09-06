var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
app.use(cookieParser())
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

let templateVars = {
  user: "none",
  users: {}
};

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.use((req, res, next) => {
  templateVars.user = users[req.cookies.user_id];
  templateVars.users = users;
  next();
 });

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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
}

app.get("/", (req, res) => {
  let templateVars = { 
    user: req.cookies["user_id"],
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
      user: req.cookies["user_id"],
      urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.get("/urls/:id", (req, res) => {
    let templateVars = { 
      user: req.cookies["user_id"],
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

  app.get("/login", (req, res) => {
    let templateVars = { 
        user: req.cookies["user_id"],
        users: users,
        shortURL: req.params.id,
        urls: urlDatabase
     };
    res.render("urls_login", templateVars)
  });

  app.get("/register", (req, res) => {
    res.render("urls_register")
  });

  app.post('/register', function (req, res) {
    console.log("old user list: " + JSON.stringify(users))
    let newEmail = req.body.email;
    let newPassword = req.body.password;
    if(newEmail.length < 1 || newPassword.length < 1){
      res.status(400);
      res.send('Empty email or password');
    }
  let randID = generateRandomString(10)
    var newUser = {
      id: randID,
      email: newEmail,
      password: newPassword
    }
    //set cookie
    res.cookie('user_id', randID)
    users[randID] = newUser;
    console.log("new user list: " + JSON.stringify(users))
    res.redirect("/urls")
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
      let email = req.body.email;
      let password = req.body.password;
      var found = false;
      console.log("trying to log in with email " + email  + " and password " + password)
      //See if the email exists
      for(var em in users){
        console.log(em)
        
        console.log("checking " + users[em].email)
        if(users[em].email == email){
          console.log("email " + email + "located at id " + em)
          found = true;
        }
       //res.status(403);
        //res.send('Email not found');
      }
      if(!found){
        res.status(403);
        res.send('Email not found');
      }
      else{
        console.log("Email found, trying password")
        if(users[em].password === password){
          console.log("Password is correct! Logged in!")
          res.cookie('user_id', em)
          res.redirect("/")
        }
        else{
          console.log("Password is wrong!")
          res.status(403);
          res.send('Incorrect password');
        }
      }
      /*else if (!users[email] === pass){
        res.status(403);
        res.send('Incorrect password');
      }
      else{
        res.cookie('user_id', randID)
      }*/
    });

    app.post("/logout", (req, res) => {
      console.log("Logging out")
      res.clearCookie('user_id')
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