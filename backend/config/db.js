const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Tip: Your local MongoDB service might not be running.');
      console.log('👉 Try: "net start MongoDB" in an Admin terminal.');
      console.log('👉 Or: Ensure your MONGODB_URI in .env is correct for Atlas/Cloud.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
