import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET /api/telegram-groups
// Lấy danh sách tất cả groups
const getAllGroups = async (req, res) => {
    try {
        const { type, active } = req.query;
        
        const whereClause = {};
        if (type) whereClause.groupType = type.toUpperCase();
        if (active !== undefined) whereClause.isActive = active === 'true';
        
        const groups = await prisma.telegram_groups.findMany({
            where: whereClause,
            include: {
                group_permissions: true,
                System: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: [
                { groupType: 'asc' },
                { groupName: 'asc' }
            ]
        });
        
        res.json({
            success: true,
            data: groups,
            count: groups.length
        });
    } catch (error) {
        console.error('Error fetching telegram groups:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch telegram groups',
            details: error.message
        });
    }
};

// GET /api/telegram-groups/:type
// Lấy groups theo type (admin/customer/supplier)
const getGroupsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const validTypes = ['ADMIN', 'CUSTOMER', 'SUPPLIER'];
        
        if (!validTypes.includes(type.toUpperCase())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid group type',
                validTypes: validTypes
            });
        }
        
        const groups = await prisma.telegram_groups.findMany({
            where: { 
                groupType: type.toUpperCase(),
                isActive: true 
            },
            include: {
                group_permissions: true,
                System: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        
        res.json({
            success: true,
            data: groups,
            count: groups.length
        });
    } catch (error) {
        console.error('Error fetching groups by type:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch groups by type',
            details: error.message
        });
    }
};

// GET /api/telegram-groups/detect
// Detect group type and permissions based on chat info
const detectGroupInfo = async (req, res) => {
    try {
        const { chatId, chatTitle, username } = req.body;
        
        if (!chatId) {
            return res.status(400).json({
                success: false,
                error: 'chatId is required'
            });
        }
        
        // 🔍 Tìm group đã tồn tại trong database để lấy systemId
        let existingGroup = await prisma.telegram_groups.findFirst({
            where: { 
                chatId: chatId.toString()
            },
            include: { 
                permissions: true,
                system: true  // Include system info
            }
        });
        
        let systemId = null;
        let system = null;
        
        if (existingGroup) {
            // Group đã tồn tại - lấy systemId từ database
            systemId = existingGroup.systemId;
            system = existingGroup.system;
        } else {
            // 🔍 Group chưa tồn tại - cần logic để xác định systemId
            // Tạm thời sử dụng system đầu tiên (có thể cải thiện sau)
            system = await prisma.system.findFirst();
            if (system) {
                systemId = system.id;
            } else {
                return res.status(500).json({
                    success: false,
                    error: 'No system found in database'
                });
            }
        }
        
        if (existingGroup) {
            // Group đã tồn tại - trả về thông tin
            const permissions = await prisma.groupPermission.findMany({
                where: { 
                    systemId: systemId,        // 🆕 THÊM SYSTEM FILTER
                    groupType: existingGroup.groupType 
                }
            });
            
            return res.json({
                success: true,
                data: {
                    systemId: systemId,  // 🔍 Trả về systemId đã detect
                    groupType: existingGroup.groupType,
                    userRole: existingGroup.groupType.toLowerCase(),
                    permissions: permissions.map(p => p.permissionName),
                    groupInfo: existingGroup,
                    isRegistered: true
                }
            });
        }
        
        // Group chưa tồn tại - detect tự động
        let detectedType = 'CUSTOMER'; // default
        
        const title = (chatTitle || '').toLowerCase();
        const user = (username || '').toLowerCase();
        
        if (title.includes('admin') || title.includes('quản trị') || user.includes('admin')) {
            detectedType = 'ADMIN';
        } else if (title.includes('supplier') || title.includes('nhà cung cấp') || title.includes('ncc') || user.includes('supplier')) {
            detectedType = 'SUPPLIER';
        } else if (title.includes('customer') || title.includes('khách hàng')) {
            detectedType = 'CUSTOMER';
        }
        
        // 🆕 Lấy permissions cho detected type với systemId
        const permissions = await prisma.groupPermission.findMany({
            where: { 
                systemId: systemId,        // 🆕 THÊM SYSTEM FILTER
                groupType: detectedType 
            }
        });
        
        res.json({
            success: true,
            data: {
                systemId: systemId,  // 🔍 Trả về systemId đã detect
                groupType: detectedType,
                userRole: detectedType.toLowerCase(),
                permissions: permissions.map(p => p.permissionName),
                groupInfo: {
                    chatId: chatId,
                    chatTitle: chatTitle,
                    detectedType: detectedType
                },
                isRegistered: false,
                suggestedGroup: {
                    groupName: chatTitle || `Detected ${detectedType} Group`,
                    groupType: detectedType,
                    systemId: systemId,
                    chatId: chatId.toString(),
                    chatTitle: chatTitle,
                    description: `Auto-detected ${detectedType.toLowerCase()} group for system: ${system.name}`
                }
            }
        });
    } catch (error) {
        console.error('Error detecting group info:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to detect group info',
            details: error.message
        });
    }
};

