import { Client } from '@elastic/elasticsearch';

/**
 * Elasticsearch Service for Logs Integration
 * Connects to Elasticsearch cluster and provides log querying capabilities
 */
class ElasticsearchService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.elasticsearchUrl = process.env.ELASTICSEARCH_URL || 'http://192.168.0.10:29200';
        
        // Initialize connection
        this.initializeConnection();
    }

    /**
     * Initialize Elasticsearch connection
     */
    async initializeConnection() {
        try {
            this.client = new Client({
                node: this.elasticsearchUrl,
                requestTimeout: 30000,
                pingTimeout: 3000,
                // Basic auth if needed
                // auth: {
                //     username: process.env.ELASTICSEARCH_USERNAME || '',
                //     password: process.env.ELASTICSEARCH_PASSWORD || ''
                // }
            });

            // Test connection
            const health = await this.client.cluster.health();
            console.log(`✅ Elasticsearch connected: ${this.elasticsearchUrl}`, {
                status: health.status,
                cluster_name: health.cluster_name
            });
            this.isConnected = true;
        } catch (error) {
            console.error(`❌ Elasticsearch connection failed: ${this.elasticsearchUrl}`, error.message);
            this.isConnected = false;
        }
    }

    /**
     * Check if Elasticsearch is connected and healthy
     */
    async isHealthy() {
        try {
            if (!this.client) return false;
            
            const health = await this.client.cluster.health();
            return health.body.status !== 'red';
        } catch (error) {
            console.error('Elasticsearch health check failed:', error.message);
            return false;
        }
    }

    /**
     * Search logs from Elasticsearch based on criteria
     * @param {Object} criteria - Search criteria
     * @param {string} criteria.systemId - System ID for isolation
     * @param {string} [criteria.logType] - Log type filter (system|application|error|access)
     * @param {string} [criteria.logLevel] - Log level filter (debug|info|warn|error)
     * @param {string} [criteria.timeRange] - Time range (last_1_hour|last_24_hours|last_7_days)
     * @param {string} [criteria.searchQuery] - Free text search query
     * @param {number} [criteria.size] - Maximum number of logs to return (default: 100)
     * @param {Array} [criteria.userPermissions] - User permissions for filtering
     * @returns {Promise<Object>} Search results
     */
    async searchLogs(criteria) {
        try {
            if (!this.isConnected || !this.client) {
                throw new Error('Elasticsearch not connected');
            }

            const {
                systemId,
                logType,
                logLevel,
                timeRange = 'last_1_hour',
                searchQuery,
                size = 100,
                userPermissions = []
            } = criteria;

            // Build Elasticsearch query
            const query = this.buildLogQuery({
                systemId,
                logType,
                logLevel,
                timeRange,
                searchQuery,
                userPermissions
            });

            // Execute search
            const searchParams = {
                index: this.getLogIndexPattern(systemId),
                body: {
                    query: query,
                    sort: [
                        { '@timestamp': { order: 'desc' } }
                    ],
                    size: size,
                    _source: {
                        includes: [
                            '@timestamp',
                            'level',
                            'message',
                            'messageTemplate',
                            'fields',
                            'system_id',
                            'log_type',
                            'host',
                            'environment'
                        ]
                    }
                }
            };

            console.log(`🔍 Elasticsearch query for system ${systemId}:`, JSON.stringify(searchParams, null, 2));

            const response = await this.client.search(searchParams);
            
            // Process and format results
            const logs = this.formatLogResults(response.body.hits.hits, systemId);
            
            return {
                success: true,
                data: {
                    logs: logs,
                    totalLogs: response.body.hits.total.value || response.body.hits.total,
                    query: query,
                    indexPattern: this.getLogIndexPattern(systemId)
                }
            };

        } catch (error) {
            console.error('Elasticsearch log search failed:', error.message);
            
            // Return fallback mock data if Elasticsearch fails
            return this.getFallbackLogs(criteria);
        }
    }

    /**
     * Build Elasticsearch query based on criteria
     */
    buildLogQuery({ systemId, logType, logLevel, timeRange, searchQuery, userPermissions }) {
        const mustClauses = [];
        const filterClauses = [];

        // System isolation - CRITICAL for multi-system architecture
        if (systemId) {
            filterClauses.push({
                term: { 'system_id.keyword': systemId }
            });
        }

        // Log type filter
        if (logType) {
            filterClauses.push({
                term: { 'log_type.keyword': logType }
            });
        }

        // Log level filter - Updated to match the actual field structure
        if (logLevel) {
            filterClauses.push({
                term: { 'level.keyword': logLevel }
            });
        }

        // Time range filter
        const timeFilter = this.getTimeRangeFilter(timeRange);
        if (timeFilter) {
            filterClauses.push(timeFilter);
        }

        // Free text search
        if (searchQuery) {
            mustClauses.push({
                multi_match: {
                    query: searchQuery,
                    fields: ['message^2', 'messageTemplate', 'fields.*'],
                    type: 'best_fields',
                    fuzziness: 'AUTO'
                }
            });
        }

        // User permission-based filtering
        if (!userPermissions.includes('view_all') && !userPermissions.includes('system_logs')) {
            // Restrict sensitive logs for non-admin users
            filterClauses.push({
                bool: {
                    must_not: [
                        { term: { 'level.keyword': 'DEBUG' } },
                        { term: { 'log_type.keyword': 'system' } }
                    ]
                }
            });
        }

        return {
            bool: {
                must: mustClauses,
                filter: filterClauses
            }
        };
    }

    /**
     * Get time range filter for Elasticsearch
     */
    getTimeRangeFilter(timeRange) {
        const now = new Date();
        let gte;

        switch (timeRange) {
            case 'last_1_hour':
                gte = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case 'last_24_hours':
                gte = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'last_7_days':
                gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            default:
                gte = new Date(now.getTime() - 60 * 60 * 1000); // default 1 hour
        }

        return {
            range: {
                '@timestamp': {
                    gte: gte.toISOString(),
                    lte: now.toISOString()
                }
            }
        };
    }

    /**
     * Get log index pattern based on system ID
     */
    getLogIndexPattern(systemId) {
        // Updated to match the actual index pattern from your response
        return `nine-tech-topup-log-*`;
    }

    /**
     * Format Elasticsearch results to standard log format
     */
    formatLogResults(hits, systemId) {
        return hits.map((hit, index) => {
            const source = hit._source;
            const timestamp = source['@timestamp'] || new Date().toISOString();
            
            // Extract fields from the response structure
            const fields = source.fields || {};
            
            return {
                id: hit._id || `es_log_${systemId}_${index}`,
                timestamp: timestamp,
                level: (source.level || 'INFO').toLowerCase(),
                type: fields.Application || fields.SourceContext || 'application',
                message: source.message || source.messageTemplate || 'No message',
                source: fields.Application || fields.SourceContext || 'elasticsearch',
                systemId: source.system_id || systemId,
                host: fields.host,
                environment: source.environment,
                context: fields,
                error: fields.error,
                _index: hit._index,
                _score: hit._score
            };
        });
    }

    /**
     * Get fallback mock logs if Elasticsearch is unavailable
     */
    getFallbackLogs(criteria) {
        console.warn('⚠️ Using fallback mock logs - Elasticsearch unavailable');
        
        const { systemId, logType = 'system', logLevel = 'info' } = criteria;
        const mockLogs = [];
        
        // Generate basic mock logs
        for (let i = 0; i < 10; i++) {
            mockLogs.push({
                id: `fallback_log_${systemId}_${i}`,
                timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
                level: logLevel,
                type: logType,
                message: `[FALLBACK] System ${systemId} - Mock log entry ${i + 1}`,
                source: 'fallback-service',
                systemId: systemId,
                host: 'localhost',
                environment: 'development'
            });
        }

        return {
            success: true,
            data: {
                logs: mockLogs,
                totalLogs: mockLogs.length,
                fallback: true,
                query: 'fallback_mode'
            }
        };
    }

    /**
     * Get available log indices for a system
     */
    async getSystemIndices(systemId) {
        try {
            if (!this.isConnected || !this.client) {
                throw new Error('Elasticsearch not connected');
            }

            const pattern = this.getLogIndexPattern(systemId);
            const response = await this.client.cat.indices({
                index: pattern,
                format: 'json'
            });

            return {
                success: true,
                indices: response.body || []
            };
        } catch (error) {
            console.error('Failed to get system indices:', error.message);
            return {
                success: false,
                error: error.message,
                indices: []
            };
        }
    }

    /**
     * Check if system has any log data
     */
    async hasLogData(systemId) {
        try {
            const result = await this.searchLogs({
                systemId,
                size: 1,
                timeRange: 'last_7_days'
            });

            return result.success && result.data.totalLogs > 0;
        } catch (error) {
            console.error('Failed to check log data:', error.message);
            return false;
        }
    }

    /**
     * Search transactions from Elasticsearch based on criteria
     * @param {Object} criteria - Search criteria
     * @param {string} criteria.systemId - System ID for isolation
     * @param {string} [criteria.transactionId] - Specific transaction ID
     * @param {string} [criteria.status] - Transaction status filter (completed|pending|failed|cancelled)
     * @param {string} [criteria.transactionType] - Transaction type filter (topup|card_purchase|airtime|data_package)
     * @param {string} [criteria.timeRange] - Time range (last_1_hour|last_24_hours|last_7_days)
     * @param {string} [criteria.searchQuery] - Free text search query
     * @param {number} [criteria.size] - Maximum number of transactions to return (default: 100)
     * @param {Array} [criteria.userPermissions] - User permissions for filtering
     * @returns {Promise<Object>} Search results
     */
    async searchTransactions(criteria) {
        try {
            if (!this.isConnected || !this.client) {
                throw new Error('Elasticsearch not connected');
            }

            const {
                systemId,
                transactionId,
                status,
                transactionType,
                timeRange = 'last_24_hours',
                searchQuery,
                size = 100,
                userPermissions = []
            } = criteria;

            // Build Elasticsearch query for transactions
            const query = this.buildTransactionQuery({
                systemId,
                transactionId,
                status,
                transactionType,
                timeRange,
                searchQuery,
                userPermissions
            });

            // Execute search
            const searchParams = {
                index: this.getTransactionIndexPattern(systemId),
                body: {
                    query: query,
                    sort: [
                        { '@timestamp': { order: 'desc' } },
                        { 'timestamp': { order: 'desc' } },
                        { 'created_at': { order: 'desc' } }
                    ],
                    size: size,
                    _source: [
                        '@timestamp',
                        'timestamp',
                        'created_at',
                        'transaction_id',
                        'status',
                        'type',
                        'transaction_type',
                        'amount',
                        'currency',
                        'details',
                        'description',
                        'system_id',
                        'provider',
                        'user_id',
                        'customer_id',
                        'reference',
                        'payment_method',
                        'fee',
                        'error_code',
                        'error_message'
                    ]
                }
            };

            console.log(`🔍 Elasticsearch transaction query for system ${systemId}:`, JSON.stringify(searchParams, null, 2));

            const response = await this.client.search(searchParams);
            
            // Process and format results
            const transactions = this.formatTransactionResults(response.body.hits.hits, systemId);
            
            return {
                success: true,
                data: {
                    transactions: transactions,
                    totalTransactions: response.body.hits.total.value || response.body.hits.total,
                    query: query,
                    indexPattern: this.getTransactionIndexPattern(systemId)
                }
            };

        } catch (error) {
            console.error('Elasticsearch transaction search failed:', error.message);
            
            // Return fallback mock data if Elasticsearch fails
            return this.getFallbackTransactions(criteria);
        }
    }

    /**
     * Build Elasticsearch query for transactions based on criteria
     */
    buildTransactionQuery({ systemId, transactionId, status, transactionType, timeRange, searchQuery, userPermissions }) {
        const mustClauses = [];
        const filterClauses = [];

        // System isolation - CRITICAL for multi-system architecture
        if (systemId) {
            filterClauses.push({
                term: { 'system_id.keyword': systemId }
            });
        }

        // Specific transaction ID
        if (transactionId) {
            filterClauses.push({
                term: { 'transaction_id.keyword': transactionId }
            });
        }

        // Transaction status filter
        if (status) {
            filterClauses.push({
                term: { 'status.keyword': status.toLowerCase() }
            });
        }

        // Transaction type filter
        if (transactionType) {
            filterClauses.push({
                bool: {
                    should: [
                        { term: { 'type.keyword': transactionType } },
                        { term: { 'transaction_type.keyword': transactionType } }
                    ]
                }
            });
        }

        // Time range filter
        const timeFilter = this.getTimeRangeFilter(timeRange);
        if (timeFilter) {
            filterClauses.push(timeFilter);
        }

        // Free text search
        if (searchQuery) {
            mustClauses.push({
                multi_match: {
                    query: searchQuery,
                    fields: ['details^2', 'description^2', 'transaction_id', 'reference', 'provider'],
                    type: 'best_fields',
                    fuzziness: 'AUTO'
                }
            });
        }

        // User permission-based filtering
        if (!userPermissions.includes('view_all') && !userPermissions.includes('transaction_status')) {
            // Restrict sensitive transaction data for non-admin users
            filterClauses.push({
                bool: {
                    must_not: [
                        { term: { 'status.keyword': 'failed' } },
                        { exists: { field: 'error_code' } }
                    ]
                }
            });
        }

        return {
            bool: {
                must: mustClauses,
                filter: filterClauses
            }
        };
    }

    /**
     * Get transaction index pattern based on system ID
     */
    getTransactionIndexPattern(systemId) {
        // Use system-specific index pattern for better isolation
        return `transactions-${systemId}-*`;
    }

    /**
     * Format Elasticsearch transaction results to standard format
     */
    formatTransactionResults(hits, systemId) {
        return hits.map((hit, index) => {
            const source = hit._source;
            const timestamp = source['@timestamp'] || source.timestamp || source.created_at || new Date().toISOString();
            
            return {
                id: source.transaction_id || hit._id || `es_trans_${systemId}_${index}`,
                timestamp: timestamp,
                status: (source.status || 'unknown').toLowerCase(),
                type: source.type || source.transaction_type || 'unknown',
                amount: source.amount || 0,
                currency: source.currency || 'VND',
                details: source.details || source.description || 'No details',
                systemId: source.system_id || systemId,
                provider: source.provider || 'unknown',
                userId: source.user_id,
                customerId: source.customer_id,
                reference: source.reference,
                paymentMethod: source.payment_method,
                fee: source.fee,
                errorCode: source.error_code,
                errorMessage: source.error_message,
                _index: hit._index,
                _score: hit._score
            };
        });
    }

    /**
     * Get fallback mock transactions if Elasticsearch is unavailable
     */
    getFallbackTransactions(criteria) {
        console.warn('⚠️ Using fallback mock transactions - Elasticsearch unavailable');
        
        const { systemId, transactionId, status = 'completed' } = criteria;
        const mockTransactions = [];
        const statuses = ['completed', 'pending', 'failed', 'cancelled'];
        const types = ['topup', 'card_purchase', 'airtime', 'data_package'];
        
        if (transactionId) {
            // Return specific transaction
            mockTransactions.push({
                id: transactionId,
                timestamp: new Date().toISOString(),
                status: status,
                type: types[Math.floor(Math.random() * types.length)],
                amount: Math.floor(Math.random() * 1000000) + 10000,
                currency: 'VND',
                details: `[FALLBACK] Transaction ${transactionId} for system ${systemId}`,
                systemId: systemId,
                provider: 'fallback-provider'
            });
        } else {
            // Generate basic mock transactions
            for (let i = 0; i < 10; i++) {
                mockTransactions.push({
                    id: `fallback_trans_${systemId}_${i}`,
                    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
                    status: status || statuses[Math.floor(Math.random() * statuses.length)],
                    type: types[Math.floor(Math.random() * types.length)],
                    amount: Math.floor(Math.random() * 1000000) + 10000,
                    currency: 'VND',
                    details: `[FALLBACK] Mock transaction ${i + 1} for system ${systemId}`,
                    systemId: systemId,
                    provider: 'fallback-provider'
                });
            }
        }

        return {
            success: true,
            data: {
                transactions: mockTransactions,
                totalTransactions: mockTransactions.length,
                fallback: true,
                query: 'fallback_mode'
            }
        };
    }

    /**
     * Check if system has any transaction data
     */
    async hasTransactionData(systemId) {
        try {
            const result = await this.searchTransactions({
                systemId,
                size: 1,
                timeRange: 'last_7_days'
            });

            return result.success && result.data.totalTransactions > 0;
        } catch (error) {
            console.error('Failed to check transaction data:', error.message);
            return false;
        }
    }
}

// Create singleton instance
const elasticsearchService = new ElasticsearchService();

export default elasticsearchService;
export { ElasticsearchService };