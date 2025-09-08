import express from 'express';
import { checkLogs, checkTransactions } from '../controllers/systems.controller.js';

const router = express.Router();

/**
 * @route POST /api/v1/systems/check-logs
 * @desc Check system logs for specific system (System-aware)
 * @access Private (requires systemId for isolation)
 * @body {
 *   systemId: string (required),
 *   chatId: string (required),
 *   logType?: string (system|application|error|access),
 *   logLevel?: string (debug|info|warn|error),
 *   timeRange?: string (last_1_hour|last_24_hours|last_7_days),
 *   chatTitle?: string,
 *   username?: string
 * }
 */
router.post('/check-logs', checkLogs);

/**
 * @route POST /api/v1/systems/check-trans
 * @desc Check transaction status for specific system (System-aware)
 * @access Private (requires systemId for isolation)
 * @body {
 *   systemId: string (required),
 *   chatId: string (required),
 *   transactionId?: string (specific transaction),
 *   status?: string (completed|pending|failed|cancelled),
 *   timeRange?: string (last_1_hour|last_24_hours|last_7_days),
 *   chatTitle?: string,
 *   username?: string
 * }
 */
router.post('/check-trans', checkTransactions);

export default router;
