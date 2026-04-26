export default function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'POST') {
    const { values, labels, chartType } = req.body;

    if (!values || !Array.isArray(values)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid data: values array required' 
      });
    }

    // Limit input size
    if (values.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Too many values (max 1000)' 
      });
    }

    // Process and validate
    const processed = values
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v) && v >= 0 && v <= 1000000);

    if (processed.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No valid numeric values' 
      });
    }

    // Generate labels if not provided
    const finalLabels = labels && labels.length === processed.length 
      ? labels 
      : processed.map((_, i) => String.fromCharCode(65 + i));

    // Calculate statistics
    const sum = processed.reduce((a, b) => a + b, 0);
    const avg = sum / processed.length;
    const min = Math.min(...processed);
    const max = Math.max(...processed);
    const sorted = [...processed].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2 
      : sorted[Math.floor(sorted.length/2)];

    res.status(200).json({
      success: true,
      data: processed,
      labels: finalLabels,
      chartType: chartType || 'line',
      stats: {
        count: processed.length,
        sum: Math.round(sum * 100) / 100,
        average: Math.round(avg * 100) / 100,
        min,
        max,
        range: max - min,
        median: Math.round(median * 100) / 100
      }
    });
  } else if (req.method === 'GET') {
    // Generate sample data for different chart types
    const sampleData = {
      line: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        values: [65, 59, 80, 81, 56, 55, 40]
      },
      bar: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        values: [65, 59, 80, 81, 56, 55, 40]
      },
      pie: {
        labels: ['Category A', 'Category B', 'Category C', 'Category D'],
        values: [300, 50, 100, 150]
      },
      doughnut: {
        labels: ['Product 1', 'Product 2', 'Product 3', 'Product 4'],
        values: [300, 50, 100, 150]
      },
      radar: {
        labels: ['Speed', 'Reliability', 'Comfort', 'Safety', 'Efficiency'],
        values: [65, 59, 80, 81, 56]
      }
    };

    res.status(200).json({
      success: true,
      data: sampleData
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}