const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt-nodejs');
const cookieSession = require('cookie-session');

const { getUserByEmail, findUser, urlsForUser } = require('./helpers');

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "i6xds0"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "i6xds0"
  }
};

const users = {
  "i6xds0": {
    userID: "i6xds0",
    email: "test@email.com",
    password: '123'
  }
};

const generateRandomString = () => {
  const alphanumeric = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let randomString = [];
  
  for (let i = 0; i < 6; i++) {
    let char = alphanumeric[Math.floor(Math.random() * 36)];
    randomString.push(char);
  }
  return randomString.join('');
};

app.get('/', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  const user = findUser(users, req.session.userID);

  const templateVars = {
    urls: urlsForUser(req.session.userID, urlDatabase),
    userID: req.session.userID,
    email: user.email
  };

  if (req.session.userID) {
    res.render('urls_index', templateVars);
    return;
  }

  return res.status(401).send('<html><title></title><body><h3>Login to see the url list you created. <a href="/login">Login</a></body></html>');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const user = findUser(users, req.session.userID);

  const templateVars = {
    urls: urlDatabase,
    userID: user.userID,
    email: user.email,
    password: user.password
  };

  if (req.session.userID) {
    res.render('urls_new', templateVars);
    return;
  }
  res.redirect('/login');
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session.userID
  };

  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    return res.status(401).send('<html><title></title><body><h3>This url does not exist.</body></html>');
  }
  const longURL = urlDatabase[shortURL].longURL;
  const user = findUser(users, req.session.userID);

  const templateVars = {
    shortURL,
    longURL,
    urls: urlDatabase,
    userID: user.userID,
    email: user.email,
    password: user.password
  };

  if (!req.session.userID) {
    return res.status(401).send('<html><title></title><body><h3>Please log in to see this information.<a href="/login">Login</a></body></html>');
  }

  return res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === req.session.userID) {
      return res.redirect(`/urls/${id}`);
    }
  }
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const del = req.params.id;

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === req.session.userID) {
      delete urlDatabase[del];
      return res.redirect(`/urls`);
    }
  }

  return res.status(401).send('<html><title></title><body><h3>Please log in to delete this information <a href="/login">Login</a></body></html>');
});

app.get('/login', (req, res) => {
  const user = findUser(users, req.session.userID);

  const templateVars = {
    urls: urlDatabase,
    userID: req.session.userID,
    email: user.email,
    password: user.password
  };

  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }

  res.render('urls_login', templateVars);
});

app.get('/register', (req, res) => {
  const user = findUser(users, req.session.userID);
  let password = user.password;

  const templateVars = {
    urls: urlDatabase,
    userID: user.userID,
    email: user.email,
    password: password
  };

  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }

  res.render('urls_register', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(400).send('<html><title></title><body><h3>This user does not exist.</body></html>');
  }

  const match = bcrypt.compareSync(password, user.password);

  if (!match) {
    return res.status(400).send('<html><title></title><body><h3>Incorrect login information</body></html>');
  }

  req.session.userID = user.userID;

  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (password.length < 1 || email.length < 1) {
    return res.status(400).send('<html><title></title><body><h3>Please enter valid information.</body></html>');
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const userObject = {
    userID: generateRandomString(),
    email,
    password: hash
  };

  req.session.password = userObject.password;

  const user = getUserByEmail(userObject.email, users);

  if (!user) {
    users[userObject.userID] = userObject;
    req.session.userID = userObject.userID;
  } else {
    return res.status(400).send('<html><title></title><body><h3>This email already exists.</body></html>');
  }

  res.redirect('urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;

  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === req.session.userID) {
      urlDatabase[shortURL].longURL = newURL;
      return res.redirect('/urls');
    }
  }
  res.status(401).send('<html><title></title><body><h3>Cannot edit this url</body></html>');
});

app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}!`);
});