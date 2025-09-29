// // Test script for Melita Authentication API
// // Run with: node test_auth.js

// import axios from 'axios';

// const BASE_URL = 'http://localhost:5000/auth';

// // Test data
// const testPhone = '+1234567890';
// const testName = 'Test User';

// async function testAuthFlow() {
//   console.log('🧪 Testing Melita Authentication API\n');

//   try {
//     // Test 1: Signup flow
//     console.log('1️⃣ Testing Signup Flow');
    
//     // Send OTP for signup
//     console.log('📤 Sending OTP for signup...');
//     const signupResponse = await axios.post(`${BASE_URL}/send-otp`, {
//       phone: testPhone,
//       name: testName,
//       type: 'signup'
//     });
//     console.log('✅ Signup OTP sent:', signupResponse.data);

//     // Note: In development mode, check console for the actual OTP
//     // In production, the OTP would be sent via SMS
//     const testOTP = '123456'; // Replace with actual OTP from console

//     // Verify OTP
//     console.log('🔐 Verifying OTP...');
//     const verifyResponse = await axios.post(`${BASE_URL}/verify-otp`, {
//       phone: testPhone,
//       otp: testOTP,
//       type: 'signup'
//     });
//     console.log('✅ OTP verified:', verifyResponse.data);

//     const token = verifyResponse.data.token;

//     // Test 2: Get profile
//     console.log('\n2️⃣ Testing Profile Endpoint');
//     const profileResponse = await axios.get(`${BASE_URL}/profile`, {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//     console.log('✅ Profile retrieved:', profileResponse.data);

//     // Test 3: Login flow
//     console.log('\n3️⃣ Testing Login Flow');
    
//     // Send OTP for login
//     console.log('📤 Sending OTP for login...');
//     const loginResponse = await axios.post(`${BASE_URL}/send-otp`, {
//       phone: testPhone,
//       type: 'login'
//     });
//     console.log('✅ Login OTP sent:', loginResponse.data);

//     // Verify OTP for login
//     console.log('🔐 Verifying OTP for login...');
//     const loginVerifyResponse = await axios.post(`${BASE_URL}/verify-otp`, {
//       phone: testPhone,
//       otp: testOTP,
//       type: 'login'
//     });
//     console.log('✅ Login OTP verified:', loginVerifyResponse.data);

//     console.log('\n🎉 All tests passed!');

//   } catch (error) {
//     console.error('❌ Test failed:', error.response?.data || error.message);
//   }
// }

// // Test error cases
// async function testErrorCases() {
//   console.log('\n🧪 Testing Error Cases\n');

//   try {
//     // Test invalid phone number
//     console.log('1️⃣ Testing invalid phone number...');
//     await axios.post(`${BASE_URL}/send-otp`, {
//       phone: '123',
//       type: 'signup'
//     });
//   } catch (error) {
//     console.log('✅ Invalid phone error handled:', error.response.data.message);
//   }

//   try {
//     // Test missing phone number
//     console.log('2️⃣ Testing missing phone number...');
//     await axios.post(`${BASE_URL}/send-otp`, {
//       type: 'signup'
//     });
//   } catch (error) {
//     console.log('✅ Missing phone error handled:', error.response.data.message);
//   }

//   try {
//     // Test login with non-existent user
//     console.log('3️⃣ Testing login with non-existent user...');
//     await axios.post(`${BASE_URL}/send-otp`, {
//       phone: '+9999999999',
//       type: 'login'
//     });
//   } catch (error) {
//     console.log('✅ Non-existent user error handled:', error.response.data.message);
//   }

//   try {
//     // Test profile without token
//     console.log('4️⃣ Testing profile without token...');
//     await axios.get(`${BASE_URL}/profile`);
//   } catch (error) {
//     console.log('✅ Missing token error handled:', error.response.data.message);
//   }

//   console.log('\n🎉 All error tests passed!');
// }

// // Run tests
// async function runTests() {
//   await testAuthFlow();
//   await testErrorCases();
// }

// runTests();
