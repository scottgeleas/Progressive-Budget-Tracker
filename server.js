const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
require("dotenv").config()

const uri = process.env.DB_URI;

const PORT = 3000;
const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/BudgetDB",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  );

// routes
app.use(require("./routes/api.js"));

mongoose.connection.once('open', () => {
    app.listen(PORT, () => {
        console.log(`App running on port ${PORT}`)
    });
})