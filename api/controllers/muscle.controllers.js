var mysql = require("mysql");
var keys = require("../config/keys")();

module.exports.getMuscle = function (req, res) {
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
  let sql = "call buscaTodosGruposMusculares()";
};

module.exports.createMuscle = function (req, res) {
  var name = req.body.name;
  var intIdUser = req.body.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, [name, intIdUser], function (error, result) {
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
  let sql = "call cadastraGrupoMuscular(?,?)";
};

module.exports.updateMuscle = function (req, res) {
  var idMuscle = req.params.id;
  var name = req.body.name;
  var intIdUser = req.body.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, [idMuscle, name, intIdUser], function (error, result) {
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
  let sql = "call atualizaGrupoMuscular(?,?,?)";
};

module.exports.deleteMuscle = function (req, res) {
  var idMuscle = req.params.id;
  var intIdUser = req.query.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, [idMuscle, intIdUser], function (error, result) {
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
  let sql = "call excluiGrupoMuscular(?,?)";
};
