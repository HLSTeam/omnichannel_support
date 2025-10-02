# Elasticsearch Dynamic URL Implementation

## Overview
This document describes the implementation of dynamic Elasticsearch URL support in the ElasticsearchService. The service now fetches the `elasticUrl` from each System record instead of using a hard-coded URL.

## Problem Statement
Previously, the ElasticsearchService used a single hard-coded URL for all systems:
```javascript
this.elasticsearchUrl = process.env.ELASTICSEARCH_URL || 'http://192.168.0.10:29200';
```

This approach had several limitations:
- ❌ All systems shared the same Elasticsearch instance
- ❌ No support for multi-tenant or distributed Elasticsearch deployments
- ❌ Difficult to migrate systems to different Elasticsearch clusters
- ❌ No system-specific Elasticsearch configurations

## Solution
The service now dynamically fetches the Elasticsearch URL from the `System` table based on `systemId`.

## Implementation Details

### 1. Database Schema
The `System` model includes an optional `elasticUrl` field:
```prisma
model System {
  id         String   @id @default(cuid())
  name       String
  elasticUrl String?  // Dynamic Elasticsearch URL per system
  // ... other fields
}
```

### 2. Service Architecture

#### Key Components

**URL Cache**
```javascript
this.urlCache = new Map();
this.cacheTTL = 5 * 60 * 1000; // 5 minutes
```
- Caches URLs to minimize database queries
- TTL-based expiration (5 minutes)
- Improves performance for repeated queries

**Default Fallback URL**
```javascript
this.defaultElasticsearchUrl = process.env.ELASTICSEARCH_URL || 'http://192.168.0.10:29200';
```
- Used when system doesn't have `elasticUrl` configured
- Provides backward compatibility
- Environment variable support

### 3. Core Methods

#### `getElasticsearchUrl(systemId)`
Fetches the Elasticsearch URL for a given system with caching:

```javascript
async getElasticsearchUrl(systemId) {
  // 1. Check cache first
  // 2. Query database if not cached
  // 3. Return system's elasticUrl or default
  // 4. Cache the result
}
```

**Flow:**
```
┌─────────────────────┐
│ getElasticsearchUrl │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Check Cache? │─── Yes ──▶ Return cached URL
    └──────┬───────┘
           │ No
           ▼
    ┌──────────────┐
    │ Query System │
    │  from DB     │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ elasticUrl   │─── Null ──▶ Use default URL
    │   exists?    │
    └──────┬───────┘
           │ Yes
           ▼
    ┌──────────────┐
    │ Cache & Return│
    └───────────────┘
```

#### `clearUrlCache(systemId)`
Clears cached URLs when system is updated:
```javascript
clearUrlCache(systemId = null) {
  if (systemId) {
    this.urlCache.delete(systemId);
  } else {
    this.urlCache.clear(); // Clear all
  }
}
```

#### `isHealthy(systemId)`
Checks Elasticsearch health for a specific system:
```javascript
async isHealthy(systemId = null) {
  const elasticsearchUrl = await this.getElasticsearchUrl(systemId);
  const healthUrl = `${elasticsearchUrl}/_cluster/health`;
  // ... perform health check
}
```

#### `testConnection(systemId)`
Tests Elasticsearch connection for a system:
```javascript
async testConnection(systemId) {
  const elasticsearchUrl = await this.getElasticsearchUrl(systemId);
  // ... test connection
  return {
    success: true/false,
    status: 'green/yellow/red',
    clusterName: '...',
    url: elasticsearchUrl
  };
}
```

### 4. Updated Search Methods

#### `searchTransactions(criteria)`
```javascript
async searchTransactions(criteria) {
  const { systemId, ... } = criteria;
  
  // Get dynamic URL for this system
  const elasticsearchUrl = await this.getElasticsearchUrl(systemId);
  const searchUrl = `${elasticsearchUrl}/_search`;
  
  // Execute search with system-specific URL
  // ...
}
```

#### `executeCustomQuery(queryData, systemId, userPermissions)`
```javascript
async executeCustomQuery(queryData, systemId, userPermissions) {
  // Get dynamic URL for this system
  const elasticsearchUrl = await this.getElasticsearchUrl(systemId);
  const searchUrl = `${elasticsearchUrl}/_search`;
  
  // Execute custom query with system-specific URL
  // ...
}
```

