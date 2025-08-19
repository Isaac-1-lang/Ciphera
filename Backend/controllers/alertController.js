import Alert from '../models/Alert.js';
import { logger } from '../utils/logger.js';

// Create new alert
export const createAlert = async (req, res) => {
  try {
    const {
      title,
      description,
      severity,
      category,
      source,
      affectedUsers,
      priority,
      tags
    } = req.body;
    
    const userId = req.user.userId;
    
    if (!title || !description || !severity || !category || !source) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, severity, category, and source are required'
      });
    }
    
    const alert = new Alert({
      userId,
      title,
      description,
      severity,
      category,
      source,
      affectedUsers: affectedUsers || 1,
      priority: priority || 'medium',
      tags: tags || [],
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    await alert.save();
    
    
    res.status(201).json({
      success: true,
      data: alert.getDetailed(),
      message: 'Alert created successfully'
    });
    
  } catch (error) {
    logger.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error creating alert'
    });
  }
};

// Get all alerts for user
export const getAlerts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      severity, 
      category, 
      priority,
      search 
    } = req.query;
    
    const query = { userId, isArchived: false };
    
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };
    
    const alerts = await Alert.paginate(query, options);
    
    // Transform data to include summaries
    const transformedAlerts = {
      ...alerts,
      docs: alerts.docs.map(alert => alert.getSummary())
    };
    
    res.status(200).json({
      success: true,
      data: transformedAlerts,
      message: 'Alerts retrieved successfully'
    });
    
  } catch (error) {
    logger.error('Error retrieving alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving alerts'
    });
  }
};

// Get alert by ID
export const getAlertById = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.userId;
    
    const alert = await Alert.findOne({ _id: alertId, userId });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: alert.getDetailed(),
      message: 'Alert retrieved successfully'
    });
    
  } catch (error) {
    logger.error('Error retrieving alert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving alert'
    });
  }
};

// Update alert
export const updateAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;
    
    const alert = await Alert.findOne({ _id: alertId, userId });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'severity', 'category', 'source', 
      'affectedUsers', 'priority', 'tags', 'assignedTo'
    ];
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        alert[field] = updateData[field];
      }
    });
    
    await alert.save();
    
    res.status(200).json({
      success: true,
      data: alert.getDetailed(),
      message: 'Alert updated successfully'
    });
    
  } catch (error) {
    logger.error('Error updating alert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error updating alert'
    });
  }
};

// Resolve alert
export const resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.userId;
    const { notes } = req.body;
    
    const alert = await Alert.findOne({ _id: alertId, userId });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    await alert.resolve(userId, notes);
    
    res.status(200).json({
      success: true,
      data: alert.getDetailed(),
      message: 'Alert resolved successfully'
    });
    
  } catch (error) {
    logger.error('Error resolving alert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error resolving alert'
    });
  }
};

// Snooze alert
export const snoozeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.userId;
    const { duration } = req.body; // duration in milliseconds
    
    if (!duration || duration < 300000) { // minimum 5 minutes
      return res.status(400).json({
        success: false,
        message: 'Duration is required and must be at least 5 minutes'
      });
    }
    
    const alert = await Alert.findOne({ _id: alertId, userId });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    await alert.snooze(duration);
    
    res.status(200).json({
      success: true,
      data: alert.getDetailed(),
      message: 'Alert snoozed successfully'
    });
    
  } catch (error) {
    logger.error('Error snoozing alert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error snoozing alert'
    });
  }
};

// Delete alert (soft delete)
export const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.userId;
    
    const alert = await Alert.findOne({ _id: alertId, userId });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    alert.isArchived = true;
    await alert.save();
    
    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully'
    });
    
  } catch (error) {
    logger.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error deleting alert'
    });
  }
};

// Get alert statistics
export const getAlertStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '24h':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
        break;
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) } };
        break;
    }
    
    const query = { userId, isArchived: false, ...dateFilter };
    
    const [
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      resolvedAlerts
    ] = await Promise.all([
      Alert.countDocuments(query),
      Alert.countDocuments({ ...query, status: 'active' }),
      Alert.countDocuments({ ...query, severity: 'critical' }),
      Alert.countDocuments({ ...query, status: 'resolved' })
    ]);
    
    const stats = {
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      resolvedAlerts,
      resolutionRate: totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 0
    };
    
    res.status(200).json({
      success: true,
      data: stats,
      message: 'Alert statistics retrieved successfully'
    });
    
  } catch (error) {
    logger.error('Error retrieving alert statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving alert statistics'
    });
  }
};

// Acknowledge all alerts
export const acknowledgeAllAlerts = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await Alert.updateMany(
      { userId, status: 'active', isArchived: false },
      { status: 'monitoring' }
    );
    res.status(200).json({
      success: true,
      data: { acknowledgedCount: result.modifiedCount },
      message: 'All alerts acknowledged successfully'
    });
    
  } catch (error) {
    logger.error('Error acknowledging all alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error acknowledging alerts'
    });
  }
};
