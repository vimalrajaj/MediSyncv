import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes from server directory
import fhirRoutes from '../server/src/routes/fhir.js';
import terminologyRoutes from '../server/src/routes/terminology.js';
import translationRoutes from '../server/src/routes/translation.js';
import adminRoutes from '../server/src/routes/admin.js';
import authRoutes from '../server/src/routes/auth.js';
import patientsRoutes from '../server/src/routes/patients.js';
import diagnosisRoutes from '../server/src/routes/diagnosis.js';
import apiClientsRoutes from '../server/src/routes/apiClients.js';
import fhirRoutesV1 from '../server/src/routes/fhirRoutes.js';
import fhirTerminologyRoutes from '../server/src/routes/fhirTerminology.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true, // Allow all origins for Vercel deployment
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'MediSync AYUSH Terminology Service',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/v1/fhir', fhirRoutes);
app.use('/api/v1/terminology', terminologyRoutes);
app.use('/api/v1/translation', translationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientsRoutes);
app.use('/api/v1/diagnosis', diagnosisRoutes);
app.use('/api/v1/api-clients', apiClientsRoutes);
app.use('/api/v2/fhir', fhirRoutesV1);
app.use('/api/v1/fhir-terminology', fhirTerminologyRoutes);

// FHIR R4 endpoints
app.use('/fhir', fhirRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl 
  });
});

export default app;