/* eslint-disable no-unused-vars */
// Global

const notAuthenticated = !document.cookie
  .split(';')
  .some(item => item.trim().startsWith('jwt_access_token='));

const notDonor = !document.cookie
  .split(';')
  .some(item => item.trim().startsWith('isDonor=true'));
