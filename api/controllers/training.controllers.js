var mysql = require("mysql");
var keys = require("../config/keys")();

module.exports.getTrainings = function (req, res) {
  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, [], function (error, result) {
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
  let sql = "call buscaTodosTreinos()";
};

module.exports.getTraining = function (req, res) {
  var idTraining = req.params.id;
  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, [idTraining], function (error, result) {
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
  let sql = "call buscaTreino(?)";
};

module.exports.createTraining = function (req, res) {
  var name = req.body.training.name;
  var intIdExercise1 = req.body.training.exercises[0].id;
  var intIdExercise2 = req.body.training.exercises[1].id;
  var intIdExercise3 = req.body.training.exercises[2].id;
  var intIdExercise4 = req.body.training.exercises[3].id;
  var intIdExercise5 = req.body.training.exercises[4].id;
  var intIdExercise6 = req.body.training.exercises[5].id;
  var intIdExercise7 = req.body.training.exercises[6].id;
  var intIdExercise8 = req.body.training.exercises[7].id;
  var intIdExercise9 = req.body.training.exercises[8].id;
  var intIdExercise10 = req.body.training.exercises[9].id;
  var intIdUser = req.body.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(
      sql,
      [
        name,
        intIdExercise1,
        intIdExercise2,
        intIdExercise3,
        intIdExercise4,
        intIdExercise5,
        intIdExercise6,
        intIdExercise7,
        intIdExercise8,
        intIdExercise9,
        intIdExercise10,
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
          console.log("Disconnected!");
        });
      }
    );
  });
  let sql = "call cadastraTreino(?,?,?,?,?,?,?,?,?,?,?,?)";
};

module.exports.updateTraining = function (req, res) {
  var idTraining = req.params.id;
  var name = req.body.training.name;
  var intIdExercise1 = req.body.training.exercises[0].id;
  var intIdExercise2 = req.body.training.exercises[1].id;
  var intIdExercise3 = req.body.training.exercises[2].id;
  var intIdExercise4 = req.body.training.exercises[3].id;
  var intIdExercise5 = req.body.training.exercises[4].id;
  var intIdExercise6 = req.body.training.exercises[5].id;
  var intIdExercise7 = req.body.training.exercises[6].id;
  var intIdExercise8 = req.body.training.exercises[7].id;
  var intIdExercise9 = req.body.training.exercises[8].id;
  var intIdExercise10 = req.body.training.exercises[9].id;
  var intIdUser = req.body.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(
      sql,
      [
        idTraining,
        name,
        intIdExercise1,
        intIdExercise2,
        intIdExercise3,
        intIdExercise4,
        intIdExercise5,
        intIdExercise6,
        intIdExercise7,
        intIdExercise8,
        intIdExercise9,
        intIdExercise10,
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
          console.log("Disconnected!");
        });
      }
    );
  });
  let sql = "call atualizaTreino(?,?,?,?,?,?,?,?,?,?,?,?,?)";
};

module.exports.deleteTraining = function (req, res) {
  var idTraining = req.params.id;
  var intIdUser = req.query.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, [idTraining, intIdUser], function (error, result) {
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
  let sql = "call excluiTreino(?,?)";
};
