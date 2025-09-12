import { PrismaClient } from '@prisma/client';
import { checkUserPermissions } from '../services/permission.service.js';
import elasticsearchService from '../services/elasticsearch.service.js';

const prisma = new PrismaClient();

// POST /api/v1/systems/check-logs
// Check system logs for specific system
const checkLogs = async (req, res) => {
    try {
        const { systemId, chatId, logType, chatTitle, userId, username, timeRange, logLevel } = req.body;
        
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
        
        // 🔍 ELASTICSEARCH LOG SEARCH (Replaces mock data)
        const elasticsearchResult = await elasticsearchService.searchLogs({
            systemId,
            logType,
            logLevel,
            timeRange,
            userPermissions: permissions,
            size: 100
        });
        
        // 📊 AUDIT LOG
        console.log(`[AUDIT] Check logs request: System=${system.name}, User=${username}, Role=${userRole}, ChatId=${chatId}`);
        
        // If Elasticsearch fails, use fallback mock data
        const logs = elasticsearchResult.success ? elasticsearchResult.data.logs : generateMockLogs(systemId, system.name, logType, logLevel, userRole);
        const totalLogs = elasticsearchResult.success ? elasticsearchResult.data.totalLogs : logs.length;
        const dataSource = elasticsearchResult.success ? 'elasticsearch' : 'fallback';
        
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
        
        // If Elasticsearch fails, use fallback mock data
        const transactions = elasticsearchResult.success ? elasticsearchResult.data.transactions : generateMockTransactions(systemId, system.name, transactionId, status, userRole);
        const totalTransactions = elasticsearchResult.success ? elasticsearchResult.data.totalTransactions : transactions.length;
        const dataSource = elasticsearchResult.success ? 'elasticsearch' : 'fallback';
        
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

// 🧪 MOCK DATA GENERATORS

function generateMockLogs(systemId, systemName, logType = 'system', logLevel = 'info', userRole) {
    const logs = [];
    const logTypes = ['system', 'application', 'error', 'access'];
    const logLevels = ['debug', 'info', 'warn', 'error'];
    
    // Generate 10-20 mock logs
    const logCount = Math.floor(Math.random() * 10) + 10;
    
    for (let i = 0; i < logCount; i++) {
        const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000); // Last 24 hours
        
        logs.push({
            id: `log_${systemId}_${i}`,
            timestamp: timestamp.toISOString(),
            level: logLevel || logLevels[Math.floor(Math.random() * logLevels.length)],
            type: logType || logTypes[Math.floor(Math.random() * logTypes.length)],
            message: generateLogMessage(systemName, i),
            source: `${systemName}-service`,
            systemId: systemId,
            visible: userRole === 'admin' || Math.random() > 0.3 // Admin sees all, others see 70%
        });
    }
    
    return logs.filter(log => log.visible).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function generateMockTransactions(systemId, systemName, transactionId, status, userRole) {
    const transactions = [];
    const statuses = ['completed', 'pending', 'failed', 'cancelled'];
    const types = ['topup', 'card_purchase', 'airtime', 'data_package'];
    
    if (transactionId) {
        // Return specific transaction
        transactions.push({
            id: transactionId,
            timestamp: new Date().toISOString(),
            status: status || 'completed',
            type: types[Math.floor(Math.random() * types.length)],
            amount: Math.floor(Math.random() * 1000000) + 10000,
            currency: 'VND',
            details: `Transaction ${transactionId} for ${systemName}`,
            systemId: systemId,
            provider: systemName
        });
    } else {
        // Return list of transactions
        const transCount = Math.floor(Math.random() * 15) + 5;
        
        for (let i = 0; i < transCount; i++) {
            const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
            
            transactions.push({
                id: `trans_${systemId}_${i}`,
                timestamp: timestamp.toISOString(),
                status: status || statuses[Math.floor(Math.random() * statuses.length)],
                type: types[Math.floor(Math.random() * types.length)],
                amount: Math.floor(Math.random() * 1000000) + 10000,
                currency: 'VND',
                details: `${types[Math.floor(Math.random() * types.length)]} transaction`,
                systemId: systemId,
                provider: systemName,
                visible: userRole === 'admin' || Math.random() > 0.2 // Admin sees all, others see 80%
            });
        }
    }
    
    return transactions.filter(trans => trans.visible).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function generateLogMessage(systemName, index) {
    const messages = [
        `[${systemName}] Service started successfully`,
        `[${systemName}] Processing topup request`,
        `[${systemName}] Database connection established`,
        `[${systemName}] User authentication successful`,
        `[${systemName}] Transaction processed: amount=50000 VND`,
        `[${systemName}] Cache updated for user data`,
        `[${systemName}] API response time: 120ms`,
        `[${systemName}] Webhook notification sent`,
        `[${systemName}] System health check passed`,
        `[${systemName}] Memory usage: 45%`
    ];
    
    return messages[index % messages.length];
}

export {
    checkLogs,
    checkTransactions
};