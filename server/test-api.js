import fetch from 'node-fetch';

async function testAPI() {
  const baseURL = 'http://localhost:5000';
  
  try {
    console.log('Testing API endpoints...\n');

    // Test product endpoint
    console.log('1. Testing GET /api/products/cleanser');
    const productResponse = await fetch(`${baseURL}/api/products/cleanser`);
    const productData = await productResponse.json();
    console.log('Status:', productResponse.status);
    console.log('Response:', productData);
    console.log('');

    // Test reviews endpoint
    console.log('2. Testing GET /api/products/cleanser/reviews');
    const reviewsResponse = await fetch(`${baseURL}/api/products/cleanser/reviews`);
    const reviewsData = await reviewsResponse.json();
    console.log('Status:', reviewsResponse.status);
    console.log('Response:', reviewsData);
    console.log('');

    // Test all products
    console.log('3. Testing GET /api/products/essence');
    const essenceResponse = await fetch(`${baseURL}/api/products/essence`);
    const essenceData = await essenceResponse.json();
    console.log('Status:', essenceResponse.status);
    console.log('Response:', essenceData);

  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI();
