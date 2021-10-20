const { writeFileSync } = require('fs');
const reportedErrors = [];

const errorLogger = ({ type, name }) => {
  if (!reportedErrors.includes(name)) {
    reportedErrors.push(name);

    return writeFileSync(`${type}-errors.log`, `${name}\n`, { flag: 'a+' });
  }
}

module.exports = errorLogger;
