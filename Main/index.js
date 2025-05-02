import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch'; // Make sure you installed it: (npm install node-fetch)

const app = express();
const port = 3000;

// Get the directory name in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set the view engine to EJS
app.set('view engine', 'ejs');
// Set the views directory
app.set('views', join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(join(__dirname, 'public')));

// Parse URL-encoded bodies (for form submissions)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (for chatbot POST requests)
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.render('index.ejs', { currentPage: '/' });
});

app.get('/about', (req, res) => {
  res.render('about.ejs', { currentPage: '/about' });
});

app.get('/enquire', (req, res) => {
  res.render('enquire.ejs', { currentPage: '/enquire' });
});

app.get('/gallery', (req, res) => {
  res.render('gallery.ejs', { currentPage: '/gallery' });
});

const deepSeekApiKey = '3792d48d5bbd40befa33904d88d22aab7f735bd51c4614828cb9a350a131edb2'; // 🔒 Keep it secret

app.post('/chat', async (req, res) => {
  const { userMessage, conversation } = req.body;

  if (!userMessage || !conversation) {
    return res.status(400).json({ error: 'Missing userMessage or conversation in request body' });
  }

  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepSeekApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-Vision-Free",
        messages: [
          { role: "system", content: `
            You are a helpful assistant for Greenwood High School.
            You assist with admissions, timings, fees, events, and general school information.
            If you are unsure, politely advise the user to contact the school office directly.
          `},
          ...conversation,
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'Invalid response from DeepSeek API' });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

// Handle form submission (POST request for /enquire)
app.post('/enquire', (req, res) => {
  const formData = {
    firstName: req.body.first_name,
    lastName: req.body.last_name,
    email: req.body.email,
    phone: req.body.phone,
    grade: req.body.grade,
    description: req.body.description
  };
  console.log('Form submitted:', formData);
  
  res.send('Thank you for your enquiry! We will get back to you soon.');
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
