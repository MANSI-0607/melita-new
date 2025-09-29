// // Setup script for Melita Server
// // This script helps you create the required .env file

// import fs from 'fs';
// import path from 'path';

// const envContent = `# Melita Server Environment Variables

// # JWT Secret for token signing
// JWT_SECRET=melita_dev_secret_key_12345

// # MongoDB Connection String - using local MongoDB
// MONGO_URI=mongodb://localhost:27017/melita

// # Server Configuration
// PORT=5000

// # CORS Configuration
// ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173

// # Fast2SMS Configuration (Optional - for SMS OTP delivery)
// # FAST2SMS_API_KEY=your_fast2sms_api_key_here
// # FAST2SMS_SENDER_ID=MELITA
// # FAST2SMS_TEMPLATE_ID=your_template_id_here
// # FAST2SMS_ROUTE=otp

// # Note: Since FAST2SMS_API_KEY is not set, the server will run in development mode
// # and log OTPs to console instead of sending SMS
// `;

// const envPath = path.join(process.cwd(), '.env');

// try {
//   // Check if .env already exists
//   if (fs.existsSync(envPath)) {
//     console.log('✅ .env file already exists');
//   } else {
//     // Create .env file
//     fs.writeFileSync(envPath, envContent);
//     console.log('✅ .env file created successfully');
//   }
  
//   console.log('\n📋 Environment Variables Set:');
//   console.log('- JWT_SECRET: melita_dev_secret_key_12345');
//   console.log('- MONGO_URI: mongodb://localhost:27017/melita');
//   console.log('- PORT: 5000');
//   console.log('- Development mode: ON (OTPs will be logged to console)');
  
//   console.log('\n🚀 Next Steps:');
//   console.log('1. Make sure MongoDB is running on your system');
//   console.log('2. Run: npm start');
//   console.log('3. Test the API endpoints');
  
// } catch (error) {
//   console.error('❌ Error creating .env file:', error.message);
//   console.log('\n📝 Manual Setup:');
//   console.log('Create a .env file in the server directory with the following content:');
//   console.log(envContent);
// }
