import axios from 'axios';

/**
 * Elasticsearch Service for Logs Integration
 * Connects to Elasticsearch cluster and provides log querying capabilities using Axios
 */
class ElasticsearchService {
    constructor() {
        this.isConnected = false;
        this.elasticsearchUrl = process.env.ELASTICSEARCH_URL || 'http://192.168.0.10:29200';
        this.searchUrl = `${this.elasticsearchUrl}/_search`;
        this.healthUrl = `${this.elasticsearchUrl}/_cluster/health`;
        this.indicesUrl = `${this.elasticsearchUrl}/_cat/indices`;
        
        // Initialize connection
        this.initializeConnection();
    }

    /**
     * Initialize Elasticsearch connection using Axios
     */
    async initializeConnection() {
        try {
            // Test connection with cluster health endpoint
            const response = await axios.get(this.healthUrl, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`✅ Elasticsearch connected: ${this.elasticsearchUrl}`, {
                status: response.data.status,
                cluster_name: response.data.cluster_name
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
            const response = await axios.get(this.healthUrl, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data.status !== 'red';
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
     * @param {string} [criteria.timeRange] - Time range (last_1_hour|last_24_hours|last_7_days) or ISO date string
     * @param {string} [criteria.searchQuery] - Free text search query
     * @param {number} [criteria.size] - Maximum number of logs to return (default: 50)
     * @param {Array} [criteria.userPermissions] - User permissions for filtering
     * @param {boolean} [criteria.trackTotalHits] - Whether to track total hits accurately (default: true)
     * @param {Object} [criteria.customFilter] - Custom Elasticsearch filter body to apply
     * @returns {Promise<Object>} Search results
     */
    async searchLogs(criteria) {
        try {
            if (!this.isConnected) {
                throw new Error('Elasticsearch not connected');
            }

            const {
                systemId,
                logType,
                logLevel,
                timeRange = 'last_1_hour',
                searchQuery,
                size = 50,
                userPermissions = [],
                trackTotalHits = true,
                customFilter
            } = criteria;

            // Use custom filter if provided, otherwise build standard query
            let searchBody;
            let query;
            if (customFilter) {
                searchBody = this.applyCustomFilter(customFilter, {
                    searchQuery,
                    timeRange,
                    systemId,
                    userPermissions
                });
                query = searchBody.query;
            } else {
                // Build standard Elasticsearch query
                query = this.buildLogQuery({
                    systemId,
                    logType,
                    logLevel,
                    timeRange,
                    searchQuery,
                    userPermissions
                });

                searchBody = {
                    query: query,
                    sort: [
                        { '@timestamp': { order: 'desc' } }
                    ],
                    size: size,
                    track_total_hits: trackTotalHits,
                    _source: {
                        includes: [
                            '@timestamp',
                            'level',
                            'message',
                            'messageTemplate',
                            'fields',
                            'system_id',
                            //'log_type',
                            //'host',
                            //'environment',
                        ]
                    }
                };
            }

            console.log(`🔍 Elasticsearch query for system ${systemId}:`, JSON.stringify(searchBody, null, 2));

            // Execute search using axios
            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: this.searchUrl,
                headers: { 
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(searchBody),
                timeout: 30000
            };

            const response = await axios.request(config);
            
            // Process and format results
            const logs = this.formatLogResults(response.data.hits.hits, systemId);
            
            return {
                success: true,
                data: {
                    logs: logs,
                    totalLogs: response.data.hits.total.value || response.data.hits.total,
                    query: query,
                    indexPattern: this.getLogIndexPattern(systemId)
                }
            };

        } catch (error) {
            console.error('Elasticsearch log search failed:', error.message);
            
            // Return empty results if Elasticsearch fails
            return {
                success: false,
                error: error.message,
                data: {
                    logs: [],
                    totalLogs: 0,
                    query: null,
                    indexPattern: this.getLogIndexPattern(criteria.systemId)
                }
            };
        }
    }

    /**
     * Build Elasticsearch query based on criteria
     */
    buildLogQuery({ systemId, logType, logLevel, timeRange, searchQuery, userPermissions }) {
        const mustClauses = [];
        const filterClauses = [];

        // System isolation - CRITICAL for multi-system architecture
        // if (systemId) {
        //     filterClauses.push({
        //         term: { 'system_id.keyword': systemId }
        //     });
        // }

        // Log type filter
        // if (logType) {
        //     filterClauses.push({
        //         term: { 'log_type.keyword': logType }
        //     });
        // }

        // Log level filter - Updated to match the actual field structure
        // if (logLevel) {
        //     filterClauses.push({
        //         term: { 'level.keyword': logLevel }
        //     });
        // }

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
     * Apply custom filter with template variable replacement
     * @param {Object} customFilter - Custom Elasticsearch filter body
     * @param {Object} variables - Variables to replace in the filter
     * @returns {Object} Processed filter body
     */
    applyCustomFilter(customFilter, variables) {
        const { searchQuery, timeRange, systemId, userPermissions = [] } = variables;
        
        // Deep clone the custom filter to avoid mutation
        let filterBody = JSON.parse(JSON.stringify(customFilter));
        
        // Convert filter body to string for template replacement
        let filterString = JSON.stringify(filterBody);
        
        // Replace template variables
        if (searchQuery) {
            filterString = filterString.replace(/\{searchQuery\}/g, searchQuery);
        } else {
            // If no search query, remove the match clause or replace with match_all
            filterString = filterString.replace(/\{\s*"match"\s*:\s*\{\s*"message"\s*:\s*"\{searchQuery\}"\s*\}\s*\}/g, '{"match_all": {}}');
        }
        
        // Handle time range replacement
        if (timeRange) {
            let timeValue;
            if (timeRange.includes('last_')) {
                // Convert preset time ranges to ISO dates
                timeValue = this.getTimeRangeValue(timeRange);
            } else {
                // Assume it's already an ISO date string
                timeValue = timeRange;
            }
            filterString = filterString.replace(/\{timeRange\}/g, timeValue);
        }
        
        // Parse back to object
        filterBody = JSON.parse(filterString);
        
        // Apply system isolation and permission-based filtering
        if (systemId || userPermissions.length > 0) {
            filterBody = this.addSystemAndPermissionFilters(filterBody, systemId, userPermissions);
        }
        
        return filterBody;
    }

    /**
     * Get time range value as ISO string
     */
    getTimeRangeValue(timeRange) {
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

        return gte.toISOString();
    }

    /**
     * Add system isolation and permission-based filters to the query
     */
    addSystemAndPermissionFilters(filterBody, systemId, userPermissions) {
        // Ensure the query has the proper bool structure
        if (!filterBody.query) {
            filterBody.query = { bool: { must: [], filter: [] } };
        } else if (!filterBody.query.bool) {
            filterBody.query = { bool: { must: [filterBody.query], filter: [] } };
        }
        
        if (!filterBody.query.bool.filter) {
            filterBody.query.bool.filter = [];
        }
        
        // Add system isolation
        // if (systemId) {
        //     filterBody.query.bool.filter.push({
        //         term: { 'system_id.keyword': systemId }
        //     });
        // }
        
        // Add permission-based filtering
        if (!userPermissions.includes('view_all') && !userPermissions.includes('system_logs')) {
            filterBody.query.bool.filter.push({
                bool: {
                    must_not: [
                        // { term: { 'level.keyword': 'DEBUG' } },
                        // { term: { 'log_type.keyword': 'system' } }
                    ]
                }
            });
        }
        
        return filterBody;
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
     * Get available log indices for a system
     */
    async getSystemIndices(systemId) {
        try {
            if (!this.isConnected) {
                throw new Error('Elasticsearch not connected');
            }

            const pattern = this.getLogIndexPattern(systemId);
            const config = {
                method: 'get',
                url: `${this.indicesUrl}/${pattern}?format=json`,
                headers: { 
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            };

            const response = await axios.request(config);

            return {
                success: true,
                indices: response.data || []
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
            if (!this.isConnected) {
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

            // Build search body
            const searchBody = {
                query: query,
                sort: [
                    { '@timestamp': { order: 'desc' } },
                    { 'timestamp': { order: 'desc' } },
                    { 'created_at': { order: 'desc' } }
                ],
                size: size,
                track_total_hits: true,
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
            };

            console.log(`🔍 Elasticsearch transaction query for system ${systemId}:`, JSON.stringify(searchBody, null, 2));

            // Execute search using axios
            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: this.searchUrl,
                headers: { 
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(searchBody),
                timeout: 30000
            };

            const response = await axios.request(config);
            
            // Process and format results
            const transactions = this.formatTransactionResults(response.data.hits.hits, systemId);
            
            return {
                success: true,
                data: {
                    transactions: transactions,
                    totalTransactions: response.data.hits.total.value || response.data.hits.total,
                    query: query,
                    indexPattern: this.getTransactionIndexPattern(systemId)
                }
            };

        } catch (error) {
            console.error('Elasticsearch transaction search failed:', error.message);
            
            // Return empty results if Elasticsearch fails
            return {
                success: false,
                error: error.message,
                data: {
                    transactions: [],
                    totalTransactions: 0,
                    query: null,
                    indexPattern: this.getTransactionIndexPattern(criteria.systemId)
                }
            };
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

    /**
     * Search logs using the provided custom filter template
     * This is a convenience method that applies the specific filter structure you provided
     * @param {Object} criteria - Search criteria
     * @param {string} criteria.systemId - System ID for isolation
     * @param {string} [criteria.searchQuery] - Free text search query to replace {searchQuery}
     * @param {string} [criteria.timeRange] - Time range to replace {timeRange}
     * @param {Array} [criteria.userPermissions] - User permissions for filtering
     * @returns {Promise<Object>} Search results
     */
    async searchLogsWithCustomFilter(criteria) {
        // The custom filter template you provided
        const customFilterTemplate = {
            "size": 50,
            "track_total_hits": true,
            "sort": [
                {
                    "@timestamp": {
                        "order": "desc"
                    }
                }
            ],
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "message": "{searchQuery}"
                            }
                        }
                    ],
                    "filter": [
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": "{timeRange}"
                                }
                            }
                        }
                    ]
                }
            }
        };

        return this.searchLogs({
            ...criteria,
            customFilter: customFilterTemplate
        });
    }
}

// Create singleton instance
const elasticsearchService = new ElasticsearchService();

export default elasticsearchService;
export { ElasticsearchService };