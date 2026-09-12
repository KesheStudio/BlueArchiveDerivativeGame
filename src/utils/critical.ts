export class Critical {
  // ---------- 私有属性 ----------
  private criticalRate: number = 0;          // 当前累计暴击率（含保底累加）
  private baseCriticalRate: number = 0;      // 基础暴击率
  private buffs: { id: string; remaining: number; bonus: number }[] = [];
  private idCounter: number = 0;
  private onBuffExpiredCallback?: (id: string, bonus: number) => void;

  // ---------- 构造函数 ----------
  /**
   * @param criticalRate 基础暴击率（小数，0.2 表示 20%）
   */
  constructor(criticalRate: number) {
    // 限制输入范围，防止非法值
    this.baseCriticalRate = Math.max(0, Math.min(1, criticalRate));
    this.criticalRate = this.baseCriticalRate;
  }

  // ---------- Buff 管理 ----------
  /**
   * 添加暴击率加成 Buff（允许负值作为减益）
   * @param times 持续攻击次数（必须 > 0）
   * @param bonus 加成值（小数，如 0.3 表示 +30%，-0.2 表示 -20%）
   * @param id 可选，若不提供则自动生成
   * @returns Buff ID
   */
  public addCriticalBuff(times: number, bonus: number, id?: string): string {
    if (times <= 0) return '';                // 次数必须为正
    // 保留原始 bonus 值，不做限制（可在计算时统一 clamp）
    const buffId = id || `buff_${++this.idCounter}`;
    this.buffs.push({ id: buffId, remaining: times, bonus });
    return buffId;
  }

  /**
   * 删除指定 ID 的 Buff，并触发过期回调
   * @param id Buff ID
   * @returns 是否成功删除
   */
  public removeBuffById(id: string): boolean {
    const index = this.buffs.findIndex(b => b.id === id);
    if (index === -1) return false;
    const buff = this.buffs[index];
    this.buffs.splice(index, 1);
    if (!buff) return false;
    this.triggerBuffExpired(buff.id, buff.bonus);
    return true;
  }

  /**
   * 设置指定 Buff 的剩余次数（可增加或减少），若剩余 ≤ 0 则移除
   * @param id Buff ID
   * @param remaining 新的剩余次数（≥ 0）
   * @returns 是否成功
   */
  public setBuffRemaining(id: string, remaining: number): boolean {
    if (remaining < 0) return false;          // 不允许负数
    const buff = this.buffs.find(b => b.id === id);
    if (!buff) return false;
    if (remaining === 0) {
      // 剩余次数为 0，直接移除
      return this.removeBuffById(id);
    } else {
      buff.remaining = remaining;
      return true;
    }
  }

  /**
   * 获取指定 Buff 的当前信息（只读副本）
   */
  public getBuffInfo(id: string): { remaining: number; bonus: number } | null {
    const buff = this.buffs.find(b => b.id === id);
    return buff ? { remaining: buff.remaining, bonus: buff.bonus } : null;
  }

  // ---------- 暴击判定 ----------
  /**
   * 判断是否暴击（应用所有活跃 Buff，并消耗次数）
   * @param criticalResistance 目标的暴击抵抗（小数）
   * @returns 是否暴击
   */
  public isCritical(criticalResistance: number = 0): boolean {
    // 1. 计算所有活跃 Buff 的总加成（支持负数）
    let totalBonus = 0;
    for (const buff of this.buffs) {
      if (buff.remaining > 0) {
        totalBonus += buff.bonus;
      }
    }

    // 2. 有效暴击率 = 当前累计率 - 抵抗 + 总加成，并 clamp 在 [0, 1]
    let effectiveRate = this.criticalRate - criticalResistance + totalBonus;
    effectiveRate = Math.max(0, Math.min(1, effectiveRate));

    // 3. 随机判定
    const isHit = Math.random() < effectiveRate;

    // 4. 更新保底状态（未暴击累加基础值，暴击后重置为基础值）
    if (isHit) {
      this.criticalRate = this.baseCriticalRate;
    } else {
      this.criticalRate += this.baseCriticalRate;
      // 可选：限制累加值不超过 1（但累加设计本身允许超过，仅用于提升概率）
      // 这里不做限制，因为计算时还会 clamp
    }

    // 5. 消耗所有 Buff 次数，并收集过期的 Buff 统一触发回调
    const expired: { id: string; bonus: number }[] = [];
    for (let i = this.buffs.length - 1; i >= 0; i--) {
      const buff = this.buffs[i];
      if (buff && buff.remaining > 0) {      // 只处理剩余次数 > 0 的
        buff.remaining--;
        if (buff.remaining === 0) {
          expired.push({ id: buff.id, bonus: buff.bonus });
          this.buffs.splice(i, 1);
        }
      }
    }

    // 6. 统一触发过期回调（避免回调中修改 buffs 干扰遍历）
    for (const e of expired) {
      this.triggerBuffExpired(e.id, e.bonus);
    }

    return isHit;
  }

  // ---------- 动态调整基础暴击率 ----------
  /**
   * 修改基础暴击率（动态调整，例如装备、Buff）
   * @param criticalRate 新的基础暴击率
   */
  public upBaseCriticalRate(criticalRate: number): void {
    // 限制输入范围
    const newBase = Math.max(0, Math.min(1, criticalRate));
    // 保留当前累加量（current - oldBase）
    const accumulated = this.criticalRate - this.baseCriticalRate;
    this.baseCriticalRate = newBase;
    // 新当前率 = 新基础 + 累加量（累加量可能为负，但会被后续 clamp）
    this.criticalRate = newBase + accumulated;
    // 可选：将 current 也 clamp 到 [0, 1]，但为保留累加机制，不强制
    // 但为安全，可以限制：this.criticalRate = Math.max(0, this.criticalRate);
  }

  // ---------- 回调管理 ----------
  /**
   * 设置 Buff 过期回调（当 Buff 被移除时触发）
   * @param callback 回调函数，接收 Buff 的 id 和 bonus
   */
  public setOnBuffExpired(callback: (id: string, bonus: number) => void): void {
    this.onBuffExpiredCallback = callback;
  }

  /**
   * 触发过期回调（内部使用）
   */
  private triggerBuffExpired(id: string, bonus: number): void {
    if (this.onBuffExpiredCallback) {
      this.onBuffExpiredCallback(id, bonus);
    }
  }

  // ---------- Getter ----------
  /**
   * 获取当前暴击率（包含保底累加值，用于显示实时概率）
   */
  public getCurrentCriticalRate(): number {
    return Math.max(0, Math.min(1, this.criticalRate));
  }

  /**
   * 获取基础暴击率
   */
  public getBaseCriticalRate(): number {
    return this.baseCriticalRate;
  }

  /**
   * 获取所有活跃 Buff 的列表（用于 UI 显示）
   */
  public getActiveBuffs(): { id: string; remaining: number; bonus: number }[] {
    return this.buffs.slice();
  }

  // ---------- 工具方法 ----------
  /**
   * 清除所有 Buff（例如战斗结束），可选择是否触发回调
   * @param triggerCallback 是否触发每个 Buff 的过期回调，默认 true
   */
  public clearAllBuffs(triggerCallback: boolean = true): void {
    if (triggerCallback && this.onBuffExpiredCallback) {
      // 复制一份，避免回调中修改原数组
      const copy = this.buffs.slice();
      for (const buff of copy) {
        this.onBuffExpiredCallback(buff.id, buff.bonus);
      }
    }
    this.buffs = [];
  }

  /**
   * 重置暴击状态（重置概率为初始值，不清除 Buff）
   */
  public resetCriticalRate(): void {
    this.criticalRate = this.baseCriticalRate;
  }
}