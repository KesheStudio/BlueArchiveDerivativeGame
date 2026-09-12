import { Critical } from "./critical";

/**
 * 攻击类型枚举
 * 对应游戏中不同属性的攻击方式
 */
export enum AttackType {
    /** 通常攻击 */
    Normal,
    /** 爆发攻击 */
    Explosive,
    /** 贯穿攻击 */
    Penetration,
    /** 分解攻击（克制复合装甲） */
    Corrosive,
    /** 神秘攻击 */
    Mystic,
    /** 振动攻击 */
    Sonic,
}

/**
 * 护甲类型枚举
 * 对应游戏中不同属性的防御类型
 */
export enum ArmorType {
    /** 普通装甲 */
    Normal,
    /** 轻装甲 */
    Light,
    /** 重装甲 */
    Heavy,
    /** 复合装甲（2026年新增） */
    Composite,
    /** 特殊装甲 */
    Special,
    /** 弹性装甲 */
    Elastic,
}

/**
 * 环境类型枚举
 * 对应游戏中的战斗场地
 */
export enum Environments {
    /** 都市战 */
    Urban,
    /** 野外战 */
    Outdoor,
    /** 室内战 */
    Indoor,
}

/**
 * 地形适应等级枚举
 * 角色在不同地形下的适应评级
 */
export enum AdaptationLevel {
    /** SS 适应：130% 伤害，75% 掩体减伤 */
    SS,
    /** S 适应：120% 伤害，60% 掩体减伤 */
    S,
    /** A 适应：110% 伤害，45% 掩体减伤 */
    A,
    /** B 适应：100% 伤害，30% 掩体减伤 */
    B,
    /** C 适应：90% 伤害，15% 掩体减伤 */
    C,
    /** D 适应：80% 伤害，0% 掩体减伤 */
    D,
}

/**
 * 伤害倍率表
 * 
 * 官方攻防克制倍率：
 * 
 * | 护甲 \ 攻击 | Normal | Explosive | Penetration | Corrosive | Mystic | Sonic |
 * | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
 * | Normal Armor   | 100% | 100% | 100% | 100% | 100% | 100% |
 * | Light Armor    | 100% | 200% |  50% |  50% | 100% | 100% |
 * | Heavy Armor    | 100% | 100% | 200% | 150% |  50% |  50% |
 * | Composite Armor| 100% | 100% | 100% | 200% |  50% |  50% |
 * | Special Armor  | 100% |  50% | 100% | 100% | 200% | 150% |
 * | Elastic Armor  | 100% |  50% | 100% | 100% | 100% | 200% |
 * 
 * 倍率说明：100% = 1.0，200% = 2.0，150% = 1.5，50% = 0.5
 */
export const DamageTable: Record<AttackType, Record<ArmorType, number>> = {
    [AttackType.Normal]: {
        [ArmorType.Normal]: 1.0,
        [ArmorType.Light]: 1.0,
        [ArmorType.Heavy]: 1.0,
        [ArmorType.Composite]: 1.0,
        [ArmorType.Special]: 1.0,
        [ArmorType.Elastic]: 1.0,
    },
    [AttackType.Explosive]: {
        [ArmorType.Normal]: 1.0,
        [ArmorType.Light]: 2.0,
        [ArmorType.Heavy]: 1.0,
        [ArmorType.Composite]: 1.0,
        [ArmorType.Special]: 0.5,
        [ArmorType.Elastic]: 0.5,
    },
    [AttackType.Penetration]: {
        [ArmorType.Normal]: 1.0,
        [ArmorType.Light]: 0.5,
        [ArmorType.Heavy]: 2.0,
        [ArmorType.Composite]: 1.0,
        [ArmorType.Special]: 1.0,
        [ArmorType.Elastic]: 1.0,
    },
    [AttackType.Corrosive]: {
        [ArmorType.Normal]: 1.0,
        [ArmorType.Light]: 0.5,
        [ArmorType.Heavy]: 1.5,
        [ArmorType.Composite]: 2.0,
        [ArmorType.Special]: 1.0,
        [ArmorType.Elastic]: 1.0,
    },
    [AttackType.Mystic]: {
        [ArmorType.Normal]: 1.0,
        [ArmorType.Light]: 1.0,
        [ArmorType.Heavy]: 0.5,
        [ArmorType.Composite]: 0.5,
        [ArmorType.Special]: 2.0,
        [ArmorType.Elastic]: 1.0,
    },
    [AttackType.Sonic]: {
        [ArmorType.Normal]: 1.0,
        [ArmorType.Light]: 1.0,
        [ArmorType.Heavy]: 0.5,
        [ArmorType.Composite]: 0.5,
        [ArmorType.Special]: 1.5,
        [ArmorType.Elastic]: 2.0,
    },
};

/**
 * 地形伤害倍率表（按环境索引）
 * 
 * 用法：先确定战斗场景，再根据该场景下的适应等级取出倍率。
 * 
 * | 适应等级 | Urban | Outdoor | Indoor |
 * | :---: | :---: | :---: | :---: |
 * | SS | 130% | 130% | 130% |
 * | S  | 120% | 120% | 120% |
 * | A  | 110% | 110% | 110% |
 * | B  | 100% | 100% | 100% |
 * | C  |  90% |  90% |  90% |
 * | D  |  80% |  80% |  80% |
 * 
 * 倍率说明：130% = 1.3，120% = 1.2，110% = 1.1，100% = 1.0，90% = 0.9，80% = 0.8
 * 
 * 注：若未来官方对同一等级在不同地形下给予差异化倍率，可在此处调整。
 */
