const express = require('express');

const app = express();

app.get('/', (req, res) => {
   res.send('안녕 백엔드');
});

app.listen(3085, () => {
    console.log(`http://localhost:${3085}`)
});