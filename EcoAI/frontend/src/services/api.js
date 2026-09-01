const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  let cleanUrl = envUrl.replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl += '/api';
  }
  return cleanUrl;
};

const API_BASE_URL = getBaseURL();

export const getAuthToken = () => localStorage.getItem("ecoai_token");
export const setAuthToken = (token) => localStorage.getItem("ecoai_token") ? localStorage.setItem("ecoai_token", token) : localStorage.setItem("ecoai_token", token);
export const removeAuthToken = () => localStorage.removeItem("ecoai_token");

async function fetchAPI(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = { ...options.headers };

  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn(`API call error on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  register: (userData) => fetchAPI("/auth/register", { method: "POST", body: JSON.stringify(userData) }),
  login: (credentials) => fetchAPI("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  forgotPassword: (data) => fetchAPI("/auth/forgot-password", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => fetchAPI("/auth/me"),

  // Profile & Progressive Onboarding
  getProfile: () => fetchAPI("/profile/"),
  updateProfile: (data) => fetchAPI("/profile/", { method: "PUT", body: JSON.stringify(data) }),
  getProfileCompleteness: () => fetchAPI("/profile/completeness"),
  submitOnboardingStep: (step, data) => fetchAPI("/profile/onboarding-step", { method: "POST", body: JSON.stringify({ step, data }) }),
  getProfileVersions: () => fetchAPI("/profile/versions"),

  // Privacy & Data Center
  getConsent: () => fetchAPI("/privacy/consent"),
  updateConsent: (data) => fetchAPI("/privacy/consent", { method: "POST", body: JSON.stringify(data) }),
  exportUserData: () => fetchAPI("/privacy/export-data"),
  deleteAccount: () => fetchAPI("/privacy/delete-account", { method: "DELETE" }),

  // Organization & Government Portal API
  getOrgSummary: (region = "Chennai") => fetchAPI(`/org/summary?region=${encodeURIComponent(region)}`),
  getOrgEmissions: () => fetchAPI("/org/emissions"),
  getOrgReductionTrends: () => fetchAPI("/org/reduction-trends"),
  getCityComparison: () => fetchAPI("/org/city-comparison"),
  getRegionalInsights: () => fetchAPI("/org/regional-insights"),
  getOrgCategoryAnalysis: () => fetchAPI("/org/category-analysis"),
  createOrgCampaign: (data) => fetchAPI("/org/campaigns", { method: "POST", body: JSON.stringify(data) }),
  getOrgCampaigns: () => fetchAPI("/org/campaigns"),
  joinOrgCampaign: (id) => fetchAPI(`/org/campaigns/${id}/join`, { method: "POST" }),
  runPolicySimulator: (params) => fetchAPI("/org/policy-simulator", { method: "POST", body: JSON.stringify(params) }),
  getPolicyRecommendations: () => fetchAPI("/org/policy-recommendations"),
  createOrgGoal: (data) => fetchAPI("/org/goals", { method: "POST", body: JSON.stringify(data) }),
  getOrgGoals: () => fetchAPI("/org/goals"),

  // Carbon & Analytics
  calculateCarbon: (formData) => fetchAPI("/carbon/calculate", { method: "POST", body: JSON.stringify(formData) }),
  getHistory: (timeFrame = "all") => fetchAPI(`/carbon/history?time_frame=${timeFrame}`),
  getSummary: () => fetchAPI("/carbon/summary"),
  getLatest: () => fetchAPI("/carbon/latest"),
  getRootCauseAnalysis: () => fetchAPI("/carbon/root-cause-analysis"),
  getPersonalBaseline: () => fetchAPI("/carbon/baseline"),
  getWallet: () => fetchAPI("/carbon/wallet"),
  getCalculationExplain: () => fetchAPI("/carbon/transparency-explain"),
  deleteRecord: (id) => fetchAPI(`/carbon/${id}`, { method: "DELETE" }),

  // AI Predictions, Optimization & Action Plans
  getPrediction: () => fetchAPI("/predict/latest"),
  getTop3Actions: () => fetchAPI("/predict/top-3-actions"),
  get5DayPlan: () => fetchAPI("/predict/5-day-plan"),
  get5DayChallenge: () => fetchAPI("/predict/5-day-challenge"),
  submitDailyReflection: (data) => fetchAPI("/predict/daily-reflection", { method: "POST", body: JSON.stringify(data) }),
  chatEcoAIAssistant: (message) => fetchAPI("/predict/chat-assistant", { method: "POST", body: JSON.stringify({ message }) }),
  toggle5DayPlan: (day) => fetchAPI("/predict/5-day-plan/toggle", { method: "POST", body: JSON.stringify({ day }) }),
  reset5DayPlan: () => fetchAPI("/predict/5-day-plan/reset", { method: "POST" }),
  getFutureMeScenarios: () => fetchAPI("/predict/future-me-scenarios"),
  optimizeReduction: (target_reduction_kg) => fetchAPI(`/predict/optimize-reduction?target_reduction_kg=${target_reduction_kg}`, { method: "POST" }),
  logRecommendationFeedback: (data) => fetchAPI(`/predict/recommendation-feedback?recommendation_title=${encodeURIComponent(data.title)}&category=${encodeURIComponent(data.category)}&expected_reduction=${data.expected}&observed_reduction=${data.observed}`, { method: "POST" }),
  getRecommendationFeedback: () => fetchAPI("/predict/recommendation-feedback"),

  // OCR Bill Scanner
  scanBill: (formData) => fetchAPI("/ocr/scan-bill", { method: "POST", body: formData }),
  confirmBillScan: (scanId, data) => fetchAPI(`/ocr/confirm-bill/${scanId}`, { method: "POST", body: JSON.stringify(data) }),

  // Daily Check-In
  submitCheckin: (data) => fetchAPI("/checkin/submit", { method: "POST", body: JSON.stringify(data) }),
  getTodayCheckin: () => fetchAPI("/checkin/today"),

  // Experiments
  getAvailableExperiments: () => fetchAPI("/experiments/available"),
  startExperiment: (title, predicted_reduction) => fetchAPI("/experiments/start", { method: "POST", body: JSON.stringify({ title, predicted_reduction }) }),
  getActiveExperiment: () => fetchAPI("/experiments/active"),
  completeExperiment: (expId, actual_reduction_kg = 13.0) => fetchAPI(`/experiments/complete/${expId}?actual_reduction_kg=${actual_reduction_kg}`, { method: "POST" }),

  // Advanced Analytics
  getImpactEquivalents: () => fetchAPI("/analytics/impact-equivalents"),
  getHabitCorrelations: () => fetchAPI("/analytics/correlations"),
  getDataQuality: () => fetchAPI("/analytics/data-quality"),
  getTransparencyBreakdown: () => fetchAPI("/analytics/transparency-breakdown"),
  analyzeTradeoff: (distance_km = 10.0, priority = "Balanced") => fetchAPI("/analytics/tradeoff", { method: "POST", body: JSON.stringify({ distance_km, priority }) }),

  // Simulator
  getSimulatorBaseline: () => fetchAPI("/simulator/baseline"),
  runSimulation: (params) => fetchAPI("/simulator/run", { method: "POST", body: JSON.stringify(params) }),

  // Carbon Budget & 30-Day Goal
  getBudget: () => fetchAPI("/budget/"),
  updateBudget: (monthly_budget) => fetchAPI("/budget/target", { method: "POST", body: JSON.stringify({ monthly_budget }) }),
  get30DayGoal: () => fetchAPI("/budget/goal"),
  update30DayGoal: (target_reduction_pct) => fetchAPI("/budget/goal", { method: "POST", body: JSON.stringify({ target_reduction_pct }) }),

  // Gamification
  getGamification: () => fetchAPI("/gamification/"),
  getStreak: () => fetchAPI("/gamification/streak"),
  getChallenges: () => fetchAPI("/gamification/challenges"),
  claimChallenge: (challengeId) => fetchAPI(`/gamification/claim-challenge/${challengeId}`, { method: "POST" }),

  // Reports
  getReportData: () => fetchAPI("/reports/pdf-data"),

  // Admin
  getAdminUsers: (city = "all") => fetchAPI(`/admin/users?city=${city}`),
  getAdminStats: (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return fetchAPI(`/admin/stats${query ? '?' + query : ''}`);
  },
  getModelPerformance: () => fetchAPI("/admin/model-performance"),
  trainModel: () => fetchAPI("/admin/train-model", { method: "POST" }),
  getAuditLogs: () => fetchAPI("/admin/audit-logs"),
  getUserFootprintDetail: (userId) => fetchAPI(`/admin/user/${userId}/footprint`),
  getRecommendations: () => fetchAPI("/admin/recommendations"),
  createRecommendation: (recData) => fetchAPI("/admin/recommendations", { method: "POST", body: JSON.stringify(recData) }),
  deleteRecommendation: (id) => fetchAPI(`/admin/recommendations/${id}`, { method: "DELETE" })
};