### 5. Controller Integration

The System controller clears the cache when `elasticUrl` is updated:

```javascript
// In updateSystem controller
const updatedSystem = await prisma.system.update({
  where: { id: id },
  data: updateData,
  include: { Channel: true }
});

// Clear cache if elasticUrl was updated
if (elasticUrl !== undefined) {
  elasticsearchService.clearUrlCache(id);
  console.log(`🔄 Cleared Elasticsearch URL cache for system ${id}`);
}
```

## Usage Examples

### Example 1: System with Custom Elasticsearch URL

```javascript
// System record in database
{
  id: "clxxx123",
  name: "Production System",
  elasticUrl: "https://prod-es.company.com:9200"
}

// Search will use: https://prod-es.company.com:9200/_search
await elasticsearchService.searchTransactions({
  systemId: "clxxx123",
  timeRange: "last_24_hours"
});
```

### Example 2: System without Elasticsearch URL

```javascript
// System record in database
{
  id: "clxxx456",
  name: "Dev System",
  elasticUrl: null
}

// Search will use default: http://192.168.0.10:29200/_search
await elasticsearchService.searchTransactions({
  systemId: "clxxx456",
  timeRange: "last_24_hours"
});
```

### Example 3: Testing Connection

```javascript
const result = await elasticsearchService.testConnection("clxxx123");
console.log(result);
// {
//   success: true,
//   status: "green",
//   clusterName: "production-cluster",
//   url: "https://prod-es.company.com:9200"
// }
```

## Performance Considerations

### Caching Strategy
- **Cache Hit**: ~0ms (immediate return from Map)
- **Cache Miss**: ~10-50ms (database query + cache update)
- **Cache TTL**: 5 minutes (configurable)

### Database Impact
- Minimal impact due to caching
- Only queries `elasticUrl` and `name` fields
- Uses Prisma's efficient query builder

### Memory Usage
- Each cached entry: ~100 bytes (systemId + URL + timestamp)
- For 1000 systems: ~100KB memory
- Negligible impact on overall memory

## Error Handling

### Missing System
```javascript
if (!system) {
  console.warn(`⚠️ System ${systemId} not found, using default Elasticsearch URL`);
  return this.defaultElasticsearchUrl;
}
```

### Database Error
```javascript
catch (error) {
  console.error(`❌ Error fetching Elasticsearch URL:`, error.message);
  return this.defaultElasticsearchUrl;
}
```

### Connection Error
```javascript
catch (error) {
  console.error('Elasticsearch health check failed:', error.message);
  return false;
}
```

## Benefits

### ✅ Multi-Tenancy Support
- Each system can have its own Elasticsearch cluster
- Complete data isolation between systems
- Flexible deployment options

### ✅ Scalability
- Systems can be migrated to different clusters
- Load balancing across multiple Elasticsearch instances
- Easier horizontal scaling

### ✅ Flexibility
- Different Elasticsearch versions per system
- Region-specific deployments
- Custom configurations per system

### ✅ Backward Compatibility
- Systems without `elasticUrl` use default
- No breaking changes to existing code
- Gradual migration path

### ✅ Performance
- URL caching reduces database queries
- Configurable cache TTL
- Minimal overhead

## Migration Guide

### For Existing Systems

**Step 1: Update System Records**
```sql
-- Add Elasticsearch URLs to existing systems
UPDATE "System" 
SET "elasticUrl" = 'https://es-production.company.com:9200'
WHERE "name" = 'Production System';

UPDATE "System" 
SET "elasticUrl" = 'https://es-staging.company.com:9200'
WHERE "name" = 'Staging System';
```

**Step 2: Test Connections**
```javascript
// Test each system's connection
for (const system of systems) {
  const result = await elasticsearchService.testConnection(system.id);
  console.log(`${system.name}: ${result.success ? '✅' : '❌'}`);
}
```

**Step 3: Clear Cache (if needed)**
```javascript
// Clear all cached URLs after bulk updates
elasticsearchService.clearUrlCache();
```

### For New Systems

