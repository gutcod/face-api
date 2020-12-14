const Clarifai = require("clarifai");

const app = new Clarifai.App({
  apiKey: "1c70a452f33641e5bd3b112715e1c619",
});

const handleApiCall = (req, res) => {
  app.models
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json("enabled to work with api"));
};

const handleImage = (req, res, db) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json("user not found"));
};
module.exports = {
  handleImage,
  handleApiCall,
};
