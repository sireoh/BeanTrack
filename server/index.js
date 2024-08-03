const express = require('express');
const path = require('path');
const app = express();
const PORT = 3055;

app.get("/api", (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'db.json'));
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})