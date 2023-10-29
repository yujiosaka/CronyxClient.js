import { CronyxClientError } from "./error";
import type JobClient from "./job-client";
import type { PostResponse } from "./schema";
import { log } from "./util";

/**
 * @public
 */
export default class Job {
  #jobName: string;
  #jobClient: JobClient;
  #jobLock: PostResponse;
  #pendingPromise: Promise<void> | null = null;

  /**
   * @internal
   */
  constructor(jobClient: JobClient, jobLock: NonNullable<PostResponse>) {
    this.#jobName = jobLock.name;
    this.#jobClient = jobClient;
    this.#jobLock = jobLock;
  }

  get id(): string | null {
    if (!this.#jobLock || !this.#jobLock.isActive) throw new CronyxClientError(`Job is not active for ${this.#jobName}`);

    return this.#jobLock.id;
  }

  get name(): string {
    if (!this.#jobLock || !this.#jobLock.isActive) throw new CronyxClientError(`Job is not active for ${this.#jobName}`);

    return this.#jobLock.name;
  }

  get interval(): number {
    if (!this.#jobLock || !this.#jobLock.isActive) throw new CronyxClientError(`Job is not active for ${this.#jobName}`);

    return this.#jobLock.interval;
  }

  get intervalStartedAt(): Date {
    if (!this.#jobLock || !this.#jobLock.isActive) throw new CronyxClientError(`Job is not active for ${this.#jobName}`);

    return this.#jobLock.intervalStartedAt;
  }

  get intervalEndedAt(): Date {
    if (!this.#jobLock || !this.#jobLock.isActive) throw new CronyxClientError(`Job is not active for ${this.#jobName}`);

    return this.#jobLock.intervalEndedAt;
  }

  get isActive(): boolean {
    if (!this.#jobLock || !this.#jobLock.isActive) throw new CronyxClientError(`Job is not active for ${this.#jobName}`);

    return this.#jobLock.isActive;
  }

  get createdAt(): Date {
    if (!this.#jobLock || !this.#jobLock.isActive) throw new CronyxClientError(`Job is not active for ${this.#jobName}`);

    return this.#jobLock.createdAt;
  }

  get updatedAt(): Date {
    if (!this.#jobLock || !this.#jobLock.isActive) throw new CronyxClientError(`Job is not active for ${this.#jobName}`);

    return this.#jobLock.updatedAt;
  }

  async finish(): Promise<void> {
    if (!this.#jobLock || !this.#jobLock.isActive) throw new CronyxClientError(`Job is not active for ${this.#jobName}`);
    if (this.#pendingPromise) throw new CronyxClientError(`Job is pending for ${this.#jobName}`);

    if (this.#jobLock.id === null) {
      this.#jobLock = { ...this.#jobLock, isActive: false };
      return;
    }

    const jobName = encodeURIComponent(this.#jobLock.name);
    const jobId = encodeURIComponent(this.#jobLock.id);

    this.#pendingPromise = this.#jobClient
      .put(`/${jobName}/${jobId}/finish`)
      .then(() => {
        log(`Job is finished for ${this.#jobName}`);
        this.#jobLock = null;
        this.#pendingPromise = null;
      })
      .catch((error) => {
        this.#pendingPromise = null;
        throw new CronyxClientError(`Cannot finish job for ${this.#jobName}`, { cause: error });
      });

    return this.#pendingPromise;
  }

  async interrupt(): Promise<void> {
    if (!this.#jobLock || !this.#jobLock.isActive) throw new CronyxClientError(`Job is not active for ${this.#jobName}`);
    if (this.#pendingPromise) throw new CronyxClientError(`Job is pending for ${this.#jobName}`);

    if (this.#jobLock.id === null) {
      this.#jobLock = null;
      return;
    }

    const jobName = encodeURIComponent(this.#jobLock.name);
    const jobId = encodeURIComponent(this.#jobLock.id);

    this.#pendingPromise = this.#jobClient
      .put(`/${jobName}/${jobId}/interrupt`)
      .then(() => {
        log(`Job is finished for ${this.#jobName}`);
        this.#jobLock = null;
        this.#pendingPromise = null;
      })
      .catch((error) => {
        this.#pendingPromise = null;
        throw new CronyxClientError(`Cannot interrupt job for ${this.#jobName}`, { cause: error });
      });

    return this.#pendingPromise;
  }
}
