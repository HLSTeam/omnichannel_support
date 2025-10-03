import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Elasticsearch Service for Logs Integration
 * Connects to Elasticsearch cluster and provides log querying capabilities using Axios
 * Now supports dynamic Elasticsearch URLs per system
 */
class ElasticsearchService {
    constructor() {
        // URL cache to avoid repeated database queries
        this.urlCache = new Map();
        // Cache TTL: 5 minutes
        this.cacheTTL = 5 * 60 * 1000;
        // Default fallback URL
        this.defaultElasticsearchUrl = process.env.ELASTICSEARCH_URL || 'http://192.168.0.10:29200';
        
        console.log('✅ ElasticsearchService initialized with dynamic URL support');
    }

    /**
     * Get Elasticsearch URL for a specific system
     * Uses caching to minimize database queries
     * Supports lookup by chatId and msgThreadId via group_topics
     */
    async getElasticsearchUrl(systemId, chatId = null, msgThreadId = null) {
        // Create cache key based on available parameters
        let cacheKey = systemId;
        let resolvedSystemId = systemId;

        try {
            // First, try to resolve systemId from chatId and msgThreadId
            if (chatId) {
                if (msgThreadId) {
                    // Look up system from group_topics using chatId and topicId (msgThreadId)
                    const groupTopic = await prisma.group_topics.findFirst({
                        where: {
                            topicId: msgThreadId.toString(),
                            telegram_groups: {
                                chatId: chatId.toString()
                            },
                            isActive: true
                        },
                        include: {
                            System: {
                                select: { 
                                    id: true,
                                    elasticUrl: true, 
                                    name: true 
                                }
                            }
                        }
                    });

                    if (groupTopic && groupTopic.System) {
                        resolvedSystemId = groupTopic.System.id;
                        cacheKey = `${chatId}-${msgThreadId}`;
                        
                        const elasticUrl = groupTopic.System.elasticUrl || this.defaultElasticsearchUrl;
                        
                        // Cache the URL
                        this.urlCache.set(cacheKey, {
                            url: elasticUrl,
                            timestamp: Date.now()
                        });

                        console.log(`✅ Elasticsearch URL from topic for system "${groupTopic.System.name}": ${elasticUrl}`);
                        return elasticUrl;
                    } else {
                        console.log(`⚠️ No group topic found for chatId: ${chatId}, msgThreadId: ${msgThreadId}, falling back to group system`);
                    }
                }
                
                // If msgThreadId is null or not found, get default system from telegram_groups
                const telegramGroup = await prisma.telegram_groups.findFirst({
                    where: {
                        chatId: chatId.toString(),
                        isActive: true
                    },
                    include: {
                        System: {
                            select: {
                                id: true,
                                elasticUrl: true,
                                name: true
                            }
                        }
                    }
                });

                if (telegramGroup && telegramGroup.System) {
                    resolvedSystemId = telegramGroup.System.id;
                    cacheKey = `${chatId}-default`;
                    
                    const elasticUrl = telegramGroup.System.elasticUrl || this.defaultElasticsearchUrl;
                    
                    // Cache the URL
                    this.urlCache.set(cacheKey, {
                        url: elasticUrl,
                        timestamp: Date.now()
                    });

                    console.log(`✅ Elasticsearch URL from group default for system "${telegramGroup.System.name}": ${elasticUrl}`);
                    return elasticUrl;
                } else {
                    console.log(`⚠️ No telegram group found for chatId: ${chatId}, using systemId`);
                }
            }

            // Fallback to systemId-based lookup
            if (!resolvedSystemId) {
                console.log('⚠️ No systemId or chatId provided, using default Elasticsearch URL');
                return this.defaultElasticsearchUrl;
            }

            // Check cache first
            const cached = this.urlCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
                return cached.url;
            }

            // Fetch system from database
            const system = await prisma.system.findUnique({
                where: { id: resolvedSystemId },
                select: { elasticUrl: true, name: true }
            });

            if (!system) {
                console.warn(`⚠️ System ${resolvedSystemId} not found, using default Elasticsearch URL`);
                return this.defaultElasticsearchUrl;
            }

            const elasticUrl = system.elasticUrl || this.defaultElasticsearchUrl;
            
            // Cache the URL
            this.urlCache.set(cacheKey, {
                url: elasticUrl,
                timestamp: Date.now()
            });

            console.log(`✅ Elasticsearch URL for system "${system.name}": ${elasticUrl}`);
            return elasticUrl;

        } catch (error) {
            console.error(`❌ Error fetching Elasticsearch URL:`, error.message);
            return this.defaultElasticsearchUrl;
        }
    }

    /**
     * Clear URL cache for a specific system or all systems
     */
    clearUrlCache(systemId = null) {
        if (systemId) {
            this.urlCache.delete(systemId);
            console.log(`🗑️ Cleared Elasticsearch URL cache for system ${systemId}`);
        } else {
            this.urlCache.clear();
            console.log('🗑️ Cleared all Elasticsearch URL cache');
        }
    }

    /**
     * Check if Elasticsearch is connected and healthy for a specific system
     */
    async isHealthy(systemId = null) {
        try {
            const elasticsearchUrl = await this.getElasticsearchUrl(systemId);
            const healthUrl = `${elasticsearchUrl}/_cluster/health`;
            
            const response = await axios.get(healthUrl, {
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
     * Test Elasticsearch connection for a specific system
     */
    async testConnection(systemId) {
        try {
            const elasticsearchUrl = await this.getElasticsearchUrl(systemId);
            const healthUrl = `${elasticsearchUrl}/_cluster/health`;
            
            const response = await axios.get(healthUrl, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`✅ Elasticsearch connected for system ${systemId}: ${elasticsearchUrl}`, {
                status: response.data.status,
                cluster_name: response.data.cluster_name
            });
            
            return {
                success: true,
                status: response.data.status,
                clusterName: response.data.cluster_name,
                url: elasticsearchUrl
            };
        } catch (error) {
            console.error(`❌ Elasticsearch connection failed for system ${systemId}:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
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
     * Search transactions from Elasticsearch based on criteria
     * Now uses dynamic Elasticsearch URL per system
     */
    async searchTransactions(criteria) {
        try {
            const {
                systemId,
                chatId,
                msgThreadId,
                transactionId,
                status,
                transactionType,
                timeRange = 'last_7_days',
                searchQuery,
                size = 100,
                userPermissions = []
            } = criteria;

            if (!systemId) {
                throw new Error('systemId is required for transaction search');
            }

            // Get Elasticsearch URL for this system
            const elasticsearchUrl = await this.getElasticsearchUrl(systemId, chatId, msgThreadId);
            const searchUrl = `${elasticsearchUrl}/_search`;

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

            // Build search body following the provided query structure
            const searchBody = {
                query: query,
                size: size,
                _source: [
                    "@timestamp",
                    "level",
                    "message",
                ]
            };

            // Execute search using axios
            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: searchUrl,
                headers: { 
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(searchBody),
                timeout: 30000
            };

            console.log(`🔍 Searching Elasticsearch for system ${systemId} at ${elasticsearchUrl}`);

            const response = await axios.request(config);
                    
            return {
                success: true,
                data: {
                    transactions: response.data.hits.hits,
                    totalTransactions: response.data.hits.total.value || response.data.hits.total,
                    query: query,
                    indexPattern: this.getTransactionIndexPattern(systemId),
                    elasticsearchUrl: elasticsearchUrl
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
                    indexPattern: this.getTransactionIndexPattern(criteria.systemId),
                    elasticsearchUrl: null
                }
            };
        }
    }

    /**
     * Build Elasticsearch query for transactions based on criteria
     * Follows the structure: { bool: { must: [], filter: [], should: [], must_not: [] } }
     */
    buildTransactionQuery({ systemId, transactionId, status, transactionType, timeRange, searchQuery, userPermissions }) {
        const mustClauses = [];
        const filterClauses = [];
        const shouldClauses = [];
        const mustNotClauses = [];

        // System isolation
        // if (systemId) {
        //     filterClauses.push({
        //         term: { 'system_id.keyword': systemId }
        //     });
        // }

        // Specific transaction ID - use multi_match for flexible searching
        if (transactionId) {
            filterClauses.push({
                multi_match: {
                    type: "best_fields",
                    query: transactionId,
                    lenient: true,
                    // fields: ['transaction_id', 'transaction_id.keyword', 'reference', 'reference.keyword']
                }
            });
        }

        // // Transaction status filter
        // if (status) {
        //     filterClauses.push({
        //         term: { 'status.keyword': status.toLowerCase() }
        //     });
        // }

        // // Transaction type filter
        // if (transactionType) {
        //     filterClauses.push({
        //         bool: {
        //             should: [
        //                 { term: { 'type.keyword': transactionType } },
        //                 { term: { 'transaction_type.keyword': transactionType } }
        //             ]
        //         }
        //     });
        // }

        // Time range filter - use strict_date_optional_time format
        if (timeRange) {
            const timeFilter = this.getTimeRangeFilter(timeRange);
            if (timeFilter) {
                // Update time filter to use strict_date_optional_time format
                const updatedTimeFilter = {
                    range: {
                        '@timestamp': {
                            format: "strict_date_optional_time",
                            gte: timeFilter.range['@timestamp'].gte,
                            lte: timeFilter.range['@timestamp'].lte
                        }
                    }
                };
                filterClauses.push(updatedTimeFilter);
            }
        }

        // Free text search - use multi_match with best_fields and lenient
        if (searchQuery) {
            filterClauses.push({
                multi_match: {
                    type: "best_fields",
                    query: searchQuery,
                    lenient: true
                }
            });
        }

        // User permission-based filtering
        // if (!userPermissions.includes('view_all') && !userPermissions.includes('transaction_status')) {
        //     // Restrict sensitive transaction data for non-admin users
        //     mustNotClauses.push(
        //         { term: { 'status.keyword': 'failed' } },
        //         { exists: { field: 'error_code' } }
        //     );
        // }

        return {
            bool: {
                must: mustClauses,
                filter: filterClauses,
                should: shouldClauses,
                must_not: mustNotClauses
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
     * Execute custom Elasticsearch query with provided query structure
     * Accepts a full Elasticsearch query object following the provided format
     * Now uses dynamic Elasticsearch URL per system
     */
    async executeCustomQuery(queryData, systemId = null, userPermissions = [], chatId = null, msgThreadId = null) {
        try {
            // Validate query structure
            if (!queryData || !queryData.query) {
                throw new Error('Invalid query data - query object is required');
            }

            if (!systemId) {
                throw new Error('systemId is required for custom query execution');
            }

            // Get Elasticsearch URL for this system
            const elasticsearchUrl = await this.getElasticsearchUrl(systemId, chatId, msgThreadId);
            const searchUrl = `${elasticsearchUrl}/_search`;

            // Add system isolation if systemId is provided
            if (systemId && queryData.query.bool && queryData.query.bool.filter) {
                queryData.query.bool.filter.push({
                    term: { 'system_id.keyword': systemId }
                });
            }

            // Add permission-based filtering
            if (!userPermissions.includes('view_all') && !userPermissions.includes('transaction_status')) {
                if (queryData.query.bool && queryData.query.bool.must_not) {
                    queryData.query.bool.must_not.push(
                        { term: { 'status.keyword': 'failed' } },
                        { exists: { field: 'error_code' } }
                    );
                } else if (queryData.query.bool) {
                    queryData.query.bool.must_not = [
                        { term: { 'status.keyword': 'failed' } },
                        { exists: { field: 'error_code' } }
                    ];
                }
            }

            console.log(`🔍 Executing custom query for system ${systemId} at ${elasticsearchUrl}`);

            // Execute search using axios
            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: searchUrl,
                headers: { 
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(queryData),
                timeout: 30000
            };

            const response = await axios.request(config);
            
            return {
                success: true,
                data: {
                    transactions: response.data.hits.hits,
                    totalTransactions: response.data.hits.total.value || response.data.hits.total,
                    query: queryData.query,
                    rawResponse: response.data,
                    indexPattern: this.getTransactionIndexPattern(systemId),
                    elasticsearchUrl: elasticsearchUrl
                }
            };

        } catch (error) {
            console.error('Custom Elasticsearch query failed:', error.message);
            
            return {
                success: false,
                error: error.message,
                data: {
                    transactions: [],
                    totalTransactions: 0,
                    query: queryData?.query || null,
                    rawResponse: null,
                    indexPattern: this.getTransactionIndexPattern(systemId),
                    elasticsearchUrl: null
                }
            };
        }
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