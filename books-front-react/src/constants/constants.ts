export const API_URL = "http://localhost/books-back-drupal/web";
export const localStorageUserKey = "user";

export const userNameRules = {
  required: "Field must be filled",
};

export const emailRules = {
  required: "Field must be filled",
  pattern: {
    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Incorrect email format",
  },
};

export const passwordRules = {
  required: "Field must be filled",
};
