module.exports.name = "Utils";
module.exports.utils = {
  getFullName: (user = null) => {
    if (user != null) return `${user.username}#${user.discriminator} (${user.id})`;
    else return "Undefined";
  },
  getShortName: (user = null) => {
    if (user != null) return `${user.username}#${user.discriminator}`;
    else return "Undefined";
  }
};