var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var mysql = require("mysql");
var keys = require("../config/keys")();

module.exports.register = function (req, res) {
  console.log(req.body.userSelected);
  const con = mysql.createConnection(keys);
  console.log(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(
      sql,
      [
        req.body.userSelected.firstName,
        req.body.userSelected.lastName,
        req.body.userSelected.googleId,
        req.body.userSelected.imageUrl,
        bcrypt.hashSync(req.body.userSelected.password, bcrypt.genSaltSync(10)),
        req.body.userSelected.email,
      ],
      function (error, result) {
        if (error) throw error;
        console.log(result);
        res.json(result);
        //res.json("Usuário cadastrado com Sucesso!");

        con.end(function (err) {
          if (err) throw err;
          console.log("Disconnected!");
        });
      }
    );
  });
  let sql = "call cadastraUsuario(?,?,?,?,?,?)";
};

module.exports.login = function (req, res) {
  console.log(req.body);
  var email = req.body.userEmail;
  var senha = req.body.userPassword;
  try {
    console.log("logging in user");
    const con = mysql.createConnection(keys);
    console.log(keys);
    con.connect(function (err) {
      if (err) {
        res.json(err);
      }
      console.log("Connected!");
      con.query(sql, [email], function (error, result) {
        console.log("result[0]: ", result[0]);
        if (error) {
          res.json(error);
        }
        if (result[0].length > 0) {
          //console.log(senha.trim(), result[0][0].senha.trim());
          if (bcrypt.compareSync(senha.trim(), result[0][0].senha.trim())) {
            console.log("User found", result[0][0].nome);
            var token = jwt.sign(
              {
                username: result[0][0].nome,
                type: result[0][0].tipo,
                userId: result[0][0].id,
              },
              "s3cr3t",
              {
                expiresIn: 6000,
              }
            );
            res.status(200).json({
              success: true,
              token: token,
              type: result[0][0].tipo,
              imageUrl: result[0][0].imageUrl,
              error: "Usuário validado: " + result[0][0].email,
              email: result[0][0].email,
              idProgram: result[0][0].idPrograma,
            });
          } else {
            res.status(401).json({
              success: false,
              token: null,
              type: "",
              imageUrl: "",
              error: "Senha incorreta.",
            });
          }
        } else {
          res.status(401).json({
            success: false,
            token: null,
            type: "",
            imageUrl: "",
            error: "Usuário não cadastrado.",
          });
        }

        con.end(function (err) {
          if (err) throw err;
          console.log("Disconnected!");
        });
      });
    });
    let sql = "call buscaUsuario(?)";
  } catch (error) {
    console.log("error caught!!!!!!!!!", error);
  }
};

module.exports.loginWithGoogle = function (req, res) {
  console.log(req.body);
  var email = req.body.userEmail;
  var googleId = req.body.googleId;

  console.log("logging in user with google");
  const con = mysql.createConnection(keys);

  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, [email], function (error, result) {
      console.log("result[0]: ", result[0]);
      if (error) throw error;
      if (result[0].length > 0) {
        if (googleId.trim() === result[0][0].googleId.trim()) {
          console.log("User found", result[0][0].nome);
          var token = jwt.sign(
            {
              username: result[0][0].nome,
              type: result[0][0].tipo,
              imageUrl: result[0][0].imageUrl,
              userId: result[0][0].id,
            },
            "s3cr3t",
            {
              expiresIn: 6000,
            }
          );
          res.status(200).json({
            success: true,
            token: token,
            type: result[0][0].tipo,
            error: "Usuário validado: " + result[0][0].email,
            email: result[0][0].email,
            idProgram: result[0][0].idPrograma,
          });
        } else {
          res.status(401).json({
            success: false,
            token: null,
            type: "",
            error: "Senha incorreta.",
          });
        }
      } else {
        res.status(401).json({
          success: false,
          token: null,
          type: "",
          error: "Usuário não cadastrado.",
        });
      }

      //res.json("Usuário cadastrado com Sucesso!");

      con.end(function (err) {
        if (err) throw err;
        console.log("Disconnected!");
      });
    });
  });
  let sql = "call buscaUsuario(?)";
};

module.exports.authenticate = function (req, res, next) {
  var headerExists = req.headers.authorization;
  if (headerExists) {
    console.log(req.headers);
    var token = req.headers.authorization.split(" ")[1]; //--> Authorization Bearer xxx
    jwt.verify(token, "s3cr3t", function (error, decoded) {
      if (error) {
        console.log(error);
        res.status(401).json("Unauthorized");
      } else {
        req.user = decoded.username;
        req.type = decoded.type;
        next();
      }
    });
  } else {
    res.status(403).json("No token provided");
  }
};

module.exports.getUser = function (req, res) {
  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, [], function (error, result) {
      if (error) {
        res.json(error);
        // throw error;
      }
      console.log(result);
      res.json(result);

      con.end(function (err) {
        if (err) throw err;
        console.log("Disconnected!");
      });
    });
  });
  let sql = "call buscaTodosUsuarios()";
};

module.exports.updateUser = function (req, res) {
  var idUser = req.params.id;
  var intIdProfile = req.body.userSelected.profile.id;
  var intIdProgram = req.body.userSelected.program.id;
  var intIdUser = req.body.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(
      sql,
      [idUser, intIdProfile, intIdProgram, intIdUser],
      function (error, result) {
        if (error) {
          res.json(error);
          // throw error;
        }
        res.json(result);

        con.end(function (err) {
          if (err) throw err;
          console.log("Disconnected!");
        });
      }
    );
  });
  let sql = "call atualizaUsuario(?,?,?,?)";
};

module.exports.deleteUser = function (req, res) {
  var idUser = req.params.id;
  var intIdUser = req.query.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, [idUser, intIdUser], function (error, result) {
      if (error) {
        res.json(error);
        // throw error;
      }
      res.json(result);

      con.end(function (err) {
        if (err) throw err;
        console.log("Disconnected!");
      });
    });
  });
  let sql = "call excluiUsuario(?,?)";
};
