const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);

const jwt = require("jsonwebtoken");

app.post("/api/auth/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.status === "blocked") {
      return res.status(403).json({ message: "User is blocked" });
    }

    return res.status(200).json({ message: "Authorized" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});


app.get('/', (req, res) => {
    res.send('Welcome to the Backend API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
