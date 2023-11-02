export class Snowflake {
  private static readonly EPOCH = 1288834974657n;
  private static readonly WORKER_ID_BITS = 10n;
  private static readonly SEQUENCE_BITS = 12n;

  private static readonly MAX_WORKER_ID = (1n << Snowflake.WORKER_ID_BITS) - 1n;
  private static readonly MAX_SEQUENCE = (1n << Snowflake.SEQUENCE_BITS) - 1n;

  private readonly workerId: bigint;
  private sequence = 0n;
  private lastTimestamp = 0n;

  constructor(workerId: number) {
    const workerIdn = BigInt(workerId);
    if (workerIdn < 0n || workerIdn > Snowflake.MAX_WORKER_ID) {
      throw new Error(
        `workerId must be between 0 and ${Snowflake.MAX_WORKER_ID}`,
      );
    }
    this.workerId = workerIdn;
  }

  private getTimestamp(): bigint {
    return BigInt(Date.now()) - Snowflake.EPOCH;
  }

  /**
   * snowflakeIdからタイムスタンプを取り出す
   * @param snowflakeId
   */
  public extractTimestamp(snowflakeId: bigint) {
    const timestampBits =
      snowflakeId >> (Snowflake.WORKER_ID_BITS + Snowflake.SEQUENCE_BITS);
    const timestamp = timestampBits + Snowflake.EPOCH;
    return Number(timestamp);
  }

  /**
   * snowflakeId生成
   */
  public generateId(): bigint {
    let timestamp = this.getTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate id.');
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & Snowflake.MAX_SEQUENCE;
      if (this.sequence === 0n) {
        timestamp = this.waitUntilNextTimestamp(timestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    return (
      (timestamp << (Snowflake.WORKER_ID_BITS + Snowflake.SEQUENCE_BITS)) |
      (this.workerId << Snowflake.SEQUENCE_BITS) |
      this.sequence
    );
  }

  private waitUntilNextTimestamp(currentTimestamp: bigint): bigint {
    while (currentTimestamp <= this.lastTimestamp) {
      currentTimestamp = this.getTimestamp();
    }
    return currentTimestamp;
  }
}
