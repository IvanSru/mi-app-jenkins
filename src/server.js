const express = require('express');
const { sumar, saludar } = require('./app');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send(`
        <h1>Mi App Jenkins</h1>
        <p>${saludar('Ivan')}</p>
        <p>2 + 3 = ${sumar(2, 3)}</p>
    `);
});

app.listen(PORT, () => {
    console.log('Servidor corriendo en http://localhost:' + PORT);
});