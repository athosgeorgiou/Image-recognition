const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const Clarifai = require('clarifai');
const path = require('path');

const app = express();
const port = 3000;

// Set up the Clarifai API client with your API key
const clarifai = new Clarifai.App({
  apiKey: ''
});

// Use bodyParser middleware to parse request bodies as JSON
app.use(bodyParser.json());

// Set up multer middleware to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit
  },
});

// Define a route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Define a route for the image recognition page
app.get('/predict', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'predict.html'));
});

// Define a route to handle predictions
app.post('/predict', upload.single('file'), (req, res) => {
  const { buffer, mimetype } = req.file;

  // Use the Clarifai API client to predict image contents
  clarifai.models.predict(Clarifai.GENERAL_MODEL, { base64: buffer.toString('base64') })
    .then(response => {
      const predictions = response.outputs[0].data.concepts;
      res.send(`
        <html>
          <head>
            <title>Clarifai App - Image Recognition Results</title>
          </head>
          <body>
            <h1>Image Recognition Results</h1>
            <p>The following objects were detected in the image:</p>
            <ul>
              ${predictions.map(prediction => `<li>${prediction.name} (${prediction.value})</li>`).join('')}
            </ul>
            <p><a href="/">Back to Home</a></p>
          </body>
        </html>
      `);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error predicting image contents.');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});
