const PROXY_CONFIG = [
  {
    context: [
      "/api/v1/users/login",
      "/api/v1/users/googlelogin",
      "/api/v1/users",
      "/api/v1/users/:id",
      "/api/v1/muscles",
      "/api/v1/muscles/:id",
      "/api/v1/exercises",
      "/api/v1/exercises/:id",
      "/api/v1/videos",
      "/api/v1/videos/:id",
      "/api/v1/equipments",
      "/api/v1/equipments/:id",
      "/api/v1/trainings",
      "/api/v1/trainings/:id",
      "/api/v1/programs",
      "/api/v1/programs/:id",
      "/api/v1/profiles",
      "/api/v1/profiles/:id",
      "/api/v1/setups",
      "/api/v1/setups/:id",
      "/api/v1/setup",
      "/api/v1/checkout",
      "/api/v1/histories",
      "/api/v1/historiesbymonth",
    ],
    target: "http://localhost:3000",
    secure: false,
  },
];

module.exports = PROXY_CONFIG;
