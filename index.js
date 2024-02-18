const express = require("express");
import generateLargePrime from "./utils/generateLargePrime";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// console.log("Test 1", generateLargePrime(128));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
