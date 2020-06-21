import express from "express"
import http from "http"
import mongoose from "mongoose"
import path from "path"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import teamRoute from "./routes/teamRoute"

require('dotenv').config()

const app = express();

let server
server = http.createServer(app)

//#region MongoDB connect
mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.DB, { useNewUrlParser: true })
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.log(err));

mongoose.set("debug", false);
//#endregion

//#region set cross origin
const allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // intercept OPTIONS method
  if ("OPTIONS" == req.method) {
    res.send(200);
  } else {
    next();
  }
};
app.use(allowCrossDomain);
//#endregion

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname,'public')))

//#region load router
app.use('/api', teamRoute)
//#endregion

//====Port open to run application
server.listen(process.env.PORT, (err) => {
    if(err)
        throw err

    console.log(`you are server is running on ${process.env.PORT}`);
});
