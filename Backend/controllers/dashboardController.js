import Scan from '../models/Scan.js';
import Alert from '../models/Alert.js';
import UserProgress from '../models/UserProgress.js';
import { logger } from '../utils/logger.js';

// Get comprehensive dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
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
    
    // Get scan statistics
    const [
      totalScans,
      completedScans,
      scansWithThreats,
      avgScanTime,
      scanTrends
    ] = await Promise.all([
      Scan.countDocuments(query),
      Scan.countDocuments({ ...query, status: 'completed' }),
      Scan.countDocuments({ ...query, 'threats.0': { $exists: true } }),
      Scan.aggregate([
        { $match: { ...query, status: 'completed' } },
        { $group: { _id: null, avgTime: { $avg: '$scanTime' } } }
      ]),
      Scan.aggregate([
        { $match: { ...query, status: 'completed' } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 },
            avgTime: { $avg: '$scanTime' }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ])
    ]);
    
    // Get alert statistics
    const [
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      resolvedAlerts,
      alertTrends
    ] = await Promise.all([
      Alert.countDocuments(query),
      Alert.countDocuments({ ...query, status: 'active' }),
      Alert.countDocuments({ ...query, severity: 'critical' }),
      Alert.countDocuments({ ...query, status: 'resolved' }),
      Alert.aggregate([
        { $match: { ...query, status: 'active' } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ])
    ]);
    
    // Get training progress
    const userProgress = await UserProgress.getUserOverallProgress(userId);
    
    // Calculate threat distribution
    const threatDistribution = await Scan.aggregate([
      { $match: { ...query, 'threats.0': { $exists: true } } },
      { $unwind: '$threats' },
      {
        $group: {
          _id: '$threats.type',
          count: { $sum: 1 },
          totalSeverity: { $sum: { $cond: [{ $eq: ['$threats.severity', 'critical'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Calculate scan performance metrics
    const performanceMetrics = {
      avgScanTime: avgScanTime.length > 0 ? Math.round(avgScanTime[0].avgTime) : 0,
      throughput: completedScans > 0 ? Math.round((completedScans / (period === '24h' ? 1 : period === '7d' ? 7 : 30)) * 24) : 0,
      uptime: 99.9, // Mock value - in production this would be calculated from system logs
      errorRate: totalScans > 0 ? Math.round(((totalScans - completedScans) / totalScans) * 100) : 0
    };
    
    // Calculate security score
    const securityScore = calculateSecurityScore({
      scansWithThreats,
      completedScans,
      criticalAlerts,
      totalAlerts,
      userProgress
    });
    
    // Get recent activity
    const recentActivity = await Scan.find({ userId, isArchived: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type content fileName status threats createdAt');
    
    const dashboardData = {
      overview: {
        totalScans,
        completedScans,
        scansWithThreats,
        cleanScans: completedScans - scansWithThreats,
        totalAlerts,
        activeAlerts,
        criticalAlerts,
        resolvedAlerts,
        securityScore
      },
      performance: performanceMetrics,
      training: userProgress,
      trends: {
        scans: scanTrends,
        alerts: alertTrends
      },
      threatDistribution,
      recentActivity: recentActivity.map(scan => ({
        id: scan._id,
        type: scan.type,
        content: scan.type === 'text' ? scan.content.substring(0, 50) + '...' : scan.fileName,
        status: scan.status,
        threatCount: scan.threats.length,
        createdAt: scan.createdAt
      }))
    };
    
    res.status(200).json({
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully'
    });
    
  } catch (error) {
    logger.error('Error retrieving dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving dashboard data'
    });
  }
};

// Calculate security score based on various metrics
const calculateSecurityScore = (metrics) => {
  let score = 100;
  
  // Deduct points for threats detected
  if (metrics.completedScans > 0) {
    const threatRate = metrics.scansWithThreats / metrics.completedScans;
    score -= Math.round(threatRate * 30); // Max 30 points deduction for threats
  }
  
  // Deduct points for critical alerts
  if (metrics.totalAlerts > 0) {
    const criticalRate = metrics.criticalAlerts / metrics.totalAlerts;
    score -= Math.round(criticalRate * 25); // Max 25 points deduction for critical alerts
  }
  
  // Add points for training completion
  if (metrics.userProgress.totalModules > 0) {
    const trainingBonus = Math.round((metrics.userProgress.completionRate / 100) * 15);
    score += trainingBonus; // Max 15 points bonus for training
  }
  
  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, score));
};

// Get detailed analytics for reports
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'security', period = '30d' } = req.query;
    
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
    
    let analyticsData = {};
    
    switch (type) {
      case 'security':
        analyticsData = await getSecurityAnalytics(query);
        break;
      case 'threats':
        analyticsData = await getThreatAnalytics(query);
        break;
      case 'performance':
        analyticsData = await getPerformanceAnalytics(query);
        break;
      case 'compliance':
        analyticsData = await getComplianceAnalytics(query);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid analytics type'
        });
    }
    
    res.status(200).json({
      success: true,
      data: analyticsData,
      message: `${type} analytics retrieved successfully`
    });
    
  } catch (error) {
    logger.error('Error retrieving analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving analytics'
    });
  }
};

// Get security analytics
const getSecurityAnalytics = async (query) => {
  const [
    totalScans,
    threatsDetected,
    cleanScans,
    detectionRate,
    avgResponseTime
  ] = await Promise.all([
    Scan.countDocuments(query),
    Scan.countDocuments({ ...query, 'threats.0': { $exists: true } }),
    Scan.countDocuments({ ...query, threats: { $size: 0 } }),
    Scan.aggregate([
      { $match: { ...query, status: 'completed' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          withThreats: { $sum: { $cond: [{ $gt: [{ $size: '$threats' }, 0] }, 1, 0] } }
        }
      }
    ]),
    Scan.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $group: { _id: null, avgTime: { $avg: '$scanTime' } } }
    ])
  ]);
  
  const detectionRateCalc = detectionRate.length > 0 && detectionRate[0].total > 0
    ? Math.round(((detectionRate[0].total - detectionRate[0].withThreats) / detectionRate[0].total) * 100)
    : 100;
  
  const avgResponseTimeCalc = avgResponseTime.length > 0 ? Math.round(avgResponseTime[0].avgTime) : 0;
  
  return {
    totalScans,
    threatsDetected,
    cleanScans,
    detectionRate: detectionRateCalc,
    avgResponseTime: avgResponseTimeCalc
  };
};

