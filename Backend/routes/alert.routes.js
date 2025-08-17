import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  resolveAlert,
  snoozeAlert,
  deleteAlert,
  getAlertStats,
  acknowledgeAllAlerts
} from '../controllers/alertController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Alert CRUD operations
router.post('/', createAlert);
router.get('/', getAlerts);
router.get('/stats', getAlertStats);
router.get('/:alertId', getAlertById);
router.put('/:alertId', updateAlert);
router.delete('/:alertId', deleteAlert);

// Alert actions
router.post('/:alertId/resolve', resolveAlert);
router.post('/:alertId/snooze', snoozeAlert);
router.post('/acknowledge-all', acknowledgeAllAlerts);

export default router;
