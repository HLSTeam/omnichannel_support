# Integration Guide: n8n ↔ Backend Communication

## Overview
This guide documents the integration between n8n workflows and the backend API, including authentication, endpoints, and error handling.

## Current Issues & Solutions

### 1. Critical Issues

#### Issue: Endpoint Mismatch
**Problem**: Helpdesk workflow calls wrong backend endpoint
- **Current**: `http://localhost:3000/api/tickets`
- **Required**: `https://[ngrok-staging]/api/helpdesk/tickets`

**Solution**: Update workflow configuration
```javascript
// In Helpdesk Ticket Management workflow
// Node: "Create Ticket in Database"
url: "https://[ngrok-staging]/api/helpdesk/tickets"
```

#### Issue: Missing Authentication
**Problem**: No JWT token in backend API calls
- **Current**: No authentication headers
- **Required**: JWT token in Authorization header

**Solution**: Add authentication to workflow
```javascript
// Add headers to HTTP Request node
headers: {
  "Authorization": "Bearer {{$json.jwtToken}}",
  "Content-Type": "application/json"
}
```

### 2. Integration Architecture

#### Authentication Flow
```
1. User sends message to Telegram Bot
2. Coordinator Bot validates permissions
3. AI Intent Analysis determines intent
4. Route Request selects target workflow
5. Target workflow calls backend API with JWT token
6. Backend validates token and processes request
7. Response returned to workflow
8. Final response sent to user
```

#### Required Backend Endpoints
| Endpoint | Method | Purpose | Authentication |
|-----------|--------|---------|----------------|
| `/api/v1/telegram-groups/detect` | POST | Permission checking | None (public) |
| `/api/v1/helpdesk/tickets` | POST | Create ticket | JWT required |
| `/api/v1/helpdesk/tickets` | GET | List tickets | JWT required |
| `/api/v1/helpdesk/tickets/:id` | PUT | Update ticket | JWT required |

### 3. Workflow Configuration

#### Environment Variables
```bash
# n8n Environment Variables
BACKEND_STAGING_URL=https://[ngrok-staging]
BACKEND_PRODUCTION_URL=https://[production-domain]
JWT_SECRET=[your-jwt-secret]
```

#### Workflow Headers
```javascript
// Standard headers for all backend API calls
{
  "Authorization": "Bearer {{$json.jwtToken}}",
  "Content-Type": "application/json",
  "User-Agent": "n8n-workflow/1.0"
}
```

### 4. Error Handling

#### HTTP Status Codes
- **200**: Success
- **201**: Created (for ticket creation)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing/invalid JWT)
- **403**: Forbidden (insufficient permissions)
- **500**: Internal Server Error

#### Error Response Format
```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error information",
  "data": null
}
```

#### Success Response Format
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### 5. Testing & Validation

#### Test Endpoints
```bash
# Test backend connectivity
curl -X GET "https://[ngrok-staging]/api/v1/helpdesk/tickets" \
  -H "Authorization: Bearer [jwt-token]"

# Test ticket creation
curl -X POST "https://[ngrok-staging]/api/v1/helpdesk/tickets" \
  -H "Authorization: Bearer [jwt-token]" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Ticket",
    "description": "Test description",
    "priority": "MEDIUM",
    "category": "TECHNICAL"
  }'
```

#### Workflow Testing
1. **Test Coordinator Bot**: Send test message to Telegram
2. **Test Permission Check**: Verify group detection
3. **Test AI Analysis**: Verify intent classification
4. **Test Workflow Execution**: Verify backend API calls
5. **Test Response**: Verify user receives response

### 6. Monitoring & Debugging

#### Logging
- **n8n Logs**: Check workflow execution logs
- **Backend Logs**: Check API request/response logs
- **Telegram Logs**: Check bot interaction logs

#### Common Issues
1. **CORS Errors**: Backend needs proper CORS configuration
2. **Timeout Errors**: Increase timeout in n8n HTTP nodes
3. **Authentication Errors**: Verify JWT token format and validity
4. **Endpoint Errors**: Verify correct URL and endpoint paths

### 7. Production Deployment

#### Checklist
- [ ] All workflows use environment-based URLs
- [ ] JWT authentication properly configured
- [ ] Error handling implemented in all workflows
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures established
- [ ] Documentation updated and reviewed

#### Security Considerations
- **JWT Tokens**: Secure storage and rotation
- **API Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all inputs
- **Error Messages**: Don't expose sensitive information
- **HTTPS**: Use SSL/TLS for all communications

---

## Next Steps
1. **Fix Critical Issues**: Update workflow configurations
2. **Implement Authentication**: Add JWT token handling
3. **Test Integration**: Validate end-to-end flow
4. **Deploy to Production**: Move to production environment
5. **Monitor Performance**: Track system metrics and performance

---

## Support & Troubleshooting
- **n8n Issues**: Check n8n workflow execution logs
- **Backend Issues**: Check backend API logs and database
- **Integration Issues**: Verify endpoint URLs and authentication
- **Performance Issues**: Monitor response times and error rates