// Get threat analytics
const getThreatAnalytics = async (query) => {
  const threatBreakdown = await Scan.aggregate([
    { $match: { ...query, 'threats.0': { $exists: true } } },
    { $unwind: '$threats' },
    {
      $group: {
        _id: {
          type: '$threats.type',
          severity: '$threats.severity'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  const severityCounts = await Scan.aggregate([
    { $match: { ...query, 'threats.0': { $exists: true } } },
    { $unwind: '$threats' },
    {
      $group: {
        _id: '$threats.severity',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return {
    threatBreakdown,
    severityCounts,
    totalThreats: threatBreakdown.reduce((sum, item) => sum + item.count, 0)
  };
};

// Get performance analytics
const getPerformanceAnalytics = async (query) => {
  const [
    avgScanTime,
    throughput,
    peakHours,
    errorRate
  ] = await Promise.all([
    Scan.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $group: { _id: null, avgTime: { $avg: '$scanTime' } } }
    ]),
    Scan.aggregate([
      { $match: { ...query, status: 'completed' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%H', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Scan.aggregate([
      { $match: { ...query, status: 'completed' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%H', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    Scan.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          errors: { $sum: { $cond: [{ $ne: ['$status', 'completed'] }, 1, 0] } }
        }
      }
    ])
  ]);
  
  return {
    avgScanTime: avgScanTime.length > 0 ? Math.round(avgScanTime[0].avgTime) : 0,
    throughput: throughput,
    peakHours: peakHours,
    errorRate: errorRate.length > 0 && errorRate[0].total > 0
      ? Math.round((errorRate[0].errors / errorRate[0].total) * 100)
      : 0
  };
};

// Get compliance analytics
const getComplianceAnalytics = async (query) => {
  // Mock compliance data - in production this would integrate with compliance systems
  return {
    gdprCompliance: 95,
    hipaaCompliance: 92,
    soxCompliance: 88,
    pciCompliance: 96,
    overallCompliance: 93,
    lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextAudit: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    complianceIssues: 3,
    remediationProgress: 85
  };
};