Simply include `elasticUrl` when creating a system:
```javascript
const newSystem = await prisma.system.create({
  data: {
    name: "New System",
    elasticUrl: "https://es-new.company.com:9200"
  }
});
```

## API Response Changes

All Elasticsearch-related API responses now include the `elasticsearchUrl` used:

```json
{
  "success": true,
  "data": {
    "systemId": "clxxx123",
    "systemName": "Production System",
    "transactions": [...],
    "elasticsearchUrl": "https://prod-es.company.com:9200",
    "elasticsearchHealth": true,
    "indexPattern": "transactions-clxxx123-*"
  }
}
```

## Testing

### Unit Tests
```javascript
describe('ElasticsearchService', () => {
  it('should use system-specific URL', async () => {
    const url = await service.getElasticsearchUrl('test-system-id');
    expect(url).toBe('https://test-es.com:9200');
  });
  
  it('should use default URL when system has no elasticUrl', async () => {
    const url = await service.getElasticsearchUrl('no-url-system');
    expect(url).toBe('http://192.168.0.10:29200');
  });
  
  it('should cache URLs', async () => {
    await service.getElasticsearchUrl('system-id');
    const cached = service.urlCache.get('system-id');
    expect(cached).toBeDefined();
  });
});
```

### Integration Tests
```javascript
describe('System Elasticsearch Integration', () => {
  it('should search using system-specific URL', async () => {
    const result = await elasticsearchService.searchTransactions({
      systemId: 'test-system',
      timeRange: 'last_1_hour'
    });
    expect(result.data.elasticsearchUrl).toBe('https://test-es.com:9200');
  });
});
```

## Configuration

### Environment Variables
```env
# Default Elasticsearch URL (fallback)
ELASTICSEARCH_URL=http://192.168.0.10:29200

# Database connection
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

### Service Configuration
```javascript
class ElasticsearchService {
  constructor() {
    this.cacheTTL = 5 * 60 * 1000; // Adjust cache TTL
    this.defaultElasticsearchUrl = process.env.ELASTICSEARCH_URL;
  }
}
```

## Monitoring

### Logs
The service provides detailed logging:
```
✅ ElasticsearchService initialized with dynamic URL support
✅ Elasticsearch URL for system "Production System": https://prod-es.com:9200
🔍 Searching Elasticsearch for system clxxx123 at https://prod-es.com:9200
🔄 Cleared Elasticsearch URL cache for system clxxx123
⚠️ System not found, using default Elasticsearch URL
❌ Error fetching Elasticsearch URL: Connection timeout
```

### Health Checks
Monitor Elasticsearch health per system:
```javascript
const health = await elasticsearchService.isHealthy(systemId);
if (!health) {
  console.error(`Elasticsearch unhealthy for system ${systemId}`);
  // Alert operations team
}
```

## Troubleshooting

### Issue: URLs not updating after system modification
**Solution:** Clear the cache manually
```javascript
elasticsearchService.clearUrlCache(systemId);
```

### Issue: Connection timeouts
**Solution:** Check system's `elasticUrl` is correct
```javascript
const system = await prisma.system.findUnique({
  where: { id: systemId },
  select: { elasticUrl: true }
});
console.log('Configured URL:', system.elasticUrl);
```

### Issue: Using wrong URL
**Solution:** Verify cache is working correctly
```javascript
const cached = elasticsearchService.urlCache.get(systemId);
console.log('Cached:', cached);
```

## Future Enhancements

### Planned Features
1. **Connection Pooling**: Pool connections per system URL
2. **Health Monitoring**: Automatic health checks with alerts
3. **Failover Support**: Multiple Elasticsearch URLs per system
4. **Metrics**: Track query performance per system
5. **Admin UI**: Manage Elasticsearch URLs via UI

### Considerations
- Add authentication support (API keys, basic auth)
- Support for Elasticsearch Cloud ID
- Index template management per system
- Automatic index creation and rotation

## Summary

The dynamic Elasticsearch URL implementation provides:
- ✅ Per-system Elasticsearch configuration
- ✅ Performance-optimized with caching
- ✅ Backward compatible
- ✅ Easy to maintain and extend
- ✅ Production-ready with error handling

All systems can now have their own Elasticsearch instances while maintaining a simple, efficient API.

