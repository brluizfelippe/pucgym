var mysql = require("mysql");
var keys = require("../config/keys")();

module.exports.getHistories = function (req, res) {
  var idUser = req.query.userId;
  var idExercicio = req.query.exerciseId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, [idExercicio, idUser], function (error, result) {
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
  let sql = "call buscaHistorico(?,?)";
};
module.exports.getHistoriesByMonth = function (req, res) {
  var idUser = req.query.userId;
  var idExercicio = req.query.exerciseId;
  var idReportType = req.query.reportType;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    con.query(
      sql,
      [idExercicio, idUser, idReportType],
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
  let sql = "call buscaHistoricoMes(?,?,?)";
};
module.exports.createHistory = function (req, res) {
  var charEvent = req.body.event;
  var intValue = req.body.value;
  var intIdExercise = req.body.idExercise;
  var intIdUser = req.body.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    con.query(
      sql,
      [charEvent, intValue, intIdExercise, intIdUser],
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
  let sql = "call cadastraHistorico(?,?,?,?)";
};
