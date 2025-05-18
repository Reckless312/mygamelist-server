const app = require('../');
const { TextEncoder } = require('util');

global.TextEncoder = TextEncoder;
const supertest = require('supertest');
const {setPool, createOriginalPool} = require("../util/database");
const {Client, Pool} = require("../__mocks__/pg");

jest.mock("pg");

describe('API Test', () => {
    let mockPool;
    let mockClient;

    beforeEach(() => {
        mockPool = new Pool();
        mockClient = new Client();

        mockPool.connect.mockResolvedValue(mockClient);
        setPool(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        setPool(createOriginalPool());
    })

    describe('GET', () => {
        it('should fetch all games', async () => {
            const mockGames = [{
                id: 1,
                name: 'Persona 3 Reload',
                description: 'Test description',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
                releaseDate: '2024-02-02',
                price: 70,
                tag: 'JRPG'
            }];

            mockClient.query.mockResolvedValueOnce({ rows: mockGames });

            const response = await supertest(app).get("/api/games")

            expect(response.status).toBe(200);
            expect(await response.body).toEqual(mockGames);
        });
    });

    describe('GET Error', () => {
        it('should return a message', async () => {
            mockClient.query.mockRejectedValueOnce(new Error("Database connection failed"));

            const response = await supertest(app).get("/api/games")

            expect(response.status).toBe(500);

            expect(await response.body).toEqual({
                message: "Error happened while retrieving games"
            });
        });
    });

    describe('DELETE', () => {
        it('should delete a game', async () => {
            const mockId = 1;
            mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

            const response = await supertest(app).delete("/api/games").send({id: mockId});

            expect(response.status).toBe(200);
            expect(await response.body).toEqual({ message: 'Game deleted successfully' });
        });
    });

    describe('DELETE WITH ID NOT PROVIDED', () => {
        it('should return a message', async () => {

            const response = await supertest(app).delete("/api/games");

            expect(response.status).toBe(400);
            expect(await response.body).toEqual({ message: 'Game id required' });
        });
    });

    describe('DELETE WITH ID NOT FOUND', () => {
        it('should return a message', async () => {
            const mockId = -100;

            mockClient.query.mockResolvedValueOnce({ rowCount: 0 });

            const response = await supertest(app).delete("/api/games").send({id: mockId});

            expect(response.status).toBe(401);
            expect(await response.body).toEqual({ message: 'Game id not found!' });
        });
    });

    describe('DELETE WITH ERROR', () => {
        it('should return a message', async () => {
            const mockId = 1;

            mockClient.query.mockRejectedValueOnce(new Error("Database connection failed"));

            const response = await supertest(app).delete("/api/games").send({id: mockId});

            expect(response.status).toBe(500);
            expect(await response.body).toEqual({ message: 'Error happened while deleting game' });
        });
    });

    describe('POST', () => {
        it('should create a new game', async () => {
            const mockGame = {
                name: 'New Game',
                description: 'Test description',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
                releaseDate: '2024-01-01',
                price: 60,
                tag: 'Adventure'
            };

            mockClient.query
                .mockResolvedValueOnce({ rowCount: 0 })
                .mockResolvedValueOnce({ rowCount: 1 });

            const response = await supertest(app).post("/api/games").send(mockGame);

            expect(response.status).toBe(200);
            expect(await response.body).toEqual({ message: 'Game created successfully' });
        });
    });

    describe('POST WITH AN ARGUMENT MISSING', () => {
        it('should return a message', async () => {
            const mockGame = {
                description: 'Test description',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
                releaseDate: '2024-01-01',
                price: 60,
                tag: 'Adventure'
            };

            const response = await supertest(app).post("/api/games").send(mockGame);

            expect(response.status).toBe(404);
            expect(await response.body).toEqual({ message: 'Missing required fields' });
        });
    });

    describe('POST A GAME THAT IS IN THE DATABASE', () => {
        it('should return a message', async () => {
            const mockGame = {
                name: 'New Game',
                description: 'Test description',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
                releaseDate: '2024-01-01',
                price: 60,
                tag: 'Adventure'
            };

            mockClient.query.mockResolvedValueOnce({ rowCount: 1 })

            const response = await supertest(app).post("/api/games").send(mockGame);

            expect(response.status).toBe(401);
            expect(await response.body).toEqual({ message: 'Game already found with same critical information' });
        });
    });

    describe('POST A GAME WITH INVALID GAME DATA', () => {
        it('should return a message', async () => {
            const mockGame = {
                name: 'Ne',
                description: 'Test description',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
                releaseDate: '2024-01-01',
                price: 60,
                tag: 'Adventure'
            };

            const response = await supertest(app).post("/api/games").send(mockGame);

            expect(response.status).toBe(400);
            expect(await response.body).toEqual({ message: 'Validation for input failed!' });
        });
    });

    describe('POST WITH AN ERROR', () => {
        it('should return a message', async () => {
            const mockGame = {
                name: 'New Game',
                description: 'Test description',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
                releaseDate: '2024-01-01',
                price: 60,
                tag: 'Adventure'
            };

            mockClient.query.mockRejectedValueOnce(new Error("Database connection failed"));

            const response = await supertest(app).post("/api/games").send(mockGame);

            expect(response.status).toBe(500);
            expect(await response.body).toEqual({ message: 'Error happened while creating game' });
        });
    });

    describe('PATCH', () => {
        it('should update a game', async () => {
            const mockGame = {
                id: "1",
                name: 'New Game',
                description: 'Test description',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
                releaseDate: '2024-01-01',
                price: 60,
                tag: 'Adventure'
            };

            mockClient.query
                .mockResolvedValueOnce({ rowCount: 1 })
                .mockResolvedValueOnce({ rowCount: 0})
                .mockResolvedValueOnce({ rowCount: 1 });

            const response = await supertest(app).patch("/api/games").send(mockGame);

            expect(response.status).toBe(200);
            expect(await response.body).toEqual({ message: 'Game updated successfully' });
        });
    });

    describe('PATCH A GAME WITH WRONG VALIDATION', () => {
        it('should update a game', async () => {
            const mockGame = {
                id: "1",
                name: 'Ne',
                description: 'Test description',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
                releaseDate: '2024-01-01',
                price: 60,
                tag: 'Adventure'
            };

            const response = await supertest(app).patch("/api/games").send(mockGame);

            expect(response.status).toBe(400);
            expect(await response.body).toEqual({ message: 'Validation for input failed!' });
        });
    });

    describe('PATCH WITH MISSING ARGUMENTS', () => {
        it('should return a message', async () => {
            const mockGame = {
                name: 'New Game',
                description: 'Test description',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
                releaseDate: '2024-01-01',
                price: 60,
                tag: 'Adventure'
            };

            const response = await supertest(app).patch("/api/games").send(mockGame);

            expect(response.status).toBe(401);
            expect(await response.body).toEqual({ message: 'Missing required fields' });
        });
    });

    describe('PATCH WITH GAME NOT INSIDE THE DATABASE', () => {
        it('should return a message', async () => {
            const mockGame = {
                id: "1",
                name: 'New Game',
                description: 'Test description',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
                releaseDate: '2024-01-01',
                price: 60,
                tag: 'Adventure'
            };

            mockClient.query
                .mockResolvedValueOnce({ rowCount: 0 })

            const response = await supertest(app).patch("/api/games").send(mockGame);

            expect(response.status).toBe(402);
            expect(await response.body).toEqual({ message: 'Game id not found!' });
        });
    });

    describe('PATCH ERROR', () => {
        it('should return a message', async () => {
            const mockGame = {
                id: "1",
                name: 'New Game',
                description: 'Test description',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
                releaseDate: '2024-01-01',
                price: 60,
                tag: 'Adventure'
            };

            mockClient.query.mockRejectedValueOnce(new Error("Database connection failed"));

            const response = await supertest(app).patch("/api/games").send(mockGame);

            expect(response.status).toBe(500);
            expect(await response.body).toEqual({ message: 'Error happened while updating the game' });
        });
    });

    describe('POST', () => {
        it('should get games that contain the name', async () => {
            const mockGameName = "New game";
            const mockGames = [
                {id: 1, name: 'New Game 1'},
                {id: 2, name: 'New Game 2'},
                {id: 3, name: 'New Game 3'},
            ]

            mockClient.query.mockResolvedValueOnce({rows: mockGames, rowCount: mockGames.length });

            const response = await supertest(app).post("/api/games/filter").send({name: mockGameName});

            expect(response.status).toBe(200);
            expect(await response.body).toEqual(mockGames);
            expect(mockClient.query).toHaveBeenCalledWith(
                'SELECT * FROM games WHERE LOWER(name) LIKE \'%\' || LOWER($1) || \'%\'',
                [mockGameName]
            );
        });
    });

    describe('POST WITH AN ARGUMENT MISSING', () => {
        it('should return a message', async () => {
            const mockGame = {
            };

            const response = await supertest(app).post("/api/games/filter").send(mockGame);
            expect(response.status).toBe(404);
            expect(await response.body).toEqual({ message: 'Missing required fields' });
        });
    });

    describe('POST WITH AN ERROR', () => {
        it('should return a message', async () => {
            const mockGame = {
                name: 'New Game',
            };

            mockClient.query.mockRejectedValueOnce(new Error("Database connection failed"));

            const response = await supertest(app).post("/api/games/filter").send(mockGame);

            expect(response.status).toBe(500);
            expect(await response.body).toEqual({ message: 'Error happened while filtering games' });
        });
    });

    describe('GET', () => {
        it('should fetch all games', async () => {
            const mockGames = [
                {id: 1, name: 'Persona 3 Reload'},
                {id: 2, name: 'Minecraft'},];

            const expectedMockGames = [
                {id: 2, name: 'Minecraft'},
                {id: 1, name: 'Persona 3 Reload'}];

            mockClient.query.mockResolvedValueOnce({ rows: expectedMockGames });

            const response = await supertest(app).get("/api/games/sort").send(mockGames);
            expect(response.status).toBe(200);
            expect(await response.body).toEqual(expectedMockGames);
            expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM games ORDER BY name');
        });
    });

    describe('GET Error', () => {
        it('should return a message', async () => {
            mockClient.query.mockRejectedValueOnce(new Error("Database connection failed"));

            const response = await supertest(app).get("/api/games/sort");

            expect(response.status).toBe(500);

            expect(await response.body).toEqual({
                message: "Error happened while retrieving games"
            });
        });
    });
});