//import "module-alias/register.js";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import hbs from "hbs";
import fileUpload from "express-fileupload";
import routes from "./routes/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Set up the view engine to use Handlebars
const partialsPath = path.join(__dirname, "/views/partials");
console.log(partialsPath);
app.set("views", path.join(__dirname, "/views"));
hbs.registerPartials(partialsPath, function (err) {});
app.set("view engine", "hbs");

hbs.registerHelper("eq", (a, b) => a == b);

app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

app.get("/", (req, res) => {
  res.redirect("/servers");
});

routes(app);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => console.log(`Listening on port ${port}`));
