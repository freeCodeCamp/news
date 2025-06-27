// Currently used to get X / Twitter and Facebook useranmes from URLs
export const getUsername = url => {
  return new URL(url).pathname.split('/').filter(Boolean)[0];
};
