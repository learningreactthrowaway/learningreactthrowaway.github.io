class Timer {
  private prevActivationTime: number;
  private cooldownTime: number;	

  constructor(c: number) {
    this.cooldownTime = c;
    this.prevActivationTime = Date.now();
  }

  /**
   * @returns {boolean}
   */
  public isOffCooldown() {
    return Date.now() - this.prevActivationTime > this.cooldownTime;
  }
  /**
   * 
   * @returns {number}
   */
  public getTimeLeft() {
    return Math.max(0, this.cooldownTime - (Date.now() - this.prevActivationTime));
  }
  /**
   * 
   * @returns {number}
   */
    public getTimePassed() {
      return Date.now() - this.prevActivationTime;
    }
  public reset() {
    this.prevActivationTime = Date.now();
  }
  public newCooldownTimeAndReset(cooldownTime: number) {
    this.cooldownTime = cooldownTime;
    this.reset();
  }
}

export default Timer;