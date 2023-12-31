var mysql = require("mysql");
var keys = require("../config/keys")();

module.exports.getEquipment = function (req, res) {
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
  let sql = "call buscaTodosEquipamentos()";
};

module.exports.createEquipment = function (req, res) {
  var name = req.body.equipment.name;
  var intIdImage = req.body.equipment.image.id;
  var intIdUser = req.body.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;

    con.query(sql, [name, intIdImage, intIdUser], function (error, result) {
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
  let sql = "call cadastraEquipamento(?,?,?)";
};

module.exports.updateEquipment = function (req, res) {
  var idEquipment = req.params.id;
  var name = req.body.equipment.name;
  var intIdImage = req.body.equipment.image.id;
  var intIdUser = req.body.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;

    con.query(
      sql,
      [idEquipment, name, intIdImage, intIdUser],
      function (error, result) {
        if (error) {
          res.json(error);
          // throw error;
        }
        res.json(result);

        con.end(function (err) {
          if (err) throw err;
        });
      }
    );
  });
  let sql = "call atualizaEquipamento(?,?,?,?)";
};

module.exports.deleteEquipment = function (req, res, next) {
  var idEquipment = req.params.id;
  var intIdUser = req.query.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;

    let sql = "CALL excluiEquipamento(?,?)"; // Move the SQL declaration before its usage

    con.query(sql, [idEquipment, intIdUser], function (error, result) {
      if (error) {
        // Consider adding 'res.json(error);' or another way to handle the error
      } else {
        if (Array.isArray(result)) {
          res.json(result);
        } else {
          next();
        }
      }

      con.end(function (err) {
        if (err) throw err;
      });
    });
  });
};
