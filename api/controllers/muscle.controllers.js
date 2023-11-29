var mysql = require("mysql");
var keys = require("../config/keys")();

module.exports.getMuscle = function (req, res) {
  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, [], function (error, result) {
      if (error) {
        res.json(error);
        // throw error;
      }
      res.json(result);

      con.end(function (err) {
        if (err) throw err;
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
    con.query(sql, [name, intIdUser], function (error, result) {
      if (error) {
        res.json(error);
        // throw error;
      }
      res.json(result);

      con.end(function (err) {
        if (err) throw err;
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
    con.query(sql, [idMuscle, name, intIdUser], function (error, result) {
      if (error) {
        res.json(error);
        // throw error;
      }
      res.json(result);

      con.end(function (err) {
        if (err) throw err;
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
    con.query(sql, [idMuscle, intIdUser], function (error, result) {
      if (error) {
        res.json(error);
        // throw error;
      }
      res.json(result);

      con.end(function (err) {
        if (err) throw err;
      });
    });
  });
  let sql = "call excluiGrupoMuscular(?,?)";
};
