export default function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  // Generate realistic live data
  const points = Array.from({ length: 20 }, (_, i) => ({
    timestamp: Date.now() - (19 - i) * 1000,
    value: Math.round(30 + Math.sin(i * 0.5) * 20 + Math.random() * 15)
  }));

  res.status(200).json({
    success: true,
    data: points,
    meta: {
      type: 'live',
      refreshRate: 1000,
      totalPoints: points.length
    }
  });
}