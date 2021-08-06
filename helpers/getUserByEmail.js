const getUserByEmail = (users, email) => {
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

module.exports = { getUserByEmail };