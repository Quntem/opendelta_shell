var express = require('express');
var port = 80
var app = express()

app.use("/", express.static("./"))

app.listen(port, () => {
    console.log(port)
})