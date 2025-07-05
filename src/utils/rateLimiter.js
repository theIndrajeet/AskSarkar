// Rate Limiter for Gemini API
// Tracks daily usage and enforces client-side rate limits

const STORAGE_KEY = 'gemini_api_usage';
const DAILY_LIMIT = 50; // Free tier limit
const WARNING_THRESHOLD = 40; // Show warning at 80% usage
const RESET_HOUR = 0; // Reset at midnight

class RateLimiter {
  constructor() {
    this.usage = this.loadUsage();
    this.checkAndResetIfNeeded();
  }

  loadUsage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading usage data:', error);
    }
    
    return {
      count: 0,
      date: new Date().toDateString(),
      firstCallTime: null,
      lastCallTime: null,
      blockedCalls: 0
    };
  }

  saveUsage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.usage));
    } catch (error) {
      console.error('Error saving usage data:', error);
    }
  }

  checkAndResetIfNeeded() {
    const today = new Date().toDateString();
    if (this.usage.date !== today) {
      // Reset for new day
      this.usage = {
        count: 0,
        date: today,
        firstCallTime: null,
        lastCallTime: null,
        blockedCalls: 0
      };
      this.saveUsage();
    }
  }

  canMakeRequest() {
    this.checkAndResetIfNeeded();
    return this.usage.count < DAILY_LIMIT;
  }

  recordRequest() {
    this.checkAndResetIfNeeded();
    
    if (!this.canMakeRequest()) {
      this.usage.blockedCalls++;
      this.saveUsage();
      return false;
    }

    this.usage.count++;
    this.usage.lastCallTime = new Date().toISOString();
    if (!this.usage.firstCallTime) {
      this.usage.firstCallTime = this.usage.lastCallTime;
    }
    this.saveUsage();
    return true;
  }

  getUsageInfo() {
    this.checkAndResetIfNeeded();
    
    const remaining = Math.max(0, DAILY_LIMIT - this.usage.count);
    const percentageUsed = (this.usage.count / DAILY_LIMIT) * 100;
    const shouldShowWarning = this.usage.count >= WARNING_THRESHOLD;
    const isLimitReached = this.usage.count >= DAILY_LIMIT;
    
    // Calculate time until reset
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(RESET_HOUR, 0, 0, 0);
    const hoursUntilReset = Math.ceil((tomorrow - now) / (1000 * 60 * 60));

    return {
      used: this.usage.count,
      limit: DAILY_LIMIT,
      remaining,
      percentageUsed,
      shouldShowWarning,
      isLimitReached,
      hoursUntilReset,
      blockedCalls: this.usage.blockedCalls,
      firstCallTime: this.usage.firstCallTime,
      lastCallTime: this.usage.lastCallTime
    };
  }

  // Force reset (for testing or manual override)
  forceReset() {
    this.usage = {
      count: 0,
      date: new Date().toDateString(),
      firstCallTime: null,
      lastCallTime: null,
      blockedCalls: 0
    };
    this.saveUsage();
  }

  // Get a user-friendly message about current usage
  getUsageMessage() {
    const info = this.getUsageInfo();
    
    if (info.isLimitReached) {
      return {
        type: 'error',
        message: `Daily limit reached (${info.limit} requests). The limit will reset in ${info.hoursUntilReset} hours. You can still use the manual form option.`,
        showFallback: true
      };
    }
    
    if (info.shouldShowWarning) {
      return {
        type: 'warning',
        message: `You have ${info.remaining} AI requests remaining today. Consider using the manual form to save your quota.`,
        showFallback: false
      };
    }
    
    if (info.percentageUsed > 50) {
      return {
        type: 'info',
        message: `${info.remaining} AI requests remaining today.`,
        showFallback: false
      };
    }
    
    return null;
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;
export { DAILY_LIMIT, WARNING_THRESHOLD }; 