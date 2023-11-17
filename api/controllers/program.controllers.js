var mysql = require("mysql");
var keys = require("../config/keys")();

module.exports.getPrograms = function (req, res) {
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
  let sql = "call buscaTodosProgramas()";
};

module.exports.getProgram = function (req, res) {
  var idProgram = req.params.id;
  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, [idProgram], function (error, result) {
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
  let sql = "call buscaPrograma(?)";
};

module.exports.createProgram = function (req, res) {
  var name = req.body.program.name;
  var intIdTraining1 = req.body.program.trainings[0].id;
  var intIdTraining2 = req.body.program.trainings[1].id;
  var intIdTraining3 = req.body.program.trainings[2].id;
  var intIdTraining4 = req.body.program.trainings[3].id;
  var intIdTraining5 = req.body.program.trainings[4].id;
  var intIdTraining6 = req.body.program.trainings[5].id;
  var intIdTraining7 = req.body.program.trainings[6].id;
  var intIdTraining8 = req.body.program.trainings[7].id;
  var intIdTraining9 = req.body.program.trainings[8].id;
  var intIdTraining10 = req.body.program.trainings[9].id;
  var intIdUser = req.body.userId;

  const con = mysql.createConnection(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(
      sql,
      [
        name,
        intIdTraining1,
        intIdTraining2,
        intIdTraining3,
        intIdTraining4,
        intIdTraining5,
        intIdTraining6,
        intIdTraining7,
        intIdTraining8,
        intIdTraining9,
        intIdTraining10,
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
  let sql = "call cadastraPrograma(?,?,?,?,?,?,?,?,?,?,?,?)";
};

module.exports.updateProgram = function (req, res) {
  var idTraining = req.params.id;
  var name = req.body.program.name;
  var intIdTraining1 = req.body.program.trainings[0].id;
  var intIdTraining2 = req.body.program.trainings[1].id;
  var intIdTraining3 = req.body.program.trainings[2].id;
  var intIdTraining4 = req.body.program.trainings[3].id;
  var intIdTraining5 = req.body.program.trainings[4].id;
  var intIdTraining6 = req.body.program.trainings[5].id;
  var intIdTraining7 = req.body.program.trainings[6].id;
  var intIdTraining8 = req.body.program.trainings[7].id;
  var intIdTraining9 = req.body.program.trainings[8].id;
  var intIdTraining10 = req.body.program.trainings[9].id;
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
        intIdTraining1,
        intIdTraining2,
        intIdTraining3,
        intIdTraining4,
        intIdTraining5,
        intIdTraining6,
        intIdTraining7,
        intIdTraining8,
        intIdTraining9,
        intIdTraining10,
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
  let sql = "call atualizaPrograma(?,?,?,?,?,?,?,?,?,?,?,?,?)";
};

module.exports.deleteProgram = function (req, res) {
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
  let sql = "call excluiPrograma(?,?)";
};
