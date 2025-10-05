// Rate limiter utility to prevent excessive API calls
class RateLimiter {
  private lastCall: { [key: string]: number } = {};
  private minInterval: number;

  constructor(minIntervalMs: number = 1000) {
    this.minInterval = minIntervalMs;
  }

  canCall(key: string): boolean {
    const now = Date.now();
    const lastCall = this.lastCall[key] || 0;
    
    if (now - lastCall < this.minInterval) {
      console.warn(`🚫 Rate limit: Blocking ${key} call (${now - lastCall}ms since last call)`);
      return false;
    }
    
    this.lastCall[key] = now;
    return true;
  }

  reset(key?: string) {
    if (key) {
      delete this.lastCall[key];
    } else {
      this.lastCall = {};
    }
  }
}

export const apiRateLimiter = new RateLimiter(2000); // 2 second minimum between calls
export default RateLimiter;