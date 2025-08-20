import prisma from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- Agent Registration ---
export const register = async (req, res) => {
  const { email, name, password, role } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Please provide email, name, and password.' });
  }

  try {
    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = await prisma.agent.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'AGENT', // Defaults to AGENT if not specified
      },
    });

    // Don't send the password back to the client
    const { password: _, ...agentData } = newAgent;
    res.status(201).json(agentData);

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Could not create agent.' });
  }
};

// --- Agent Login ---
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  try {
    const agent = await prisma.agent.findUnique({ where: { email } });

    if (!agent) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, agent.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Create a JWT
    const token = jwt.sign(
      { id: agent.id, role: agent.role },
      process.env.JWT_SECRET, // You'll need to add this to your .env file
      { expiresIn: '1d' } // Token expires in 1 day
    );

    const { password: _, ...agentData } = agent;
    res.status(200).json({ agent: agentData, token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
};