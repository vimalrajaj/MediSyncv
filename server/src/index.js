import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

// Import routes
import fhirRoutes from './routes/fhir.js';
import terminologyRoutes from './routes/terminology.js';
import translationRoutes from './routes/translation.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import patientsRoutes from './routes/patients.js';
import diagnosisRoutes from './routes/diagnosis.js';
import apiClientsRoutes from './routes/apiClients.js';

// Import enhanced FHIR routes
import fhirRoutesV1 from './routes/fhirRoutes.js';

// Import FHIR R4 Terminology routes with ABHA authentication
import fhirTerminologyRoutes from './routes/fhirTerminology.js';

// Import services
import { syncWhoIcdData } from './services/whoIcdService.js';
import { csvMappingService } from './services/csvMappingService.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:4028', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Body parsing
app.use(express.json({ limit: '10mb', type: ['application/json', 'application/fhir+json'] }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/fhir', fhirRoutes);
app.use('/api/v1/terminology', terminologyRoutes);
app.use('/api/v1/translation', translationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientsRoutes);
app.use('/api/v1/diagnosis-sessions', diagnosisRoutes);
app.use('/api/v1/api-clients', apiClientsRoutes);
app.use('/api/v1/fhir', fhirRoutesV1);

// FHIR R4 Terminology Service with ABHA authentication
app.use('/fhir', fhirTerminologyRoutes);

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'AYUSH Terminology Service API',
    version: '1.0.0',
    fhirVersion: '4.0.1',
    endpoints: {
      health: '/health',
      fhir: {
        codesystem: '/fhir/CodeSystem',
        conceptmap: '/fhir/ConceptMap',
        valueset: '/fhir/ValueSet',
        operations: {
          lookup: '/fhir/CodeSystem/$lookup',
          translate: '/fhir/ConceptMap/$translate',
          expand: '/fhir/ValueSet/$expand'
        }
      },
      terminology: {
        search: '/api/v1/terminology/search',
        mappings: '/api/v1/terminology/mappings',
        validate: '/api/v1/terminology/validate',
        upload: '/api/v1/terminology/upload'
      },
      auth: {
        login: '/api/v1/auth/login',
        verify: '/api/v1/auth/verify-abha'
      }
    },
    documentation: 'https://docs.ayush.gov.in/terminology-api'
  });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Schedule WHO ICD-11 sync (daily at 2 AM)
cron.schedule('0 2 * * *', () => {
  logger.info('Starting scheduled WHO ICD-11 sync...');
  syncWhoIcdData().catch(err => {
    logger.error('Scheduled WHO ICD-11 sync failed:', err);
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`AYUSH Terminology Service listening on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`FHIR Base URL: ${process.env.FHIR_BASE_URL}`);
  
  // Initialize CSV mapping service on startup
  csvMappingService.loadMappings().catch(err => {
    logger.error('Failed to load CSV mappings on startup:', err);
  });
  
  // Initial WHO ICD-11 sync on startup
  if (process.env.NODE_ENV !== 'test') {
    setTimeout(() => {
      syncWhoIcdData().catch(err => {
        logger.error('Initial WHO ICD-11 sync failed:', err);
      });
    }, 5000);
  }
});

export default app;