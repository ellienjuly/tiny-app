const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

const { authentication, createNewUser, findUser } = require('./helpers/userAuthentication');
const { emailCheck } = require('./helpers/emailCheck');

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "b2xVn1": {
    user_id: "b2xVn1",
    email: "test@email.com",
    password: '123'
  }
};

//generate short url
function generateRandomString() {
  const alphanumeric = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let randomString = [];
  
  for (let i = 0; i < 6; i++) {

    let char = alphanumeric[Math.floor(Math.random() * 36)];
    randomString.push(char);
  };
  return randomString.join('');
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const user = findUser(users, req.cookies.user_id);

  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies.user_id,
    email: user.email
  };

  res.render('urls_index', templateVars)
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const user = findUser(users, req.cookies.user_id);

  const templateVars = {
    urls: urlDatabase,
    user_id: user.user_id,
    email: user.email,
    password: user.password
  }
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const user = findUser(users, req.cookies.user_id);
  // urlDatabase[longURL] = req.params.shortURL;

  const templateVars = { 
    shortURL, 
    longURL, 
    urls: urlDatabase,
    user_id: user.user_id,
    email: user.email,
    password: user.password
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { username: users.user_id};
  res.redirect(longURL, templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const del = req.params.shortURL;
  delete urlDatabase[del];
  res.redirect(`/urls`)
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});

app.post('/urls/:id/edit', (req, res) => {
  const id = req.params.id;
  const newURL = req.body.newURL;
  urlDatabase[id] = newURL;
  res.redirect(`/urls/`);
});

app.get('/login', (req, res) => {
  const user = findUser(users, req.cookies.user_id);

  const templateVars = {
    urls: urlDatabase,
    user_id: user.user_id,
    email: user.email,
    password: user.password
  }

  console.log('Total users now:',users);
  res.render('urls_login', templateVars)
});


app.post('/login', (req, res) => {

  const { email, password } = req.body;

  const user = authentication(users, email, password);

  if (user) {
    res.cookie('user_id', user.user_id);
  }

  res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
});

app.get('/register', (req, res) => {
  const user = findUser(users, req.cookies.user_id);
  const templateVars = {
    urls: urlDatabase,
    user_id: user.user_id,
    email: user.email,
    password: user.password 
  };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  let ranId = generateRandomString();

  const userObject = {
    user_id: ranId,
    email: req.body.email,
    password: req.body.password
  }

  const user = createNewUser(users, userObject);
  if (user && user.user_id) {
    res.cookie('user_id', userObject.user_id);
  }
 
  const duplicatedEmail = emailCheck(user, userObject);
  if (duplicatedEmail) {
    res.render('400');
  }

  res.redirect('urls');
});



app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}!`);
});