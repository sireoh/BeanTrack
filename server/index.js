
const express = require('express');
const app = express();
const PORT = 3055;

app.get("/api", (req, res) => {
    res.send({
        "users": [
            "userOne",
            "userTwo",
            "userThree",
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})