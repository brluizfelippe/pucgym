var mysql = require("mysql");
var keys = require("../config/keys")();

module.exports.getVideo = function (req, res) {
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
  let sql = "call buscaTodosVideos()";
};

module.exports.createFile = function (req, res) {
  console.log("este é o request :" + JSON.stringify(req.body));

  var fieldname = req.file.fieldname;
  var originalname = req.file.originalname;
  var encoding = req.file.encoding;
  var mimetype = req.file.mimetype;
  var size = req.file.size;
  var bucket = req.file.bucket;
  var key = req.file.key;
  var acl = req.file.acl;
  var contentType = req.file.contentType;
  var storageClass = req.file.storageClass;
  var location = req.file.location;
  var etag = req.file.etag;
  var intIdUser = req.body.userId;

  const con = mysql.createConnection(keys);

  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(
      sql,
      [
        fieldname,
        originalname,
        encoding,
        mimetype,
        size,
        bucket,
        key,
        acl,
        contentType,
        storageClass,
        location,
        etag,
        intIdUser,
      ],
      function (error, results, fields) {
        if (error) {
          res.json(error);
          // throw error;
        }
        console.log(results);
        res.json(results);

        con.end(function (err) {
          if (err) throw err;
          console.log("Disconnected!");
        });
      }
    );
  });
  let sql = "call cadastraVideo(?,?,?,?,?,?,?,?,?,?,?,?,?)";
};

module.exports.deleteVideo = function (req, res) {
  var videoKey = req.params.id;
  var intIdUser = req.query.userId;

  const con = mysql.createConnection(keys);
  console.log(keys);
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql, [videoKey, intIdUser], function (error, result) {
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
  let sql = "call excluiVideo(?,?)";
};
