import express from 'express';
import {
    getTopicsByGroup,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic,
    getTopicsBySystem
} from '../controllers/group-topics.controller.js';

const router = express.Router();

// GET /api/group-topics - Get topics by group ID (query param: groupId)
router.get('/', getTopicsByGroup);

// GET /api/group-topics/by-system/:systemId - Get topics by system ID
router.get('/by-system/:systemId', getTopicsBySystem);

// GET /api/group-topics/:id - Get topic by ID
router.get('/:id', getTopicById);

// POST /api/group-topics - Create new topic
router.post('/', createTopic);

// PUT /api/group-topics/:id - Update topic
router.put('/:id', updateTopic);

// DELETE /api/group-topics/:id - Delete topic (soft delete by default, ?hard=true for hard delete)
router.delete('/:id', deleteTopic);

export default router;

