/**
 * Script de test simple pour vérifier tous les endpoints
 * Usage: node test-endpoints.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function testEndpoint(name, method, path, body = null, expectedStatus = 200) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.status === expectedStatus) {
      log.success(`${name} - ${method} ${path}`);
      return { success: true, data, status: response.status };
    } else {
      log.error(`${name} - Expected ${expectedStatus}, got ${response.status}`);
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    log.error(`${name} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('ANTA API - Test des endpoints');
  console.log('='.repeat(60) + '\n');

  log.info(`Base URL: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;
  let testData = {};

  // Health Check
  console.log('📋 Health Check');
  console.log('-'.repeat(60));
  const health = await testEndpoint('Health Check', 'GET', '/health');
  health.success ? passed++ : failed++;
  console.log();

  // Users
  console.log('👥 Users Endpoints');
  console.log('-'.repeat(60));
  
  // Create user
  const createUser = await testEndpoint(
    'Create User',
    'POST',
    '/users',
    {
      phone: `+336${Math.random().toString().slice(2, 10)}`,
      email: `test${Date.now()}@example.com`,
      name: 'Test User',
      password_hash: 'hashed_password'
    },
    201
  );
  createUser.success ? passed++ : failed++;
  if (createUser.success) {
    testData.userId = createUser.data.data.id;
  }

  // Get users
  const getUsers = await testEndpoint('Get Users', 'GET', '/users?page=1&limit=10');
  getUsers.success ? passed++ : failed++;

  // Get user by ID
  if (testData.userId) {
    const getUser = await testEndpoint('Get User by ID', 'GET', `/users/${testData.userId}`);
    getUser.success ? passed++ : failed++;
  }

  // Get active users
  const getActiveUsers = await testEndpoint('Get Active Users', 'GET', '/users/active');
  getActiveUsers.success ? passed++ : failed++;
  
  console.log();

  // Drivers
  console.log('🚗 Drivers Endpoints');
  console.log('-'.repeat(60));

  // Create driver (need user first)
  if (testData.userId) {
    const createDriver = await testEndpoint(
      'Create Driver',
      'POST',
      '/drivers',
      {
        user_id: testData.userId,
        status: 'offline',
        kyc_status: 'pending'
      },
      201
    );
    createDriver.success ? passed++ : failed++;
    if (createDriver.success) {
      testData.driverId = createDriver.data.data.id;
    }
  }

  // Get drivers
  const getDrivers = await testEndpoint('Get Drivers', 'GET', '/drivers?page=1&limit=10');
  getDrivers.success ? passed++ : failed++;

  // Get online drivers
  const getOnlineDrivers = await testEndpoint('Get Online Drivers', 'GET', '/drivers/online');
  getOnlineDrivers.success ? passed++ : failed++;

  console.log();

  // Vehicles
  console.log('🚙 Vehicles Endpoints');
  console.log('-'.repeat(60));

  // Create vehicle
  if (testData.driverId) {
    const createVehicle = await testEndpoint(
      'Create Vehicle',
      'POST',
      '/vehicles',
      {
        driver_id: testData.driverId,
        type: 'sedan',
        model: 'Toyota Camry',
        color: 'Black',
        capacity: 4,
        status: 'active'
      },
      201
    );
    createVehicle.success ? passed++ : failed++;
    if (createVehicle.success) {
      testData.vehicleId = createVehicle.data.data.id;
    }
  }

  // Get vehicles
  const getVehicles = await testEndpoint('Get Vehicles', 'GET', '/vehicles?page=1&limit=10');
  getVehicles.success ? passed++ : failed++;

  // Get active vehicles
  const getActiveVehicles = await testEndpoint('Get Active Vehicles', 'GET', '/vehicles/active');
  getActiveVehicles.success ? passed++ : failed++;

  console.log();

  // Trips
  console.log('🛣️  Trips Endpoints');
  console.log('-'.repeat(60));

  // Create trip
  if (testData.userId) {
    const createTrip = await testEndpoint(
      'Create Trip',
      'POST',
      '/trips',
      {
        passenger_id: testData.userId,
        origin_lat: 48.8566,
        origin_lng: 2.3522,
        origin_text: 'Paris, France',
        dest_lat: 48.8738,
        dest_lng: 2.2950,
        dest_text: 'La Défense',
        price_estimated: 1500,
        distance_m: 5000,
        duration_s: 900,
        payment_method: 'card'
      },
      201
    );
    createTrip.success ? passed++ : failed++;
    if (createTrip.success) {
      testData.tripId = createTrip.data.data.id;
    }
  }

  // Get trips
  const getTrips = await testEndpoint('Get Trips', 'GET', '/trips?page=1&limit=10');
  getTrips.success ? passed++ : failed++;

  // Get pending trips
  const getPendingTrips = await testEndpoint('Get Pending Trips', 'GET', '/trips/pending');
  getPendingTrips.success ? passed++ : failed++;

  console.log();

  // Payments
  console.log('💳 Payments Endpoints');
  console.log('-'.repeat(60));

  // Create payment
  if (testData.tripId) {
    const createPayment = await testEndpoint(
      'Create Payment',
      'POST',
      '/payments',
      {
        trip_id: testData.tripId,
        amount: 1500,
        currency: 'EUR',
        method: 'card',
        status: 'pending'
      },
      201
    );
    createPayment.success ? passed++ : failed++;
  }

  // Get payments
  const getPayments = await testEndpoint('Get Payments', 'GET', '/payments?page=1&limit=10');
  getPayments.success ? passed++ : failed++;

  // Get total revenue
  const getTotalRevenue = await testEndpoint('Get Total Revenue', 'GET', '/payments/revenue/total');
  getTotalRevenue.success ? passed++ : failed++;

  console.log();

  // Error handling tests
  console.log('❌ Error Handling Tests');
  console.log('-'.repeat(60));

  // 404 Not Found
  const notFound = await testEndpoint('Get Non-existent User', 'GET', '/users/99999', null, 404);
  notFound.success ? passed++ : failed++;

  console.log();

  // Summary
  console.log('='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${passed + failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);
  console.log('='.repeat(60) + '\n');

  if (failed === 0) {
    log.success('All tests passed! 🎉');
  } else {
    log.warn(`Some tests failed. Please check the errors above.`);
  }

  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});
