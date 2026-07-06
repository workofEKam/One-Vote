import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'Connected to Backend!', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});