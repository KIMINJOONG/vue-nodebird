const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
   res.send('안녕 백엔드');
});

app.post('/user', (req, res) => {
    
})
app.listen(3085, () => {
    console.log(`http://localhost:${3085}`)
});