export const EnvironmentDamageTable: Record<Environments, Record<AdaptationLevel, number>> = {
    [Environments.Urban]: {
        [AdaptationLevel.SS]: 1.3,
        [AdaptationLevel.S]: 1.2,
        [AdaptationLevel.A]: 1.1,
        [AdaptationLevel.B]: 1.0,
        [AdaptationLevel.C]: 0.9,
        [AdaptationLevel.D]: 0.8,
    },
    [Environments.Outdoor]: {
        [AdaptationLevel.SS]: 1.3,
        [AdaptationLevel.S]: 1.2,
        [AdaptationLevel.A]: 1.1,
        [AdaptationLevel.B]: 1.0,
        [AdaptationLevel.C]: 0.9,
        [AdaptationLevel.D]: 0.8,
    },
    [Environments.Indoor]: {
        [AdaptationLevel.SS]: 1.3,
        [AdaptationLevel.S]: 1.2,
        [AdaptationLevel.A]: 1.1,
        [AdaptationLevel.B]: 1.0,
        [AdaptationLevel.C]: 0.9,
        [AdaptationLevel.D]: 0.8,
    },
};

/**
 * 掩体减伤倍率表
 * 
 * 根据适应等级获得掩体的减伤比例（即减少受到的伤害的百分比）：
 * 
 * | 适应等级 | 减伤倍率 |
 * | :---: | :---: |
 * | SS | 75% |
 * | S  | 60% |
 * | A  | 45% |
 * | B  | 30% |
 * | C  | 15% |
 * | D  |  0% |
 * 
 * 数值说明：0.75 表示减伤 75%，实际受到 25% 伤害；
 *           0.00 表示无减伤，受到 100% 伤害。
 */
export const CoverEffectTable: Record<AdaptationLevel, number> = {
    [AdaptationLevel.SS]: 0.75,
    [AdaptationLevel.S]: 0.60,
    [AdaptationLevel.A]: 0.45,
    [AdaptationLevel.B]: 0.30,
    [AdaptationLevel.C]: 0.15,
    [AdaptationLevel.D]: 0.00,
};

/**
 * 获取地形伤害倍率
 * @param env   - 环境类型
 * @param level - 适应等级
 * @returns 倍率数值（小数），例如 1.3 表示 130%
 */
export function getEnvironmentMultiplier(env: Environments, level: AdaptationLevel): number {
    return EnvironmentDamageTable[env]?.[level] ?? 1.0;
}

/**
 * 获取掩体减伤后的受伤倍率
 * @param level - 适应等级
 * @returns 受伤倍率（小数），例如 0.25 表示受到 25% 伤害（即减伤 75%）
 */
export function getCoverMultiplier(level: AdaptationLevel): number {
    const reduction = CoverEffectTable[level] ?? 0.0;
    return 1 - reduction; // 受伤倍率 = 1 - 减伤率
}

/**
 * 获取伤害倍率
 * @param attack - 攻击类型
 * @param armor  - 护甲类型
 * @returns 倍率数值，若未匹配则返回 1.0
 */
export function getDamageMultiplier(attack: AttackType, armor: ArmorType): number {
    return DamageTable[attack]?.[armor] ?? 1.0;
}

/**
 * 计算最终伤害
 * 
 * 伤害计算流程：
 * 1. 基础伤害 × 属性克制倍率 × 环境适应倍率
 * 2. 若暴击则 × 2
 * 3. 防御减伤：最终伤害 × (1 - 防御减免百分比)
 * 4. 掩体减伤：最终伤害 × 掩体受伤倍率
 * 
 * @param baseDamage           - 基础伤害值（正数）
 * @param baseResistance       - 目标基础防御减伤百分比，取值范围 [0, 1]
 *                               例如 0.2 表示减免 20% 伤害，0 表示无减免
 *                               若传入值超出 [0, 1] 范围，会自动限制到边界
 * @param attackType           - 攻击类型（参见 AttackType 枚举）
 * @param targetArmorType      - 目标护甲类型（参见 ArmorType 枚举）
 * @param environment          - 战斗环境（参见 Environments 枚举）
 * @param envLevel             - 攻击方在该环境下的适应等级（参见 AdaptationLevel 枚举）
 * @param targetCover          - 防御方的掩体适应等级（参见 AdaptationLevel 枚举）
 * @param critical             - 暴击判定器实例（Critical 类），用于判断本次攻击是否暴击
 * @param criticalResistance   - 目标的暴击抵抗值（小数），直接与暴击率相减，例如 0.1 表示 10% 抵抗
 * @returns 最终伤害值（浮点数，可能带小数）
 */
export function attack(
    baseDamage: number,
    baseResistance: number,
    attackType: AttackType,
    targetArmorType: ArmorType,
    environment: Environments,
    envLevel: AdaptationLevel,
    targetCover: AdaptationLevel,
    critical: Critical,
    criticalResistance: number
): number {
    const damageMultiplier = getDamageMultiplier(attackType, targetArmorType);
    const envMultiplier = getEnvironmentMultiplier(environment, envLevel);
    const coverMultiplier = getCoverMultiplier(targetCover);
    const isCrit = critical.isCritical(criticalResistance);

    let finalDamage = baseDamage * damageMultiplier * envMultiplier;
    if (isCrit) finalDamage *= 2;

    const resistanceRate = Math.min(Math.max(baseResistance, 0), 1);
    finalDamage = finalDamage * (1 - resistanceRate);

    finalDamage = finalDamage * coverMultiplier;
    return finalDamage;
}