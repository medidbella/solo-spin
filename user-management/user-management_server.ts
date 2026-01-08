import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { randomUUID } from 'crypto';

// 1. Define the Shape of a User
interface User {
	name: string;
	password: string; // In a real app, hash this! 
	id: string;
}

// 2. Define the Request Body Type
interface SignupBody {
	name: string;
	password: string;
}

// Define the shape of the login request
interface LoginBody {
    name: string;
    password: string;
}

const server: FastifyInstance = Fastify({ logger: true });

// 3. Use a Map for O(1) storage
const users = new Map<string, User>();

// Helper to generate IDs
const generateID = (name: string): string => {
	const uid: string = randomUUID();
	return `${name}_${uid}`;
};

// Register Plugins
server.register(fastifyCors, { 
		origin: true, // Allow all origins (great for dev)
		credentials: true // Important for Cookies to work!
});

server.register(fastifyCookie, {
	secret: "super-secret-temporary-key", 
});

// 4. The sign up Typed Route
server.post<{ Body: SignupBody }>('/api/user-management/signup', async (request: FastifyRequest, reply: FastifyReply) => {
	
	console.log("📝 /api/user-management/signup route hit");

	const { name, password } = request.body as SignupBody;

	if (!name || !password) {
		return reply.code(400).send({ error: 'Name and password are required' });
	}

	// Normalize name to lowercase to prevent duplicates like "User" and "user"
	const normalizedName = name.toLowerCase();

	if (users.has(normalizedName)) {
		return reply.code(409).send({ error: 'Name already exists' });
	}

	// Create User
	const playerId = generateID(name);
	const newUser: User = { name, password, id: playerId };
	
	users.set(normalizedName, newUser);

	// Set Cookies
	// Note: 'path: /' ensures the frontend can read it on any page
	reply.setCookie('playerName', name, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
    });
	reply.setCookie('playerId', playerId, {
		path: '/',
		httpOnly: false, // Set to FALSE so your frontend JS can read it
		sameSite: 'lax',
	});

	server.log.info(`New User Registered: ${name} (ID: ${playerId})`);

	return reply.code(201).send({ 
		success: true, 
		message: 'User created', 
		name,
		id: playerId 
	});
});

// 5. The Login Route
server.post<{ Body: LoginBody }>('/api/user-management/login', async (request, reply) => {
    console.log("🔐 /api/user-management/login route hit");

    const { name, password } = request.body;

    if (!name || !password) {
        return reply.code(400).send({ error: 'Name and password are required' });
    }

    const normalizedName = name.toLowerCase();
    const user = users.get(normalizedName);

    // Check if user exists AND if password matches
    // (In a real app, you would compare hashed passwords here)
    if (!user || user.password !== password) {
        return reply.code(401).send({ error: 'Invalid name or password' });
    }

    // If valid, set the cookies again so they are logged in
    reply.setCookie('playerName', user.name, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
    });

    reply.setCookie('playerId', user.id, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
    });

    server.log.info(`User Logged In: ${user.name}`);

    return reply.code(200).send({
        success: true,
        message: 'Login successful',
        name: user.name,
        id: user.id
    });
});

// Start Server
const start = async () => {
	try {
		const port = Number(process.env.USR_MANAGEMENT_PORT) || 3001;
		await server.listen({ port, host: '0.0.0.0' });
		console.log(`User Management running on http://0.0.0.0:${port}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();