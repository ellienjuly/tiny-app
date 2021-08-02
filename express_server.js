const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

function generateRandomString() {
  const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  let randomString = [];
  
  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * 24);
    randomString.push(alphabet[index]);
  }

  return randomString.join('');
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase }
  res.render('urls_index', templateVars)
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok');
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}!`);
});