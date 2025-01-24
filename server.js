const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);

const jwt = require('jsonwebtoken');

app.post('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.status === 'blocked') {
      return res.status(403).json({ message: 'User is blocked' });
    }

    return res.status(200).json({ message: 'Authorized' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

router.get("/auth/me", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await getUserByEmail(decoded.email); // Use email from decoded token
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Return only the necessary user details (e.g., name, email, status)
      res.status(200).json({
        name: user.name,
        email: user.email,
        status: user.status,
      });
    } catch (error) {
      console.error("Error in /auth/me:", error);
      res.status(500).json({ message: "Failed to retrieve user information" });
    }
  });
  

app.get('/', (req, res) => {
  res.send('Welcome to the Backend API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
