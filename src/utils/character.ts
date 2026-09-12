import { Critical } from "./critical";
import { 
    attack,
    AttackType,
    ArmorType,
    Environments,
    AdaptationLevel,
    getEnvironmentMultiplier,
    getCoverMultiplier,
    getDamageMultiplier
} from "./attack";

/**
 * 角色基类
 * 所有角色继承此类
 */
export class Character {
  // ========== 基础属性 ==========
  /** 生命值 */
  public Health: number = 500;
  /** 基础攻击力 */
  public BaseDamage: number = 200;
  /** 基础暴击率（0~1） */
  public CriticalRate: number = 0.5;
  /** 基础防御减伤率（0~1，例如0.3表示减免30%） */
  public BaseResistance: number = 0.3;
  /** 暴击抵抗（0~1，与攻击者暴击率相减） */
  public CriticalResistance: number = 0.5;
  /** 攻击类型（影响属性克制） */
  public AttackType: AttackType = AttackType.Explosive;
  /** 护甲类型（影响属性克制） */
  public ArmorType: ArmorType = ArmorType.Heavy;
  /** 三种地形适应等级 */
  public AdaptationLevel: Record<Environments, AdaptationLevel> = {
    [Environments.Urban]: AdaptationLevel.A,
    [Environments.Outdoor]: AdaptationLevel.A,
    [Environments.Indoor]: AdaptationLevel.A,
  };
  /** 角色费用（EX技能点消耗） */
  public Cost: number = 2;
  /** 升级费用 */
  public UpgradeFee: number = 300;

  // ========== 状态列表（用于UI展示） ==========
  /** 当前生效的增益Buff列表 */
  public Buff: { id: string; remaining: number; bonus: number }[] = [];
  /** 当前生效的减益Debuff列表 */
  public DeBuff: { id: string; remaining: number; bonus: number }[] = [];

  // ========== 内部组件 ==========
  /** 暴击判定器实例（每个角色独立） */
  private crit: Critical;

  // ========== 构造函数 ==========
  constructor() {
    // 根据角色基础暴击率创建判定器
    this.crit = new Critical(this.CriticalRate);
    // 设置Buff过期回调，自动维护Buff/Debuff列表
    this.crit.setOnBuffExpired((id, bonus) => {
      if (bonus >= 0) {
        this.removeFromList(this.Buff, id);
      } else {
        this.removeFromList(this.DeBuff, id);
      }
    });
  }

  // ========== 私有辅助方法 ==========
  /**
   * 从列表中移除指定ID的条目
   * @param list 列表引用
   * @param id 要移除的ID
   */
  private removeFromList(list: { id: string }[], id: string): void {
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) list.splice(index, 1);
  }

  // ========== 暴击Buff管理（公共API） ==========
  /**
   * 添加暴击率Buff（可正可负）
   * @param times 持续攻击次数（必须>0）
   * @param bonus 加成值（正数增益，负数减益）
   * @param customId 可选自定义ID
   * @returns Buff ID，若添加失败返回空字符串
   */
  public addCriticalBuff(times: number, bonus: number, customId?: string): string {
    const id = this.crit.addCriticalBuff(times, bonus, customId);
    if (!id) return '';

    const entry = { id, remaining: times, bonus };
    if (bonus >= 0) {
      this.Buff.push(entry);
    } else {
      this.DeBuff.push(entry);
    }
    return id;
  }

  /**
   * 删除指定ID的Buff（无论正负）
   * @param id Buff ID
   * @returns 是否成功删除
   */
  public removeCriticalBuff(id: string): boolean {
    // removeBuffById会触发回调，自动从列表中移除
    return this.crit.removeBuffById(id);
  }

  /**
   * 修改指定Buff的剩余次数
   * @param id Buff ID
   * @param remaining 新的剩余次数（>=0，为0则移除）
   * @returns 是否成功
   */
  public setBuffRemaining(id: string, remaining: number): boolean {
    const success = this.crit.setBuffRemaining(id, remaining);
    if (success) {
      // 同步更新列表中的remaining值（供UI显示）
      const all = [...this.Buff, ...this.DeBuff];
      const found = all.find(item => item.id === id);
      if (found) found.remaining = remaining;
    }
    return success;
  }

  /**
   * 获取当前所有活跃Buff列表（包括增益和减益）
   */
  public getAllActiveBuffs(): { id: string; remaining: number; bonus: number }[] {
    return this.crit.getActiveBuffs();
  }

  /**
   * 获取当前实时暴击率（含所有Buff加成，但未扣减暴击抵抗）
   */
  public getCurrentCriticalRate(): number {
    return this.crit.getCurrentCriticalRate();
  }

  /**
   * 清除所有Buff
   * @param triggerCallback 是否触发过期回调，默认true
   */
  public clearAllBuffs(triggerCallback: boolean = true): void {
    this.crit.clearAllBuffs(triggerCallback);
    if (!triggerCallback) {
      this.Buff = [];
      this.DeBuff = [];
    }
  }
}


export const Skill = {
  Defense: {
    DamageReduction: () => {},
    Shield: () => {},
  },
  Attack: {
    DamageBoost: () => {},
  },
  Recover: {
    Recover: () => {},
  },
  Buff: {
    /**
     * 增加暴击率 Buff
     * @param character - 目标角色实例（通常传入 this）
     * @param times - 持续攻击次数，默认 3
     * @param bonus - 暴击率加成（小数），默认 +0.5（50%）
     * @returns Buff ID
     */
    IncreaseCriticalRate: (
      character: Character,
      times: number = 3,
      bonus: number = 0.5
    ): string => {
      const id = character.addCriticalBuff(times, bonus);
      console.log(
        `给 ${character.constructor.name} 添加暴击Buff，ID: ${id}，持续 ${times} 次攻击，+${bonus * 100}%`
      );
      return id;
    },
    IncreaseCriticalDamage: () => {},
  },
  DeBuff: {
    /**
     * 降低暴击率 DeBuff（负面效果）
     * @param character - 目标角色实例
     * @param times - 持续攻击次数，默认 2
     * @param bonus - 暴击率减益（负数），默认 -0.3（-30%）
     * @returns Buff ID
     */
    LowerCriticalRate: (
      character: Character,
      times: number = 2,
      bonus: number = -0.3
    ): string => {
      const id = character.addCriticalBuff(times, bonus);
      console.log(
        `给 ${character.constructor.name} 添加暴击Debuff，ID: ${id}，持续 ${times} 次攻击，${bonus * 100}%`
      );
      return id;
    },
    LowerCriticalDamage: () => {},
  },
};
