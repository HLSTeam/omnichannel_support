import { PrismaClient } from '@prisma/client';
import { checkUserPermissions } from '../services/permission.service.js';
import elasticsearchService from '../services/elasticsearch.service.js';

const prisma = new PrismaClient();

// POST /api/v1/systems/check-logs
// Check system logs for specific system
const checkLogs = async (req, res) => {
    try {
        const { systemId, chatId, logType, chatTitle, userId, username, timeRange, logLevel, searchQuery } = req.body;
        
        // 🔒 VALIDATE REQUIRED FIELDS
        if (!systemId) {
            return res.status(400).json({
                success: false,
                error: 'systemId is required for multi-system isolation'
            });
        }
        
        if (!chatId) {
            return res.status(400).json({
                success: false,
                error: 'chatId is required'
            });
        }
        
        // 🔒 VALIDATE SYSTEM EXISTS
        const system = await prisma.system.findUnique({
            where: { id: systemId }
        });
        
        if (!system) {
            return res.status(400).json({
                success: false,
                error: 'Invalid systemId - system not found'
            });
        }
        
        // 🔒 CHECK USER PERMISSIONS USING PERMISSION SERVICE
        const permissionResult = await checkUserPermissions(
            systemId, 
            chatId,
            userId,
            username,
            'system_logs', 
        );
        
        if (!permissionResult.success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to check permissions',
                details: permissionResult.error
            });
        }
        
        const { hasPermission, userRole, permissions, groupInfo, autoDetected } = permissionResult.data;
        
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions to access logs',
                userRole: userRole,
                permissions: permissions,
                systemId: systemId,
                groupInfo: groupInfo
            });
        }
        
        // 🔍 ELASTICSEARCH LOG SEARCH
        const elasticsearchResult = await elasticsearchService.searchLogs({
            systemId,
            logType,
            logLevel,
            timeRange,
            searchQuery,
            userPermissions: permissions,
            size: 100
        });
        
        // 📊 AUDIT LOG
        console.log(`[AUDIT] Check logs request: System=${system.name}, User=${username}, Role=${userRole}, ChatId=${chatId}`);
        
        // Return logs from Elasticsearch or empty array if no data
        const logs = elasticsearchResult.success ? elasticsearchResult.data.logs : [];
        const totalLogs = elasticsearchResult.success ? elasticsearchResult.data.totalLogs : 0;
        const dataSource = elasticsearchResult.success ? 'elasticsearch' : 'no_data';
        
        res.json({
            success: true,
            data: {
                systemId: systemId,
                systemName: system.name,
                logType: logType || 'system',
                logLevel: logLevel || 'info',
                timeRange: timeRange || 'last_1_hour',
                userRole: userRole,
                permissions: permissions,
                groupInfo: groupInfo,
                logs: logs,
                totalLogs: totalLogs,
                dataSource: dataSource,
                elasticsearchHealth: await elasticsearchService.isHealthy(),
                indexPattern: elasticsearchResult.data?.indexPattern,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error checking logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check logs',
            details: error.message
        });
    }
};

// POST /api/v1/systems/check-trans
// Check transaction status for specific system
const checkTransactions = async (req, res) => {
    try {
        const { systemId, chatId, transactionId, chatTitle, username, timeRange, status } = req.body;
        
        // 🔒 VALIDATE REQUIRED FIELDS
        if (!systemId) {
            return res.status(400).json({
                success: false,
                error: 'systemId is required for multi-system isolation'
            });
        }
        
        if (!chatId) {
            return res.status(400).json({
                success: false,
                error: 'chatId is required'
            });
        }
        
        // 🔒 VALIDATE SYSTEM EXISTS
        const system = await prisma.system.findUnique({
            where: { id: systemId }
        });
        
        if (!system) {
            return res.status(400).json({
                success: false,
                error: 'Invalid systemId - system not found'
            });
        }
        
        // 🔒 CHECK USER PERMISSIONS USING PERMISSION SERVICE
        const permissionResult = await checkUserPermissions(
            systemId, 
            chatId, 
            'check_transactions', 
            chatTitle, 
            username
        );
        
        if (!permissionResult.success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to check permissions',
                details: permissionResult.error
            });
        }
        
        const { hasPermission, userRole, permissions, groupInfo, autoDetected } = permissionResult.data;
        
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions to access transaction data',
                userRole: userRole,
                permissions: permissions,
                systemId: systemId,
                groupInfo: groupInfo
            });
        }
        
        // 🔍 ELASTICSEARCH TRANSACTION SEARCH (Replaces mock data)
        const elasticsearchResult = await elasticsearchService.searchTransactions({
            systemId,
            transactionId,
            status,
            timeRange,
            userPermissions: permissions,
            size: 100
        });
        
        // 📊 AUDIT LOG
        console.log(`[AUDIT] Check trans request: System=${system.name}, User=${username}, Role=${userRole}, TransactionId=${transactionId}, ChatId=${chatId}`);
        
        // Return transactions from Elasticsearch or empty array if no data
        const transactions = elasticsearchResult.success ? elasticsearchResult.data.transactions : [];
        const totalTransactions = elasticsearchResult.success ? elasticsearchResult.data.totalTransactions : 0;
        const dataSource = elasticsearchResult.success ? 'elasticsearch' : 'no_data';
        
        res.json({
            success: true,
            data: {
                systemId: systemId,
                systemName: system.name,
                transactionId: transactionId,
                searchCriteria: {
                    timeRange: timeRange || 'last_24_hours',
                    status: status
                },
                userRole: userRole,
                permissions: permissions,
                groupInfo: groupInfo,
                transactions: transactions,
                totalTransactions: totalTransactions,
                dataSource: dataSource,
                elasticsearchHealth: await elasticsearchService.isHealthy(),
                indexPattern: elasticsearchResult.data?.indexPattern,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Error checking transactions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check transactions',
            details: error.message
        });
    }
};


export {
    checkLogs,
    checkTransactions
};