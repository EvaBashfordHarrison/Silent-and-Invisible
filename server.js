require('dotenv').config();

const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.static('public'));

app.get('/air-quality', async (req, res) => {
  try {
    const token = process.env.API_KEY;

    if (!token) {
      return res.status(500).send("API key not found");
    }

    const waqiUrl = `https://api.waqi.info/feed/london/?token=${token}`;

    const response = await axios.get(waqiUrl);
    res.json(response.data);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error fetching data");
  }
});

app.listen(3000, () => {
  console.log('Listening at http://localhost:3000');
});