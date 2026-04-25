export default function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { values } = req.body;

  // Validate input exists
  if (!values || !Array.isArray(values)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid data: values array required' 
    });
  }

  // Limit input size to prevent DoS
  if (values.length > 1000) {
    return res.status(400).json({ 
      success: false, 
      error: 'Too many values (max 1000)' 
    });
  }

  // Process and validate the data
  const processed = values
    .map(v => parseFloat(v))
    .filter(v => !isNaN(v) && v >= 0 && v <= 1000000); // Cap at 1M

  if (processed.length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'No valid numeric values provided' 
    });
  }

  // Calculate statistics
  const sum = processed.reduce((a, b) => a + b, 0);
  const avg = sum / processed.length;
  const min = Math.min(...processed);
  const max = Math.max(...processed);

  res.status(200).json({
    success: true,
    data: processed,
    stats: {
      count: processed.length,
      sum: Math.round(sum * 100) / 100,
      average: Math.round(avg * 100) / 100,
      min,
      max,
      range: max - min
    }
  });
}