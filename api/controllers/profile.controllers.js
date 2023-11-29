var mysql = require("mysql");
var keys = require("../config/keys")();

module.exports.getProfile = function (req, res) {
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
  let sql = "call buscaTodosTipos()";
};
