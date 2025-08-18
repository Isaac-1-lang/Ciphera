import Scan from '../models/Scan.js';
import { logger } from '../utils/logger.js';
import { extractFileContent } from '../middleware/fileUpload.middleware.js';
import { detectSensitive } from '../utils/detection.js';

// Use the centralized sensitive data detector
const detectThreats = (content) => detectSensitive(content);

// Generate recommendations based on detected threats
const generateRecommendations = (threats) => {
  const recommendations = [];
  
  threats.forEach(threat => {
    switch (threat.type) {
      case 'Personal Information':
        recommendations.push('Mask or remove personal identifiers before sharing');
        recommendations.push('Use generic placeholders for sensitive data');
        break;
      case 'Financial Data':
        recommendations.push('Remove or encrypt financial information');
        recommendations.push('Use secure payment gateways instead of storing card data');
        break;
      case 'Credentials':
        recommendations.push('Never share API keys or passwords in plain text');
        recommendations.push('Use environment variables or secure vaults');
        break;
      case 'Network Information':
        recommendations.push('Avoid exposing internal network details');
        recommendations.push('Use public IP addresses when necessary');
        break;
      case 'Physical Address':
        recommendations.push('Remove or generalize physical addresses to protect privacy');
        recommendations.push('Share only city/region when necessary, not full addresses');
        break;
      case 'Health Information':
        recommendations.push('Remove or de-identify health-related identifiers');
        recommendations.push('Comply with privacy regulations when sharing health data');
        break;
      case 'Links':
        recommendations.push('Verify links do not expose private systems or tokens');
        break;
    }
  });
  
  // Add general recommendations
  if (threats.length > 0) {
    recommendations.push('Review content for any other sensitive information');
    recommendations.push('Consider using data anonymization tools');
  } else {
    recommendations.push('Content appears to be clean of common sensitive data patterns');
    recommendations.push('Continue to review content before sharing');
  }
  
  return [...new Set(recommendations)]; // Remove duplicates
};

// Scan text content
export const scanText = async (req, res) => {
  try {
    const { content, tags } = req.body;
    const userId = req.user.userId;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Content is required and must be a string'
      });
    }
    
    const startTime = Date.now();
    
    // Create scan record
    const scan = new Scan({
      userId,
      type: 'text',
      content,
      textLength: content.length,
      status: 'scanning',
      tags: tags || [],
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    await scan.save();
    
    // Simulate scanning process (in production, this would be async)
    const threats = detectThreats(content, 'text');
    const recommendations = generateRecommendations(threats);
    const scanTime = Date.now() - startTime;
    
    // Update scan with results
    scan.threats = threats;
    scan.recommendations = recommendations;
    scan.scanTime = scanTime;
    scan.status = 'completed';
    
    await scan.save();
    
    res.status(200).json({
      success: true,
      data: scan.getDetailedResults(),
      message: 'Text scan completed successfully'
    });
    
  } catch (error) {
    logger.error('Error in text scan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during text scan'
    });
  }
};

// Scan file content
export const scanFile = async (req, res) => {
  try {
    const { tags } = req.body;
    const userId = req.user.userId;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }
    
    const startTime = Date.now();
    
    // Extract content from uploaded file
    const content = await extractFileContent(req.file);
    
    // Create scan record
    const scan = new Scan({
      userId,
      type: 'file',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      content,
      status: 'scanning',
      tags: tags ? JSON.parse(tags) : [],
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    await scan.save();
    
    // Simulate file scanning process
    const threats = detectThreats(content, 'file');
    const recommendations = generateRecommendations(threats);
    const scanTime = Date.now() - startTime;
    
    // Update scan with results
    scan.threats = threats;
    scan.recommendations = recommendations;
    scan.scanTime = scanTime;
    scan.status = 'completed';
    
    await scan.save();
    
    res.status(200).json({
      success: true,
      data: scan.getDetailedResults(),
      message: 'File scan completed successfully'
    });
    
  } catch (error) {
    logger.error('Error in file scan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during file scan'
    });
  }
};

// Get scan history for user
export const getScanHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status, type, search } = req.query;
    
    const query = { userId, isArchived: false };
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };
    
    const scans = await Scan.paginate(query, options);
    
    // Transform data to include summaries
    const transformedScans = {
      ...scans,
      docs: scans.docs.map(scan => scan.getSummary())
    };
    
    res.status(200).json({
      success: true,
      data: transformedScans,
      message: 'Scan history retrieved successfully'
    });
    
  } catch (error) {
    logger.error('Error retrieving scan history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving scan history'
    });
  }
};

// Get scan details by ID
export const getScanDetails = async (req, res) => {
  try {
    const { scanId } = req.params;
    const userId = req.user.userId;
    
    const scan = await Scan.findOne({ _id: scanId, userId });
    
    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: scan.getDetailedResults(),
      message: 'Scan details retrieved successfully'
    });
    
  } catch (error) {
    logger.error('Error retrieving scan details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving scan details'
    });
  }
};

// Delete scan
export const deleteScan = async (req, res) => {
  try {
    const { scanId } = req.params;
    const userId = req.user.userId;
    
    const scan = await Scan.findOne({ _id: scanId, userId });
    
    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }
    
    // Soft delete by archiving
    scan.isArchived = true;
    await scan.save();
    res.status(200).json({
      success: true,
      message: 'Scan deleted successfully'
    });
    
  } catch (error) {
    logger.error('Error deleting scan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error deleting scan'
    });
  }
};

// Get scan statistics
export const getScanStats = async (req, res) => {
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
      totalScans,
      completedScans,
      scansWithThreats,
      avgScanTime
    ] = await Promise.all([
      Scan.countDocuments(query),
      Scan.countDocuments({ ...query, status: 'completed' }),
      Scan.countDocuments({ ...query, 'threats.0': { $exists: true } }),
      Scan.aggregate([
        { $match: { ...query, status: 'completed' } },
        { $group: { _id: null, avgTime: { $avg: '$scanTime' } } }
      ])
    ]);
    
    const stats = {
      totalScans,
      completedScans,
      scansWithThreats,
      cleanScans: completedScans - scansWithThreats,
      avgScanTime: avgScanTime.length > 0 ? Math.round(avgScanTime[0].avgTime) : 0,
      completionRate: totalScans > 0 ? Math.round((completedScans / totalScans) * 100) : 0,
      threatRate: completedScans > 0 ? Math.round((scansWithThreats / completedScans) * 100) : 0
    };
    
    res.status(200).json({
      success: true,
      data: stats,
      message: 'Scan statistics retrieved successfully'
    });
    
  } catch (error) {
    logger.error('Error retrieving scan statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving scan statistics'
    });
  }
};
