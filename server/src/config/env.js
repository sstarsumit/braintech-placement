import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const rawPort = process.env.PORT || 5000;

export const PORT = Number.isFinite(+rawPort) && +rawPort > 0 ? +rawPort : 5000;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/braintech';
export const JWT_SECRET = process.env.JWT_SECRET || 'braintech_dev_secret_change_in_production';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

export default { PORT, MONGO_URI, JWT_SECRET, CLIENT_URL, GOOGLE_CLIENT_ID };
