// imports
const express = require("express");
const morgan = require("morgan");

// init express app
const app = express();

// use morgan middleware
app.use(morgan("combined"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World from inventory service");
});

// ! INVENTORY CRUD OPERATIONS
app.get("/inventory", (req, res) => {
  res.send("GET INVENTORY");
});

app.post("/inventory", (req, res) => {
  res.send("POST INVENTORY");
});

app.put("/inventory", (req, res) => {
  res.send("PUT INVENTORY");
});

app.delete("/inventory", (req, res) => {
  res.send("DELETE INVENTORY");
});

app.listen(3001);
