import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo (replace with database in production)
const events = [];

// Webhook endpoints
app.post('/webhooks/stream-created', (req, res) => {
  try {
    const event = {
      type: 'stream-created',
      data: req.body,
      timestamp: new Date().toISOString()
    };

    events.push(event);
    console.log('Stream created:', event);

    // Here you could:
    // - Store in database
    // - Send notifications
    // - Update external systems
    // - Trigger additional analytics

    res.status(200).json({ success: true, message: 'Stream creation recorded' });
  } catch (error) {
    console.error('Error processing stream creation webhook:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/webhooks/stream-withdrawal', (req, res) => {
  try {
    const event = {
      type: 'stream-withdrawal',
      data: req.body,
      timestamp: new Date().toISOString()
    };

    events.push(event);
    console.log('Stream withdrawal:', event);

    res.status(200).json({ success: true, message: 'Withdrawal recorded' });
  } catch (error) {
    console.error('Error processing withdrawal webhook:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/webhooks/stream-refuel', (req, res) => {
  try {
    const event = {
      type: 'stream-refuel',
      data: req.body,
      timestamp: new Date().toISOString()
    };

    events.push(event);
    console.log('Stream refuel:', event);

    res.status(200).json({ success: true, message: 'Refuel recorded' });
  } catch (error) {
    console.error('Error processing refuel webhook:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/webhooks/user-rated', (req, res) => {
  try {
    const event = {
      type: 'user-rated',
      data: req.body,
      timestamp: new Date().toISOString()
    };

    events.push(event);
    console.log('User rated:', event);

    res.status(200).json({ success: true, message: 'Rating recorded' });
  } catch (error) {
    console.error('Error processing rating webhook:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// API endpoints for querying events (for demo)
app.get('/api/events', (req, res) => {
  res.json(events);
});

app.get('/api/events/:type', (req, res) => {
  const { type } = req.params;
  const filteredEvents = events.filter(event => event.type === type);
  res.json(filteredEvents);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
  console.log(`Webhook endpoints ready for chainhooks`);
});