// POST /api/telegram-groups
// Thêm group mới
const createGroup = async (req, res) => {
    try {
        const { groupName, groupType, chatId, description, chatTitle, memberCount } = req.body;
        
        // Validation
        if (!groupName || !groupType || !chatId) {
            return res.status(400).json({
                success: false,
                error: 'groupName, groupType, and chatId are required'
            });
        }
        
        const validTypes = ['ADMIN', 'CUSTOMER', 'SUPPLIER'];
        if (!validTypes.includes(groupType.toUpperCase())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid group type',
                validTypes: validTypes
            });
        }
        
        // Check if chatId already exists
        const existingGroup = await prisma.telegram_groups.findUnique({
            where: { chatId: chatId.toString() }
        });
        
        if (existingGroup) {
            return res.status(400).json({
                success: false,
                error: 'Group with this chatId already exists',
                existingGroup: existingGroup
            });
        }
        
        const group = await prisma.telegram_groups.create({
            data: {
                groupName,
                groupType: groupType.toUpperCase(),
                chatId: chatId.toString(),
                description,
                chatTitle,
                memberCount: memberCount ? parseInt(memberCount) : null
            },
            include: {
                group_permissions: true,
                System: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        
        res.status(201).json({
            success: true,
            data: group,
            message: 'Telegram group created successfully'
        });
    } catch (error) {
        if (error.code === 'P2002') {
            // Unique constraint violation
            const field = error.meta?.target?.[0] || 'field';
            return res.status(400).json({
                success: false,
                error: `Duplicate value for ${field}`,
                details: `The ${field} value already exists in another group`,
                field: field
            });
        }
        
        console.error('Error creating telegram group:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create telegram group',
            details: error.message
        });
    }
};

