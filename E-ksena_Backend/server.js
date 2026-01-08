// server.js logic for Reports and Messaging
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());

// Add this near the top of server.js (after app.use(express.json()))
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] 📥 ${req.method} request to ${req.url}`);
  console.log('Body:', req.body);
  next();
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// --- REPORT SYSTEM: Create New Ticket (POST) ---
app.post('/api/reports', async (req, res) => {
  const { title, content, user_id } = req.body;
  
  const { data, error } = await supabase
    .from('reports')
    .insert([{ title, content, user_id }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: "Ticket created", data });
});

// --- MESSAGING SYSTEM: Send SMS & Log (POST) ---
app.post('/api/messages', async (req, res) => {
  const { recipient_phone, body } = req.body;

  try {
    // 1. Log to Supabase
    const { error: dbError } = await supabase
      .from('messages')
      .insert([{ recipient_phone, body, status: 'sent' }]);

    if (dbError) throw dbError;

    // 2. SMS GATEWAY SAMPLE (e.g., Semaphore/Twilio/Local)
    // In a real scenario, you'd call their API here
    console.log(`[SMS GATEWAY] Sending to ${recipient_phone}: ${body}`);
    
    /* Sample Fetch Call to a Gateway:
    await fetch('https://api.gateway.com/send', {
      method: 'POST',
      body: JSON.stringify({ apikey: 'XYZ', number: recipient_phone, message: body })
    });
    */

    res.status(200).json({ success: true, message: "SMS logged and dispatched." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('E-ksena Backend running on port 3000'));