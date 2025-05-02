import app from './server';

const PORT = process.env.PORT || 5100;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
  console.log('Server initialized from index.ts');
}); 