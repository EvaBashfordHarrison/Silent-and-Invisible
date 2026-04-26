require('dotenv').config();
console.log("ALL ENV VARS:", process.env.API_KEY); 

const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.static('public'));

app.get('/air-quality', async (req, res) => {
  try {
    const token = process.env.API_KEY; 
    const waqiUrl = `https://api.waqi.info/feed/london/?token=${token}`;

    const response = await fetch(waqiUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data");
    }
});


app.listen(3000, () => console.log('Listening at http://localhost:3000'));
