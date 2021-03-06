const { json } = require("body-parser");
const jwt = require("jsonwebtoken");
const redis = require("redis");

//Setup Reddis
const redisClient = redis.createClient(process.env.REDIS_URI);

const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject("incorrect form submission");
  }
  return db
    .select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then(user => user[0])
          .catch(err => res.status(400).json("unable to get user"));
      } else {
        return Promise.reject("wrong credentials");
      }
    })
    .catch(err => err);
};

const signToken = email => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, "shhhhh");
};

const setToken = (key, value) => Promise.resolve(redisClient.set(key, value));

const createSesions = user => {
  //JWP Token and return user data
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      return { success: "true", userId: id, token, user };
    })
    .catch(console.log);
};
const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(401).send("Unauthorized");
    }
    return res.json({ id: reply });
  });
};
const signinAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization
    ? getAuthTokenId(req, res)
    : handleSignin(db, bcrypt, req, res)
        .then(data => {
          return data.id && data.email ? createSesions(data) : Promise.reject(data);
        })
        .then(session => res.json(session))
        .catch(err => res.status(400).json(err));
};

module.exports = {
  signinAuthentication: signinAuthentication,
  redisClient: redisClient,
};
