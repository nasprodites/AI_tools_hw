const request = require('supertest');
const { io: ioClient } = require('socket.io-client');
const { app, httpServer, io } = require('../index');

describe('Coding Interview Platform Integration Tests', () => {
  let server;
  const PORT = 3002; // Use different port for testing

  beforeAll((done) => {
    server = httpServer.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      done();
    });
  });

  afterAll((done) => {
    io.close();
    server.close(done);
  });

  describe('REST API Tests', () => {
    test('POST /api/sessions should create a new session and return a valid session ID', async () => {
      const response = await request(app)
        .post('/api/sessions')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('sessionId');
      expect(typeof response.body.sessionId).toBe('string');
      expect(response.body.sessionId.length).toBeGreaterThan(0);
    });

    test('GET /api/sessions/:id should return session details for valid session', async () => {
      // First create a session
      const createResponse = await request(app)
        .post('/api/sessions')
        .expect(200);

      const sessionId = createResponse.body.sessionId;

      // Then retrieve it
      const getResponse = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(getResponse.body).toHaveProperty('id', sessionId);
      expect(getResponse.body).toHaveProperty('code', '');
      expect(getResponse.body).toHaveProperty('language', 'javascript');
      expect(getResponse.body).toHaveProperty('participants');
      expect(Array.isArray(getResponse.body.participants)).toBe(true);
    });

    test('GET /api/sessions/:id should return 404 for non-existent session', async () => {
      const response = await request(app)
        .get('/api/sessions/non-existent-id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Session not found');
    });
  });

  describe('WebSocket Tests', () => {
    let socketUrl;

    beforeAll(() => {
      socketUrl = `http://localhost:${PORT}`;
    });

    test('WebSocket connection to a session should work', (done) => {
      request(app)
        .post('/api/sessions')
        .end((err, res) => {
          if (err) return done(err);

          const sessionId = res.body.sessionId;
          const client = ioClient(socketUrl);

          client.on('connect', () => {
            client.emit('join-session', sessionId);

            client.on('session-state', (data) => {
              expect(data).toHaveProperty('code');
              expect(data).toHaveProperty('language');
              client.close();
              done();
            });
          });

          client.on('connect_error', (error) => {
            client.close();
            done(error);
          });
        });
    });

    test('Code changes should broadcast to all connected clients', (done) => {
      request(app)
        .post('/api/sessions')
        .end((err, res) => {
          if (err) return done(err);

          const sessionId = res.body.sessionId;
          const client1 = ioClient(socketUrl);
          const client2 = ioClient(socketUrl);
          const testCode = 'console.log("Hello, World!");';

          let client1Connected = false;
          let client2Connected = false;

          const checkBothConnected = () => {
            if (client1Connected && client2Connected) {
              // Client 1 sends code change
              client1.emit('code-change', { sessionId, code: testCode });
            }
          };

          client1.on('connect', () => {
            client1.emit('join-session', sessionId);
            client1.on('session-state', () => {
              client1Connected = true;
              checkBothConnected();
            });
          });

          client2.on('connect', () => {
            client2.emit('join-session', sessionId);
            client2.on('session-state', () => {
              client2Connected = true;
              checkBothConnected();
            });

            // Client 2 should receive the code update from Client 1
            client2.on('code-update', (data) => {
              expect(data.code).toBe(testCode);
              client1.close();
              client2.close();
              done();
            });
          });
        });
    });

    test('Multiple clients in the same session should receive updates', (done) => {
      request(app)
        .post('/api/sessions')
        .end((err, res) => {
          if (err) return done(err);

          const sessionId = res.body.sessionId;
          const client1 = ioClient(socketUrl);
          const client2 = ioClient(socketUrl);
          const client3 = ioClient(socketUrl);
          const testLanguage = 'python';

          let connectedClients = 0;
          let receivedUpdates = 0;

          const checkAllConnected = () => {
            connectedClients++;
            if (connectedClients === 3) {
              // All clients connected, send language change from client 1
              client1.emit('language-change', { sessionId, language: testLanguage });
            }
          };

          const handleLanguageUpdate = (data) => {
            expect(data.language).toBe(testLanguage);
            receivedUpdates++;

            // All 3 clients should receive the update
            if (receivedUpdates === 3) {
              client1.close();
              client2.close();
              client3.close();
              done();
            }
          };

          [client1, client2, client3].forEach((client) => {
            client.on('connect', () => {
              client.emit('join-session', sessionId);
              client.on('session-state', () => {
                checkAllConnected();
              });
              client.on('language-update', handleLanguageUpdate);
            });
          });
        });
    });

    test('Client should receive error for joining non-existent session', (done) => {
      const client = ioClient(socketUrl);

      client.on('connect', () => {
        client.emit('join-session', 'non-existent-session-id');

        client.on('error', (data) => {
          expect(data).toHaveProperty('message', 'Session not found');
          client.close();
          done();
        });
      });
    });
  });
});
