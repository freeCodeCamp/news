/* eslint-disable no-unused-vars */
// Global

const isAuthenticated = document.cookie
  .split(';')
  .some(item => item.trim().startsWith('jwt_access_token='));

const isDonor = document.cookie
  .split(';')
  .some(item => item.trim().startsWith('isDonor=true'));
