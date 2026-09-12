import assert from 'assert';
import { Critical } from '../utils/critical.ts';
import {
    AttackType,
    ArmorType,
    Environments,
    AdaptationLevel,
    attack,
} from '@utils/attack';

// ---------- 简单测试运行器 ----------
const tests: { name: string; fn: () => void }[] = [];
function test(name: string, fn: () => void) {
    tests.push({ name, fn });
}

let passed = 0;
let failed = 0;
function run() {
    for (const t of tests) {
        try {
            t.fn();
            console.log(`✓ ${t.name}`);
            passed++;
        } catch (err) {
            console.error(`✗ ${t.name}`);
            console.error(err);
            failed++;
        }
    }
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed === 0 ? 0 : 1);
}

// ---------- Math.random 模拟工具 ----------
let originalRandom: () => number;
function mockRandom(values: number[]) {
    originalRandom = Math.random;
    let index = 0;
    Math.random = () => {
        const value = values[index % values.length];
        index++;
        return value;
    };
}
function restoreRandom() {
    Math.random = originalRandom;
}

// 近似相等断言，处理浮点数精度
function assertClose(actual: number, expected: number, epsilon = 1e-9) {
    assert.ok(
        Math.abs(actual - expected) < epsilon,
        `Expected ${actual} to be close to ${expected} (epsilon=${epsilon})`
    );
}

// ---------- Critical 类测试 ----------
test('Critical: 未暴击时积累概率，后续暴击', () => {
    const crit = new Critical(0.25);
    mockRandom([0.5, 0.4]);
    try {
        assert.strictEqual(crit.isCritical(0), false);
        assert.strictEqual(crit.isCritical(0), true);
    } finally {
        restoreRandom();
    }
});

test('Critical: 暴击抵抗降低实际概率', () => {
    const crit = new Critical(0.5);
    mockRandom([0.15]);
    try {
        assert.strictEqual(crit.isCritical(0.3), true);
    } finally {
        restoreRandom();
    }
});

test('Critical: 抵抗过高永不暴击且积累概率增加', () => {
    const crit = new Critical(0.2);
    mockRandom([0.1, 0.1, 0.1]);
    try {
        assert.strictEqual(crit.isCritical(0.5), false);
        assert.strictEqual(crit.isCritical(0.5), false);
    } finally {
        restoreRandom();
    }
});

test('Critical: 暴击后概率重置', () => {
    const crit = new Critical(0.3);
    mockRandom([0.1, 0.2]);
    try {
        assert.strictEqual(crit.isCritical(0), true);
        assert.strictEqual(crit.isCritical(0), true);
    } finally {
        restoreRandom();
    }
});

// ---------- attack 函数测试 ----------
test('attack: 无暴击，普通倍率，伤害正确', () => {
    mockRandom([0.99]);
    const crit = new Critical(0.5);
    try {
        const damage = attack(
            100, 0, AttackType.Normal, ArmorType.Normal,
            Environments.Urban, AdaptationLevel.B, AdaptationLevel.D,
            crit, 0
        );
        assert.strictEqual(damage, 100);
    } finally {
        restoreRandom();
    }
});

test('attack: 暴击时伤害翻倍', () => {
    mockRandom([0.1]);
    const crit = new Critical(0.5);
    try {
        const damage = attack(
            100, 0, AttackType.Normal, ArmorType.Normal,
            Environments.Urban, AdaptationLevel.B, AdaptationLevel.D,
            crit, 0
        );
        assert.strictEqual(damage, 200);
    } finally {
        restoreRandom();
    }
});

test('attack: 属性克制倍率生效 (Explosive vs Light)', () => {
    mockRandom([0.99]);
    const crit = new Critical(0.5);
    try {
        const damage = attack(
            100, 0, AttackType.Explosive, ArmorType.Light,
            Environments.Outdoor, AdaptationLevel.A, AdaptationLevel.D,
            crit, 0
        );
        // 使用近似比较，预期 220
        assertClose(damage, 220);
    } finally {
        restoreRandom();
    }
});

test('attack: 防御减伤生效', () => {
    mockRandom([0.99]);
    const crit = new Critical(0.5);
    try {
        const damage = attack(
            100, 1, AttackType.Normal, ArmorType.Normal,
            Environments.Indoor, AdaptationLevel.B, AdaptationLevel.D,
            crit, 0
        );
        assert.strictEqual(damage, 50);
    } finally {
        restoreRandom();
    }
});

test('attack: 掩体效果生效 (SS 级掩体减伤 75%)', () => {
    mockRandom([0.99]);
    const crit = new Critical(0.5);
    try {
        const damage = attack(
            100, 0, AttackType.Normal, ArmorType.Normal,
            Environments.Urban, AdaptationLevel.B, AdaptationLevel.SS,
            crit, 0
        );
        assert.strictEqual(damage, 25);
    } finally {
        restoreRandom();
    }
});

test('attack: 暴击抵抗降低暴击率', () => {
    const crit1 = new Critical(0.6);
    mockRandom([0.05]);
    try {
        const damage1 = attack(
            100, 0, AttackType.Normal, ArmorType.Normal,
            Environments.Urban, AdaptationLevel.B, AdaptationLevel.D,
            crit1, 0.5
        );
        assert.strictEqual(damage1, 200);
    } finally {
        restoreRandom();
    }

    const crit2 = new Critical(0.6);
    mockRandom([0.2]);
    try {
        const damage2 = attack(
            100, 0, AttackType.Normal, ArmorType.Normal,
            Environments.Urban, AdaptationLevel.B, AdaptationLevel.D,
            crit2, 0.5
        );
        assert.strictEqual(damage2, 100);
    } finally {
        restoreRandom();
    }
});

test('attack: 综合倍率计算正确', () => {
    mockRandom([0.1]);
    const crit = new Critical(0.7);
    try {
        const damage = attack(
            200, 0.5, AttackType.Mystic, ArmorType.Special,
            Environments.Outdoor, AdaptationLevel.S, AdaptationLevel.A,
            crit, 0.1
        );
        // 预期 352，结果应为整数，但也可以使用近似
        assertClose(damage, 352);
    } finally {
        restoreRandom();
    }
});

// 运行所有测试
run();