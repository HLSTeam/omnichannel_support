import express from 'express';
import { checkLogs, checkTransactions, executeCustomQuery } from '../controllers/systems.controller.js';

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

/**
 * @route POST /api/v1/systems/custom-query
 * @desc Execute custom Elasticsearch query for transactions (System-aware)
 * @access Private (requires systemId for isolation)
 * @body {
 *   systemId: string (required),
 *   chatId: string (required),
 *   queryData: object (required) - Full Elasticsearch query object,
 *   chatTitle?: string,
 *   username?: string,
 *   userId?: string
 * }
 */
router.post('/custom-query', executeCustomQuery);

export default router;
