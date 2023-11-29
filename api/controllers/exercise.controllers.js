var mysql = require("mysql");
var keys = require("../config/keys")();

module.exports.getExercises = function (req, res) {
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
  let sql = "call buscaTodosExercicios()";
};

module.exports.getExercise = function (req, res) {
  var idEquipment = req.params.id;
  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;

    con.query(sql, [idEquipment], function (error, result) {
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
  let sql = "call buscaExercicio(?)";
};

module.exports.createExercise = function (req, res) {
  var name = req.body.exercise.name;
  var intIdMuscle = req.body.exercise.muscle.id;
  var intIdVideo = req.body.exercise.video.id;
  var intIdEq1 = req.body.exercise.equipments[0].id;
  var intIdEq2 = req.body.exercise.equipments[1].id;
  var intIdEq3 = req.body.exercise.equipments[2].id;
  var intIdUser = req.body.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    con.query(
      sql,
      [name, intIdMuscle, intIdVideo, intIdEq1, intIdEq2, intIdEq3, intIdUser],
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
  let sql = "call cadastraExercicio(?,?,?,?,?,?,?)";
};

module.exports.updateExercise = function (req, res) {
  var idExercise = req.params.id;
  var name = req.body.exercise.name;
  var intIdMuscle = req.body.exercise.muscle.id;
  var intIdVideo = req.body.exercise.video.id;
  var intIdEq1 = req.body.exercise.equipments[0].id;
  var intIdEq2 = req.body.exercise.equipments[1].id;
  var intIdEq3 = req.body.exercise.equipments[2].id;
  var intIdUser = req.body.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    con.query(
      sql,
      [
        idExercise,
        name,
        intIdMuscle,
        intIdVideo,
        intIdEq1,
        intIdEq2,
        intIdEq3,
        intIdUser,
      ],
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
  let sql = "call atualizaExercicio(?,?,?,?,?,?,?,?)";
};

module.exports.deleteExercise = function (req, res) {
  var idExercise = req.params.id;
  var intIdUser = req.query.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, [idExercise, intIdUser], function (error, result) {
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
  let sql = "call excluiExercicio(?,?)";
};
