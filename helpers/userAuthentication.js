const authentication = (users, email) => {
  let id = '';
  for (let user_id in users) {
    if (users[user_id].email === email) {
      id = user_id;
    }
  };

  const user = users[id];
  if (user) {
    if (user.email === email) {
      console.log('found');
      return user;
    } else {
      console.log('wrong pw');
      return null;
    }
  } else {
    console.log('user not found');
    return null;
  }
}

const createNewUser = (users, userObject) => {
  for (const user in users) {
    if (users[user].email === userObject.email) {
      return null;
    } 
    users[userObject.user_id] = userObject;
    return userObject;
  }
}

const findUser = (users, user_id) => {
  const user = users[user_id] ? users[user_id] : {};

  return user;
}

const urlsForUser = function (id, database) {
  let urls = {};
  for (let url in database) {
    if (database[url].user_id === id) {
      urls[url] = database[url].longURL;
    }
  }
  return urls;
}

module.exports = { authentication, createNewUser, findUser, urlsForUser};