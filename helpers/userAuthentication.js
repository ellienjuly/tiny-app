const authentication = (users, email, password) => {
  let id = '';
  for (let user_id in users) {
    if (users[user_id].email === email) {
      id = user_id;
    }
  };

  const user = users[id];

  if (user) {
    if (user.password === password) {
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
  if (!users[userObject.user_id]) {
    users[userObject.user_id] = userObject;
    return userObject;
  }
  return null;
}

const findUser = (users, user_id) => {
  const user = users[user_id] ? users[user_id] : {};

  return user;
}

module.exports = { authentication, createNewUser, findUser };