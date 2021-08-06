const getUserByEmail = (email, users) => {
  const usersArr = Object.values(users);
  for (const user of usersArr) {
    if (user.email === email) {
      return user;
    }
  }
};

const findUser = (users, userID) => {
  const user = users[userID] ? users[userID] : {};
  return user;
};

const urlsForUser = (id, database) => {
  let urls = {};
  for (let url in database) {
    if (database[url].userID === id) {
      urls[url] = database[url].longURL;
    }
  }
  return urls;
};

module.exports = { getUserByEmail, findUser, urlsForUser };