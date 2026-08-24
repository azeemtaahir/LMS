import { ReportModel } from '../models/reportModel.js';

export const getReportsAnalytics = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const analytics = await ReportModel.getAnalytics({ dateFrom, dateTo });
    res.status(200).json(analytics);
  } catch (error) {
    console.error("Failed to fetch database reports analytics:", error);
    res.status(500).json({ message: 'Error fetching report analytics', error: error.message });
  }
};
