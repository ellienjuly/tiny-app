const emailCheck = (user, userObject) => {
  if (user.email === userObject.email) {
    return true;
  }
  return false;
} 

module.exports = { emailCheck };