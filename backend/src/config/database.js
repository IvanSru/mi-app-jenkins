const mongoose = require('mongoose');

module.exports = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI no definida en .env');

  await mongoose.connect(uri);
  console.log('✅ MongoDB conectado:', mongoose.connection.host);

  mongoose.connection.on('error', (err) => {
    console.error('❌ Error de MongoDB:', err.message);
  });
};
