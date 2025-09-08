# /create-workflow Task

When this command is used, execute the following task:

# Create Workflow Task

## Task: Create n8n Workflow

**Purpose:** Create a complete n8n workflow following the 7-phase process

**Prerequisites:** 
- User has specified workflow requirements
- n8n-mcp agent is active

**Execution Steps:**

### Phase 1: Discovery Phase
1. **Understand Requirements**
   - Ask clarifying questions if requirements are unclear
   - Identify the workflow logic and purpose

2. **Find Right Nodes**
   - Use `search_nodes({query: 'keyword'})` to find relevant nodes
   - Use `list_nodes({category: 'trigger'})` to browse by category
   - Use `list_ai_tools()` to see AI-capable nodes

### Phase 2: Configuration Phase
3. **Get Node Details**
   - Use `get_node_essentials(nodeType)` for essential properties
   - Use `search_node_properties(nodeType, 'auth')` for specific properties
   - Use `get_node_documentation(nodeType)` for detailed docs

4. **Show Workflow Architecture**
   - Present visual representation of workflow structure
   - Ask for user approval before proceeding

### Phase 3: Pre-Validation Phase
5. **Validate Node Configurations**
   - Use `validate_node_minimal(nodeType, config)` for quick checks
   - Use `validate_node_operation(nodeType, config, profile)` for full validation
   - Fix any validation errors before proceeding

### Phase 4: Building Phase
6. **Create Workflow**
   - Use validated configurations from Phase 3
   - Connect nodes with proper structure
   - Add error handling where appropriate
   - Use expressions like $json, $node["NodeName"].json

### Phase 5: Workflow Validation Phase
7. **Validate Complete Workflow**
   - Use `validate_workflow(workflow)` for complete validation
   - Use `validate_workflow_connections(workflow)` for structure validation
   - Use `validate_workflow_expressions(workflow)` for expression validation

### Phase 6: Deployment Phase
8. **Deploy Workflow** (if n8n API configured)
   - Use `n8n_create_workflow(workflow)` to deploy
   - Use `n8n_validate_workflow({id: 'workflow-id'})` for post-deployment validation

### Phase 7: Post-Validation Phase
9. **Verify Deployment**
   - Confirm workflow was created successfully
   - Monitor execution status if applicable

**Success Criteria:**
- All phases completed successfully
- Workflow is validated and error-free
- User requirements are met
- Workflow is ready for use

**Error Handling:**
- If any validation fails, return to appropriate phase
- If deployment fails, troubleshoot and retry
- Document any issues in debug log

**Output:**
- Complete workflow JSON
- Validation results
- Deployment confirmation
- Usage instructions
