var mysql = require("mysql");
var keys = require("../config/keys")();

module.exports.getSetups = function (req, res) {
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
  let sql = "call buscaTodasConfiguracoes()";
};

module.exports.getSetup = function (req, res) {
  var idUsuario = req.query.idUser;
  var idExercicio = req.query.idExercise;
  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, [idUsuario, idExercicio], function (error, result) {
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
  let sql = "call buscaConfiguracao(?,?)";
};
/* IN intIdUsuario int,
IN intIdExercicio int,
IN vcharCarga varchar(45),
IN vcharRepeticao varchar(45),
IN vcharAjuste varchar(45) */
module.exports.createSetup = function (req, res) {
  var intIdUser = req.body.userId;
  var intIdExercise = req.body.setup.exercise.id;
  var vcharLoad = req.body.setup.load;
  var vcharRep = req.body.setup.repetition;
  var vcharSet = req.body.setup.set;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    con.query(
      sql,
      [intIdUser, intIdExercise, vcharLoad, vcharRep, vcharSet],
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
  let sql = "call cadastraConfiguracao(?,?,?,?,?)";
};

module.exports.updateSetup = function (req, res) {
  var intIdSetup = req.params.id;
  var intIdUser = req.body.setup.user.id;
  var intIdExercise = req.body.setup.exercise.id;
  var vcharLoad = req.body.setup.load;
  var vcharRep = req.body.setup.repetition;
  var vcharSet = req.body.setup.set;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    con.query(
      sql,
      [intIdSetup, intIdUser, intIdExercise, vcharLoad, vcharRep, vcharSet],
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
  let sql = "call atualizaConfiguracao(?,?,?,?,?,?)";
};

module.exports.deleteSetup = function (req, res) {
  var idSetup = req.params.id;
  var intIdUser = req.query.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, [idTraining, intIdUser], function (error, result) {
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
  let sql = "call excluiConfiguracao(?,?)";
};
