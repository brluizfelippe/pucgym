var express = require("express");
const path = require("path");
var router = express.Router();
const multer = require("multer");
const multerConfig = require("../config/multer");
var ctrlUsers = require("../controllers/users.controllers");
var ctrlMuscle = require("../controllers/muscle.controllers");
var ctrlExrs = require("../controllers/exercise.controllers");
var ctrlVideo = require("../controllers/video.controllers");
var ctrlEq = require("../controllers/equipment.controllers");
var ctrlTrng = require("../controllers/training.controllers");
var ctrlPgm = require("../controllers/program.controllers");
var ctrlProfile = require("../controllers/profile.controllers");
var ctrlStp = require("../controllers/setup.controllers");
var ctrlPymt = require("../controllers/payment.controllers");
var ctrlHsty = require("../controllers/history.controllers");
var AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const S3 = new AWS.S3();
//
//##### Autenticacao ####
//
router.route("/users").post(ctrlUsers.register);
router.route("/users/login").post(ctrlUsers.login);
router.route("/users/googlelogin").post(ctrlUsers.loginWithGoogle);
//
//##### Autenticacao ####
//

//
//##### Usuários ####
//
router.route("/users").get(ctrlUsers.authenticate, ctrlUsers.getUser);
router.route("/users/:id").put(ctrlUsers.authenticate, ctrlUsers.updateUser);
router.route("/users/:id").delete(ctrlUsers.authenticate, ctrlUsers.deleteUser);
//
//##### Usuários ####
//

//
//##### Perfil ####
//
router.route("/profiles").get(ctrlUsers.authenticate, ctrlProfile.getProfile);
//
//##### Perfil ####
//

//
//##### Grupos musulares ####
//
router.route("/muscles").get(ctrlUsers.authenticate, ctrlMuscle.getMuscle);
router
  .route("/muscles/:id")
  .put(ctrlUsers.authenticate, ctrlMuscle.updateMuscle);
router.route("/muscles").post(ctrlUsers.authenticate, ctrlMuscle.createMuscle);
router
  .route("/muscles/:id")
  .delete(ctrlUsers.authenticate, ctrlMuscle.deleteMuscle);
//
//##### Grupos musculares ####
//

//
//##### Equipamentos ####
//
router.route("/equipments").get(ctrlUsers.authenticate, ctrlEq.getEquipment);
router
  .route("/equipments/:id")
  .put(ctrlUsers.authenticate, ctrlEq.updateEquipment);
router
  .route("/equipments")
  .post(ctrlUsers.authenticate, ctrlEq.createEquipment);
router
  .route("/equipments/:id")
  .delete(ctrlUsers.authenticate, ctrlEq.deleteEquipment, function (req, res) {
    console.log(req.query);
    S3.deleteObject(
      {
        Bucket: req.query.bucket,
        Key: req.query.videoKey,
      },
      function (err, data) {
        console.log("cheguei aqui....");
        if (err) {
          console.log("Error", err);
          res.json(err);
        } else {
          console.log("File deleted successfully", data);
          res.json(data);
        }
      }
    );
  });
//
//##### Equipamentos ####
//

//
//##### Exercícios ####
//
router.route("/exercises").get(ctrlUsers.authenticate, ctrlExrs.getExercises);
router
  .route("/exercises/:id")
  .get(ctrlUsers.authenticate, ctrlExrs.getExercise);
router
  .route("/exercises/:id")
  .put(ctrlUsers.authenticate, ctrlExrs.updateExercise);
router
  .route("/exercises")
  .post(ctrlUsers.authenticate, ctrlExrs.createExercise);
router
  .route("/exercises/:id")
  .delete(ctrlUsers.authenticate, ctrlExrs.deleteExercise);
//
//##### Exercícios ####
//

//
//##### Treinos ####
//
router.route("/trainings").get(ctrlUsers.authenticate, ctrlTrng.getTrainings);
router
  .route("/trainings/:id")
  .get(ctrlUsers.authenticate, ctrlTrng.getTraining);
router
  .route("/trainings/:id")
  .put(ctrlUsers.authenticate, ctrlTrng.updateTraining);
router
  .route("/trainings")
  .post(ctrlUsers.authenticate, ctrlTrng.createTraining);
router
  .route("/trainings/:id")
  .delete(ctrlUsers.authenticate, ctrlTrng.deleteTraining);
//
//##### Treinos ####
//

//
//##### Programas ####
//
router.route("/programs").get(ctrlUsers.authenticate, ctrlPgm.getPrograms);
router.route("/programs/:id").get(ctrlUsers.authenticate, ctrlPgm.getProgram);
router
  .route("/programs/:id")
  .put(ctrlUsers.authenticate, ctrlPgm.updateProgram);
router.route("/programs").post(ctrlUsers.authenticate, ctrlPgm.createProgram);
router
  .route("/programs/:id")
  .delete(ctrlUsers.authenticate, ctrlPgm.deleteProgram);
//
//##### Programas ####
//

//
//##### Vídeos ####
//
router.route("/videos").post(
  ctrlUsers.authenticate,
  function (req, res, next) {
    multer(multerConfig).single("file")(req, res, function (err) {
      console.log("passei aqui!");
      if (err) {
        // A Multer error occurred when uploading.
        res.json(err);
      } else {
        next();
      }
    });
  },

  ctrlVideo.createFile
);

router
  .route("/videos/:id")
  .delete(ctrlUsers.authenticate, ctrlVideo.deleteVideo, function (req, res) {
    console.log(req.query);
    S3.deleteObject(
      {
        Bucket: req.query.bucket,
        Key: req.query.videoKey,
      },
      function (err, data) {
        console.log("cheguei aqui....");
        if (err) {
          console.log("Error", err);
          res.json(err);
        } else {
          console.log("File deleted successfully", data);
          res.json(data);
        }
      }
    );
  });

router.route("/videos").get(ctrlUsers.authenticate, ctrlVideo.getVideo);
router
  .route("/exercises/:id/videos")
  .get(ctrlUsers.authenticate, ctrlVideo.getVideo);
//
//##### Vídeos ####
//

//
//##### Configurações ####
//
router.route("/setups").get(ctrlUsers.authenticate, ctrlStp.getSetups);
router.route("/setup").get(ctrlUsers.authenticate, ctrlStp.getSetup);
/* router.route("/setups/:id").get(ctrlUsers.authenticate, ctrlStp.getSetup); */
router.route("/setups/:id").put(ctrlUsers.authenticate, ctrlStp.updateSetup);
router.route("/setups").post(ctrlUsers.authenticate, ctrlStp.createSetup);
router.route("/setups/:id").delete(ctrlUsers.authenticate, ctrlStp.deleteSetup);
//
//##### Configurações ####
//

//
//##### Pagamento ####
//
router.route("/checkout").post(ctrlUsers.authenticate, ctrlPymt.checkout);
//
//##### Pagamento ####
//

//
//##### Histórico ####
//
router.route("/histories").get(ctrlUsers.authenticate, ctrlHsty.getHistories);
router.route("/histories").post(ctrlUsers.authenticate, ctrlHsty.createHistory);
router
  .route("/historiesbymonth")
  .get(ctrlUsers.authenticate, ctrlHsty.getHistoriesByMonth);
//
//##### Histórico ####
//
module.exports = router;
