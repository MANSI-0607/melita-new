import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testOTPSending() {
  const apiKey = process.env.FAST2SMS_API_KEY || '9b5m8NwFGIBuanxhWrRveM1Z0H4KtzJQLOC3lpESojf6AciTdymskyLJPF1pRDr0YacEIvO8HnU3AjNQ';
  const templateId = process.env.FAST2SMS_TEMPLATE_ID || '184006';
  const testPhone = '9999999999'; // Replace with a test number
  const testOTP = '123456';

  if (!apiKey) {
    console.log('No API key found. Please set FAST2SMS_API_KEY in your .env file');
    return;
  }

  console.log('Testing Fast2SMS OTP sending...');
  console.log(`API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`Template ID: ${templateId}`);
  console.log(`Test Phone: ${testPhone}`);
  console.log(`Test OTP: ${testOTP}`);

  try {
    const queryParams = new URLSearchParams({
      authorization: apiKey,
      route: 'dlt',
      sender_id: 'MELITA',
      message: templateId,
      variables_values: testOTP,
      numbers: testPhone,
      flash: '0',
    });

    const smsUrl = `https://www.fast2sms.com/dev/bulkV2?${queryParams.toString()}`;
    console.log(`\nSMS URL: ${smsUrl}`);

    const response = await axios.get(smsUrl, {
      timeout: 10000,
    });

    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    if (response.data && response.data.return === true) {
      console.log('✅ OTP sent successfully!');
    } else {
      console.log('❌ OTP sending failed:', response.data);
    }

  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testOTPSending();
