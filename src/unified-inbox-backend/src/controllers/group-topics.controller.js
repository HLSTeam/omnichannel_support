import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET /api/group-topics
// Get all topics for a specific group
const getTopicsByGroup = async (req, res) => {
    try {
        const { groupId } = req.query;
        
        if (!groupId) {
            return res.status(400).json({
                success: false,
                error: 'groupId is required'
            });
        }
        
        const topics = await prisma.group_topics.findMany({
            where: { 
                groupId: groupId,
                isActive: true 
            },
            include: {
                System: {
                    select: {
                        id: true,
                        name: true,
                        elasticUrl: true
                    }
                },
                telegram_groups: {
                    select: {
                        id: true,
                        groupName: true,
                        groupType: true,
                        chatId: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        
        res.json({
            success: true,
            data: topics,
            count: topics.length
        });
    } catch (error) {
        console.error('Error fetching group topics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch group topics',
            details: error.message
        });
    }
};

// GET /api/group-topics/:id
// Get a specific topic by ID
const getTopicById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const topic = await prisma.group_topics.findUnique({
            where: { id },
            include: {
                System: {
                    select: {
                        id: true,
                        name: true,
                        elasticUrl: true
                    }
                },
                telegram_groups: {
                    select: {
                        id: true,
                        groupName: true,
                        groupType: true,
                        chatId: true
                    }
                }
            }
        });
        
        if (!topic) {
            return res.status(404).json({
                success: false,
                error: 'Topic not found'
            });
        }
        
        res.json({
            success: true,
            data: topic
        });
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch topic',
            details: error.message
        });
    }
};

// POST /api/group-topics
// Create a new topic for a group
const createTopic = async (req, res) => {
    try {
        const { topicName, topicId, description, systemId, groupId, isActive } = req.body;
        
        // Validation
        if (!topicName || !systemId || !groupId) {
            return res.status(400).json({
                success: false,
                error: 'topicName, systemId, and groupId are required'
            });
        }
        
        // Verify that the group exists
        const group = await prisma.telegram_groups.findUnique({
            where: { id: groupId }
        });
        
        if (!group) {
            return res.status(404).json({
                success: false,
                error: 'Telegram group not found'
            });
        }
        
        // Verify that the system exists
        const system = await prisma.system.findUnique({
            where: { id: systemId }
        });
        
        if (!system) {
            return res.status(404).json({
                success: false,
                error: 'System not found'
            });
        }
        
        // Check if topic with same name already exists for this group
        const existingTopic = await prisma.group_topics.findFirst({
            where: {
                groupId: groupId,
                topicName: topicName
            }
        });
        
        if (existingTopic) {
            return res.status(400).json({
                success: false,
                error: 'A topic with this name already exists for this group'
            });
        }
        
        const topic = await prisma.group_topics.create({
            data: {
                topicName,
                topicId,
                description,
                systemId,
                groupId,
                isActive: isActive !== undefined ? isActive : true
            },
            include: {
                System: {
                    select: {
                        id: true,
                        name: true,
                        elasticUrl: true
                    }
                },
                telegram_groups: {
                    select: {
                        id: true,
                        groupName: true,
                        groupType: true,
                        chatId: true
                    }
                }
            }
        });
        
        res.status(201).json({
            success: true,
            data: topic,
            message: 'Topic created successfully'
        });
    } catch (error) {
        if (error.code === 'P2002') {
            // Unique constraint violation
            return res.status(400).json({
                success: false,
                error: 'A topic with this name already exists for this group'
            });
        }
        
        console.error('Error creating topic:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create topic',
            details: error.message
        });
    }
};

// PUT /api/group-topics/:id
// Update a topic
const updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        // Remove id from updateData if present
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        
        // Set updatedAt to current time
        updateData.updatedAt = new Date();
        
        const topic = await prisma.group_topics.update({
            where: { id },
            data: updateData,
            include: {
                System: {
                    select: {
                        id: true,
                        name: true,
                        elasticUrl: true
                    }
                },
                telegram_groups: {
                    select: {
                        id: true,
                        groupName: true,
                        groupType: true,
                        chatId: true
                    }
                }
            }
        });
        
        res.json({
            success: true,
            data: topic,
            message: 'Topic updated successfully'
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Topic not found'
            });
        }
        
        if (error.code === 'P2002') {
            // Unique constraint violation
            return res.status(400).json({
                success: false,
                error: 'A topic with this name already exists for this group'
            });
        }
        
        console.error('Error updating topic:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update topic',
            details: error.message
        });
    }
};

// DELETE /api/group-topics/:id
// Delete a topic (soft delete by default)
const deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { hard } = req.query; // ?hard=true for hard delete
        
        if (hard === 'true') {
            // Hard delete
            await prisma.group_topics.delete({
                where: { id }
            });
            
            res.json({
                success: true,
                message: 'Topic permanently deleted'
            });
        } else {
            // Soft delete
            const topic = await prisma.group_topics.update({
                where: { id },
                data: { 
                    isActive: false,
                    updatedAt: new Date()
                }
            });
            
            res.json({
                success: true,
                data: topic,
                message: 'Topic deactivated'
            });
        }
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Topic not found'
            });
        }
        
        console.error('Error deleting topic:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete topic',
            details: error.message
        });
    }
};

// GET /api/group-topics/by-system/:systemId
// Get all topics for a specific system
const getTopicsBySystem = async (req, res) => {
    try {
        const { systemId } = req.params;
        
        const topics = await prisma.group_topics.findMany({
            where: { 
                systemId: systemId,
                isActive: true 
            },
            include: {
                System: {
                    select: {
                        id: true,
                        name: true,
                        elasticUrl: true
                    }
                },
                telegram_groups: {
                    select: {
                        id: true,
                        groupName: true,
                        groupType: true,
                        chatId: true
                    }
                }
            },
            orderBy: [
                { groupId: 'asc' },
                { createdAt: 'asc' }
            ]
        });
        
        res.json({
            success: true,
            data: topics,
            count: topics.length
        });
    } catch (error) {
        console.error('Error fetching topics by system:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch topics by system',
            details: error.message
        });
    }
};

export {
    getTopicsByGroup,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic,
    getTopicsBySystem
};

