var express = require('express');
//var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
var app = express();
//app.use(cookieParser());
var PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
let templateVars = {
	user: 'none',
	users: {}
};

var hashedPassword = undefined;

app.use(cookieSession({
  name: 'session',
  keys: ['key123', 'key142']
}))

app.use(bodyParser.urlencoded({extended: true}));

app.use((req, res, next) => {
	templateVars.user = users[req.session.user_id];
	templateVars.users = users;
	next();
});

var urlDatabase = {
	'b2xVn2' : {
		longURL: 'http://www.lighthouselabs.ca',
		userID: 'userRandomID'
	},
	'9sm5xK' : {
		longURL : 'http://www.google.com',
		userID: 'user2RandomID'
	}
};

const users = {
	'userRandomID': {
		id: 'userRandomID', 
		email: 'user@example.com', 
		password: 'purple-monkey-dinosaur'
	},
	'user2RandomID': {
		id: 'user2RandomID', 
		email: 'user2@example.com', 
		password: 'dishwasher-funk'
	}
};

app.get('/', (req, res) => {
	let templateVars = { 
		user: req.session.user_id,
		users: users
	};
	res.render('partials/_header', templateVars);
});

app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});
//Retrieve URLs if we are logged in
app.get('/urls', (req, res) => {
	let templateVars = { 
		user: req.session.user_id,
		urls: urlDatabase,
		users: users
  };
  if(!templateVars.user){
		res.send('Please log in to access this page <br /> \
		<a href="/login">Log In</a> <br /> \
		<a href="/register">Register</a>'
		)
  }
	res.render('urls_index', templateVars);
});
//Serve the create new URL page
app.get('/urls/new', (req, res) => {
	let templateVars = { 
		user: req.session.user_id,
		urls: urlDatabase,
		users: users
	};
	if(!req.session.user_id){
		res.redirect('/login');
	}
	res.render('urls_new', templateVars);
});
//Show URL with a specific short ID
app.get('/urls/:id', (req, res) => {
	let templateVars = { 
		user: req.session.user_id,
		shortURL: req.params.id,
		urls: urlDatabase,
		users: users
	};
	res.render('urls_show', templateVars);
});
//Receive new url and add it 
app.post('/urls', (req, res) => {
	var tmp = {
		userID : req.session.user_id,
		longURL : req.body.longURL
  };
  if(typeof userID == undefined){
    res.send('Please log in to access this page')
	}
	//Generate a random key for the new user and store their information under it
	urlDatabase[generateRandomString(6)] = tmp;
	res.redirect('/urls');         // Respond with 'Ok' (we will replace this)
});
//Receive a new url to update 
app.post('/urls/:id', (req, res) => {
	var shortURL = req.params.id;
  var newURL = req.body.newURL;
  var tmp = {
		userID : req.session.user_id,
		longURL : newURL
  };
	urlDatabase[shortURL] = tmp;
	res.redirect('/urls');
});
//Redirect to the LongURL associated with the shortURL specified
app.get('/u/:shortURL', (req, res) => {
	let shortURL = req.params.shortURL
	if(urlDatabase[shortURL].longURL){
	var longURL = urlDatabase[shortURL].longURL;
	}
	else{
		res.send("URL does not exist")
	}
	res.redirect('http://' + longURL);
});

app.get('/login', (req, res) => {
	let templateVars = { 
		user: req.session.user_id,
		users: users,
		shortURL: req.params.id,
		urls: urlDatabase
	};
	res.render('urls_login', templateVars);
});

app.get('/register', (req, res) => {
	res.render('urls_register', templateVars);
});
//Register a new user if they entered a valid email + password, and email is not already in use
app.post('/register', function (req, res) {
	let newEmail = req.body.email;
	for(var member in users){
		if(users[member].email == newEmail){
			res.send('Email already in use')
		}
	}
  let newPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newPassword, 6);
	if(newEmail.length < 1 || hashedPassword.length < 1){
		res.status(400);
		res.send('Empty email or password');
	}
	let randID = generateRandomString(10);
	var newUser = {
		id: randID,
		email: newEmail,
		password: hashedPassword
	};
	//set encrypted cookie
  req.session.user_id = randID
	//res.cookie('user_id', randID);
	users[randID] = newUser;
	res.redirect('/urls');
});
	//Delete URL with specified ID if requester is the owner
 app.post('/urls/:id/delete', function (req, res) {
  var delTarg = req.body.delTarg;
  if(typeof urlDatabase[delTarg] == undefined){
    res.send('It appears our database has broken, please reload the page')
  }
	let ownerID = urlDatabase[delTarg].userID;
  let userID = req.session.user_id;
	if(!req.session.user_id){
		res.redirect('/login');
	}
	else if (ownerID == userID){
    delete urlDatabase[delTarg]
		res.redirect('/urls');
	}
	else {
		res.send('something went wrong')
	}
});

//Handle login
app.post('/login', (req, res) => {
	let email = req.body.email;
	let password = req.body.password;
	var found = false;
	//See if the email exists
	for(var member in users){
		if(users[member].email == email){
			found = true;
		}
	}
	if(!found){
		res.status(403);
		res.send('Email not found');
  }
	else{
		//See if our the hash of our password matches the hash stored in our DB for the user
    let targetHash = users[member].password;
		let authed = false;
    authed = bcrypt.compareSync(password, targetHash);
      if(authed){
			req.session.user_id = member
      res.redirect('/');
      }
      else{
        res.redirect('/');
      }
		}
	});

app.post('/logout', (req, res) => {
	res.clearCookie('session');
	res.redirect('/urls');
});

app.listen(PORT, () => {
	//Listening
});

function generateRandomString(digits) {
	//Solution from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < digits; i++){
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}