import { Snowflake } from '../src';

describe('Snowflake生成', () => {
  it('生成されたIDの一意性', () => {
    const generator = new Snowflake(1);

    const idSet = new Set<bigint>();
    const numIdsToGenerate = 10000;

    for (let i = 0; i < numIdsToGenerate; i++) {
      const id = generator.generateId();
      expect(idSet.has(id)).toBe(false);
      idSet.add(id);
    }
  });

  it('タイムスタンプ順', () => {
    const generator = new Snowflake(1);

    const ids: bigint[] = [];

    for (let i = 0; i < 1000; i++) {
      ids.push(generator.generateId());
    }
    for (let i = 1; i < ids.length; i++) {
      expect(ids[i]).toBeGreaterThan(ids[i - 1]);
    }
  });

  it('生成速度が0.1ms以下', () => {
    const generator = new Snowflake(1);
    const maxExecutionTimeMs = 0.1;
    const numIdsToGenerate = 10000;

    for (let i = 0; i < numIdsToGenerate; i++) {
      const start = process.hrtime.bigint();
      generator.generateId();
      const end = process.hrtime.bigint();
      const executionTimeMs = Number(end - start) / 1e6;
      expect(executionTimeMs).toBeLessThan(maxExecutionTimeMs);
    }
  });

  it('異なるマシンで実行した時の一意性', () => {
    const machineId1 = 1;
    const machineId2 = 2;

    const generator1 = new Snowflake(machineId1);
    const generator2 = new Snowflake(machineId2);

    const numIdsToGenerate = 100;
    const idSet = new Set<bigint>();

    for (let i = 0; i < numIdsToGenerate; i++) {
      const id1 = generator1.generateId();
      const id2 = generator2.generateId();

      expect(idSet.has(id1)).toBe(false);
      expect(idSet.has(id2)).toBe(false);

      idSet.add(id1);
      idSet.add(id2);
    }
  });

  it('マイナスの値が生成されないことの確認', () => {
    const generator = new Snowflake(1);
    const numIdsToGenerate = 10000;

    for (let i = 0; i < numIdsToGenerate; i++) {
      const id = generator.generateId();
      expect(0 < id).toBe(true);
    }
  });
});
