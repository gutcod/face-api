const handleProfile = (req, res, db) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("user not found");
      }
    })
    .catch(err => res.status(400).json("error getting user"));
};

const handleProfileUpdate = (req, res, db) => {
  const { id } = req.params;
  const { name, age } = req.body.formInput;
  db("users")
    .where({ id })
    .update({ name })
    .then(resp => {
      if (resp) {
        res.json("Succes");
      } else {
        res.status(400).json("Unabled to update");
      }
    })
    .catch(err => res.status(400).json("Error updating user"));
};
module.exports = {
  handleProfile,
  handleProfileUpdate,
};