// PUT /api/telegram-groups/:id
// Cập nhật group
const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Remove id from updateData if present
        delete updateData.id;
        
        // Validate groupType if provided
        if (updateData.groupType) {
            const validTypes = ['ADMIN', 'CUSTOMER', 'SUPPLIER'];
            if (!validTypes.includes(updateData.groupType.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid group type',
                    validTypes: validTypes
                });
            }
            updateData.groupType = updateData.groupType.toUpperCase();
        }
        
        // Convert chatId to string if provided
        if (updateData.chatId) {
            updateData.chatId = updateData.chatId.toString();
        }
        
        // Convert memberCount to int if provided
        if (updateData.memberCount) {
            updateData.memberCount = parseInt(updateData.memberCount);
        }

        // Handle permissions update if provided
        let permissions = [];
        if (updateData.permissions && Array.isArray(updateData.permissions)) {
            permissions = updateData.permissions;
            delete updateData.permissions; // Remove from main update data
        }
        
        const group = await prisma.telegram_groups.update({
            where: { id },
            data: {
                ...updateData
            },
            include: {
                group_permissions: true,
                System: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Update permissions if provided
        if (permissions.length > 0) {
            // Delete existing permissions
            await prisma.group_permissions.deleteMany({
                where: { 
                    systemId: group.systemId,
                    groupType: group.groupType 
                }
            });

            // Create new permissions
            const permissionData = permissions.map(permissionName => ({
                systemId: group.systemId,
                groupType: group.groupType,
                permissionName: permissionName
            }));

            await prisma.group_permissions.createMany({
                data: permissionData
            });

            // Reload group with updated permissions
            const updatedGroup = await prisma.telegram_groups.findUnique({
                where: { id },
                include: {
                    group_permissions: true,
                    System: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return res.json({
                success: true,
                data: updatedGroup,
                message: 'Telegram group and permissions updated successfully'
            });
        }
        
        res.json({
            success: true,
            data: group,
            message: 'Telegram group updated successfully'
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Telegram group not found'
            });
        }
        
        if (error.code === 'P2002') {
            // Unique constraint violation
            const field = error.meta?.target?.[0] || 'field';
            return res.status(400).json({
                success: false,
                error: `Duplicate value for ${field}`,
                details: `The ${field} value already exists in another group`,
                field: field
            });
        }
        
        console.error('Error updating telegram group:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update telegram group',
            details: error.message
        });
    }
};

// DELETE /api/telegram-groups/:id
// Xóa group (soft delete)
const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { hard } = req.query; // ?hard=true for hard delete
        
        if (hard === 'true') {
            // Hard delete
            await prisma.telegram_groups.delete({
                where: { id }
            });
            
            res.json({
                success: true,
                message: 'Telegram group permanently deleted'
            });
        } else {
            // Soft delete
            const group = await prisma.telegram_groups.update({
                where: { id },
                data: { 
                    isActive: false
                }
            });
            
            res.json({
                success: true,
                data: group,
                message: 'Telegram group deactivated'
            });
        }
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Telegram group not found'
            });
        }
        
        console.error('Error deleting telegram group:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete telegram group',
            details: error.message
        });
    }
};

// GET /api/telegram-groups/chat-ids
// Lấy danh sách chat IDs theo group type (for n8n workflows)
const getChatIdsByType = async (req, res) => {
    try {
        const { types } = req.query; // comma-separated types: admin,customer,supplier
        
        let whereClause = { isActive: true };
        
        if (types) {
            const typeList = types.split(',').map(t => t.trim().toUpperCase());
            const validTypes = ['ADMIN', 'CUSTOMER', 'SUPPLIER'];
            const filteredTypes = typeList.filter(t => validTypes.includes(t));
            
            if (filteredTypes.length > 0) {
                whereClause.groupType = { in: filteredTypes };
            }
        }
        
        const groups = await prisma.telegram_groups.findMany({
            where: whereClause,
            select: {
                id: true,
                groupName: true,
                groupType: true,
                chatId: true,
                chatTitle: true
            }
        });
        
        // Group by type for easy access
        const groupedChatIds = {
            admin: [],
            customer: [],
            supplier: [],
            all: []
        };
        
        groups.forEach(group => {
            const chatIdInfo = {
                id: group.id,
                groupName: group.groupName,
                chatId: group.chatId,
                chatTitle: group.chatTitle
            };
            
            groupedChatIds[group.groupType.toLowerCase()].push(chatIdInfo);
            groupedChatIds.all.push({
                ...chatIdInfo,
                groupType: group.groupType
            });
        });
        
        res.json({
            success: true,
            data: groupedChatIds,
            count: {
                admin: groupedChatIds.admin.length,
                customer: groupedChatIds.customer.length,
                supplier: groupedChatIds.supplier.length,
                total: groups.length
            }
        });
    } catch (error) {
        console.error('Error fetching chat IDs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chat IDs',
            details: error.message
        });
    }
};

export {
    getAllGroups,
    getGroupsByType,
    detectGroupInfo,
    createGroup,
    updateGroup,
    deleteGroup,
    getChatIdsByType
};
