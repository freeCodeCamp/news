// Global
// eslint-disable-next-line no-unused-vars
const notAuthenticated = !document.cookie
  .split(';')
  .some(item => item.trim().startsWith('jwt_access_token='));
