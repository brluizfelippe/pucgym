module.exports = () => {
  let keys = {
    host: process.env.DB_KEY_HOST,
    user: process.env.DB_KEY_USER,
    password: process.env.DB_KEY_PASSWORD,
    database: "",
  };

  switch (process.env.NODE_ENV) {
    case "production":
      keys.database = process.env.DB_KEY_DATABASE_DEV;
      break;
    default:
      keys.database = process.env.DB_KEY_DATABASE_DEV;
      break;
  }

  return keys;
};
