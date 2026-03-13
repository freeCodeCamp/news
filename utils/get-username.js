// Currently used to get X / Twitter and Facebook usernames from URLs
export const getUsername = url => {
  try {
    return new URL(url).pathname.split('/').filter(Boolean)[0];
  } catch {
    return null;
  }
};
