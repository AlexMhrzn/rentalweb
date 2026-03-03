const request = require('supertest');
const app = require('../index'); 
const { sequelize } = require('../database/db');
const User = require('../models/userModel'); // Adjust path as needed

beforeAll(async () => {
  // Optional: Sync database before testing to ensure tables exist
  await sequelize.sync({ force: false }); 
});

afterAll(async () => {
  // Clean up test data if necessary
  await User.destroy({ where: { email: 'testuser@example.com' } });
  await sequelize.close(); 
});

describe('RentalWeb API Suite', () => {

  // --- ENTRY POINT TESTS (2) ---
  it('1. GET / should return 200 and welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('Welcome');
  });

  it('2. GET /random-route should return 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toEqual(404);
  });

  // --- USER & AUTH TESTS (4) ---
  it('3. POST /api/user/register should fail with missing data', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'only-email@test.com' }); // Missing password/name
    expect(res.statusCode).not.toBe(200); 
  });

  it('4. POST /api/user/login should fail with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'wrong@user.com', password: 'password123' });
    expect(res.statusCode).toBe(401); // Or 400 depending on your controller
  });

  it('5. GET /api/user/profile should be protected (return 401)', async () => {
    const res = await request(app).get('/api/user/profile');
    // Assuming you use middleware that returns 401 if no token is provided
    expect(res.statusCode).toBe(401);
  });

  it('6. POST /api/user/register should create a test user', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ 
        username: 'testuser', 
        email: 'testuser@example.com', 
        password: 'Password123!' 
      });
    // Adjust based on your actual success status (200 or 201)
    expect([200, 201]).toContain(res.statusCode);
  });

  // --- PRODUCT / RENTAL TESTS (4) ---
  it('7. GET /api/product/ should return a list of products', async () => {
    const res = await request(app).get('/api/product/');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('8. GET /api/product/:id should return 404 for invalid ID', async () => {
    const res = await request(app).get('/api/product/999999');
    expect(res.statusCode).toBe(404);
  });

  it('9. POST /api/product/ should block unauthorized uploads', async () => {
    const res = await request(app)
      .post('/api/product/')
      .send({ title: 'New House', price: 500 });
    expect(res.statusCode).toBe(401); // Must be logged in to post a product
  });

  it('10. GET /api/booking should return 401 for guests', async () => {
    const res = await request(app).get('/api/booking');
    expect(res.statusCode).toBe(401);
  });

});