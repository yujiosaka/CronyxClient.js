import type { Duration } from "date-fns";
import type { Credentials } from ".";
import { CronyxClientError } from "./error";
import Job from "./job";
import JobClient from "./job-client";

type JobRunnerOptions = {
  timezone?: string;
  requiredJobNames?: string[];
  startBuffer?: Duration | number;
  retryInterval?: Duration | number;
  noLock?: boolean;
  jobIntervalStartedAt?: Date;
  credentials?: Credentials;
};

/**
 * @internal
 */
export default class JobRunner {
  #jobClient: JobClient;
  #jobName: string;
  #jobInterval: Duration | string | number;
  #timezone: string | undefined;
  #requiredJobNames: string[] | undefined;
  #startBuffer: Duration | number | undefined;
  #retryInterval: Duration | number | undefined;
  #noLock: boolean | undefined;
  #jobIntervalStartedAt: Date | undefined;

  constructor(jobClient: JobClient, jobName: string, jobInterval: Duration | string | number, options?: JobRunnerOptions) {
    this.#jobClient = jobClient;
    this.#jobName = jobName;
    this.#jobInterval = jobInterval;
    this.#timezone = options?.timezone;
    this.#requiredJobNames = options?.requiredJobNames;
    this.#startBuffer = options?.startBuffer;
    this.#retryInterval = options?.retryInterval;
    this.#noLock = options?.noLock;
    this.#jobIntervalStartedAt = options?.jobIntervalStartedAt;
  }

  async requestJobExec(task: (job: Job) => Promise<void>): Promise<void> {
    const job = await this.requestJobStart();
    if (!job) return;

    try {
      await task(job);
    } catch (error) {
      await job.interrupt();
      throw error;
    }

    await job.finish();
  }

  async requestJobStart(): Promise<Job | null> {
    try {
      const jobName = encodeURIComponent(this.#jobName);
      const jobLock = await this.#jobClient.post(`/${jobName}`, {
        jobInterval: this.#jobInterval,
        timezone: this.#timezone,
        requiredJobNames: this.#requiredJobNames,
        startBuffer: this.#startBuffer,
        retryInterval: this.#retryInterval,
        noLock: this.#noLock,
        jobIntervalStartedAt: this.#jobIntervalStartedAt?.toISOString(),
      });
      if (!jobLock) return null;
      return new Job(this.#jobClient, jobLock);
    } catch (error) {
      throw new CronyxClientError(`Cannot activate job lock for ${this.#jobName}`, { cause: error });
    }
  }
}
