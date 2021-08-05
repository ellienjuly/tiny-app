const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt-nodejs');
const cookieSession = require('cookie-session');

const { authentication, createNewUser, findUser, urlsForUser } = require('./helpers/userAuthentication');

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_id: "i6xds0"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    user_id: "i6xds0"
  },
  "sgq3y6": {
    longURL: "http://apple.com",
    user_id: "i6xds0"
  }
};

const users = {
  "i6xds0": {
    user_id: "i6xds0",
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
  console.log(req.cookies);
  if (req.cookies) {
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});


app.get('/urls', (req, res) => {
  const user = findUser(users, req.cookies.user_id);

  const templateVars = {
    urls: urlsForUser(req.cookies.user_id, urlDatabase),
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
  console.log(req.body);
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    user_id: req.cookies.user_id
  };
  console.log('after', urlDatabase);

  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  // urlDatabase[longURL] = req.params.shortURL;

  const user = findUser(users, req.cookies.user_id);

  const templateVars = {
    shortURL,
    longURL,
    urls: urlDatabase,
    user_id: user.user_id,
    email: user.email,
    password: user.password
  }
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const user = findUser(users, req.cookies.user_id);
  
  const templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL].longURL, 
    urls: urlDatabase[shortURL],
    user_id: user.user_id,
    email: user.email,
    password: user.password
  };

  if (!shortURL) {
    console.log('URL does not exist');
    return;
  }

  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const del = req.params.shortURL;

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].user_id === req.cookies.user_id) {
      delete urlDatabase[del];
      res.redirect(`/urls`);
      return;
    }
  }
  console.log('You cannot delete this url');
  res.redirect(`/urls`)
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  for (const url in urlDatabase) {
    if (urlDatabase[url].user_id === req.cookies){
      res.redirect(`/urls/${id}`);
    }
  }
  res.redirect('urls')
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;
  console.log("cookie here ", req.cookies);

  for (const url in urlDatabase) {
    console.log('url: ',url);
    if (urlDatabase[url].user_id === req.cookies.user_id) {

      urlDatabase[shortURL].longURL = newURL;
      console.log(urlDatabase);
      res.redirect('/urls');
      return;
    }
  }
  res.status(401).send('<html><title></title><body><h3>Cannot edit this url</body></html>')
});


app.get('/login', (req, res) => {
  const user = findUser(users, req.cookies.user_id);

  const templateVars = {
    urls: urlDatabase,
    user_id: user.user_id,
    email: user.email,
    password: user.password
  }

  res.render('urls_login', templateVars)
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = authentication(users, email);
  console.log('user', user);

  const match = bcrypt.compareSync(password, user.password);

  if (match) {
    res.cookie('user_id', user.user_id);
  } else {
      res.status(400).send('<html><title></title><body><h3>Incorrect login information</body></html>');
      return;
  }

  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
});

app.get('/register', (req, res) => {
  const user = findUser(users, req.cookies.user_id);
  let password = user.password;

  const templateVars = {
    urls: urlDatabase,
    user_id: user.user_id,
    email: user.email,
    password: password
  };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {

  const password = req.body.password;
  let ranId = generateRandomString();

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);


  const userObject = {
    user_id: ranId,
    email: req.body.email,
    password: hash
  }
  req.session.password = userObject.password;

  const user = createNewUser(users, userObject);
  if (user) {
    res.cookie('user_id', userObject.user_id);
  } else {
    return res.status(400).send('<html><title></title><body><h3>Already registered email</body></html>')
  }
 
  res.redirect('urls');
});



app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}!`);
});