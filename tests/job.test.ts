import { afterEach, beforeAll, beforeEach, describe, expect, Mock, spyOn, test } from "bun:test";
import { subMilliseconds } from "date-fns";
import Job from "../src/job";
import JobClient from "../src/job-client";

describe.each([[false], [true]])("Job", (noLock) => {
  const now = new Date();
  const jobId = "6541d97684f72238cf3dc0ab";
  const jobName = "jobName";
  const jobInterval = 1000 * 60 * 60; // 1 hour
  const jobIntervalStartedAt = subMilliseconds(now, jobInterval);
  const jobIntervalEndedAt = now;
  const activatedJobLock = {
    id: noLock ? null : jobId,
    name: jobName,
    interval: jobInterval,
    intervalStartedAt: jobIntervalStartedAt,
    intervalEndedAt: jobIntervalEndedAt,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  const url = "http://localhost:3000";
  const credentials = { username: "username", password: "password" };

  let jobClient: JobClient;
  let job: Job;
  let put: Mock<(path: string) => Promise<void>>;

  beforeAll(() => {
    jobClient = new JobClient(url, credentials);
  });

  beforeEach(() => {
    put = spyOn(JobClient.prototype, "put").mockResolvedValue();
  });

  afterEach(() => {
    put.mockRestore();
  });

  describe(`when isLock=${noLock}`, () => {
    beforeEach(() => {
      job = new Job(jobClient, activatedJobLock);
    });

    test("gets an ID", () => {
      expect(job.id).toEqual(activatedJobLock.id);
    });

    test("gets an interval", () => {
      expect(job.interval).toEqual(jobInterval);
    });

    test("gets a name", () => {
      expect(job.name).toEqual(jobName);
    });

    test("gets a interval started date", () => {
      const jobIntervalStartedAt = subMilliseconds(activatedJobLock.intervalEndedAt, activatedJobLock.interval);
      expect(job.intervalStartedAt).toEqual(jobIntervalStartedAt);
    });

    test("gets a interval ended date", () => {
      expect(job.intervalEndedAt).toEqual(activatedJobLock.intervalEndedAt);
    });

    test("gets a active status", () => {
      expect(job.isActive).toEqual(true);
    });

    test("gets a created date", () => {
      expect(job.createdAt).toEqual(activatedJobLock.createdAt);
    });

    test("gets a updated date", () => {
      expect(job.updatedAt).toEqual(activatedJobLock.updatedAt);
    });

    test("finishes a job", async () => {
      await job.finish();

      if (!noLock) {
        expect(put).toHaveBeenCalledTimes(1);
      }
    });

    test("interrupts a job", async () => {
      await job.interrupt();

      if (!noLock) {
        expect(put).toHaveBeenCalledTimes(1);
      }
    });

    describe("after finishing a job", () => {
      beforeEach(async () => {
        await job.finish();
      });

      test("fails to get the ID", () => {
        expect(() => job.id).toThrow("Job is not active for jobName");
      });

      test("fails to get the interval", () => {
        expect(() => job.interval).toThrow("Job is not active for jobName");
      });

      test("fails to get the name", () => {
        expect(() => job.name).toThrow("Job is not active for jobName");
      });

      test("fails to get the interval started date", () => {
        expect(() => job.intervalStartedAt).toThrow("Job is not active for jobName");
      });

      test("fails to get the interval ended date", () => {
        expect(() => job.intervalEndedAt).toThrow("Job is not active for jobName");
      });

      test("fails to get the active status", () => {
        expect(() => job.isActive).toThrow("Job is not active for jobName");
      });

      test("fails to get the created date", () => {
        expect(() => job.createdAt).toThrow("Job is not active for jobName");
      });

      test("fails to get the updated date", () => {
        expect(() => job.updatedAt).toThrow("Job is not active for jobName");
      });

      test("fails to finishe the job", async () => {
        await expect(job.finish()).rejects.toMatchObject({ message: "Job is not active for jobName" });
      });

      test("fails to interrupt the job", async () => {
        await expect(job.interrupt()).rejects.toMatchObject({ message: "Job is not active for jobName" });
      });
    });

    describe("after interrupting a job", () => {
      beforeEach(async () => {
        await job.interrupt();
      });

      test("fails to get the ID", () => {
        expect(() => job.id).toThrow("Job is not active for jobName");
      });

      test("fails to get the interval", () => {
        expect(() => job.interval).toThrow("Job is not active for jobName");
      });

      test("fails to get the name", () => {
        expect(() => job.name).toThrow("Job is not active for jobName");
      });

      test("fails to get the interval started date", () => {
        expect(() => job.intervalStartedAt).toThrow("Job is not active for jobName");
      });

      test("fails to get the interval ended date", () => {
        expect(() => job.intervalEndedAt).toThrow("Job is not active for jobName");
      });

      test("fails to get the active status", () => {
        expect(() => job.isActive).toThrow("Job is not active for jobName");
      });

      test("fails to get the created date", () => {
        expect(() => job.createdAt).toThrow("Job is not active for jobName");
      });

      test("fails to get the updated date", () => {
        expect(() => job.updatedAt).toThrow("Job is not active for jobName");
      });

      test("fails to finishe the job", async () => {
        await expect(job.finish()).rejects.toMatchObject({ message: "Job is not active for jobName" });
      });

      test("fails to interrupt the job", async () => {
        await expect(job.interrupt()).rejects.toMatchObject({ message: "Job is not active for jobName" });
      });
    });

    if (!noLock) {
      describe("when deactivating job lock fails", () => {
        beforeEach(() => {
          put.mockRejectedValue(new Error(`Failed to post ${url}/${jobName}/${jobId}/finish`));
        });

        test("fails to finish the job", async () => {
          await expect(job.finish()).rejects.toMatchObject({ message: `Cannot finish job for ${activatedJobLock.name}` });
        });
      });

      describe("when removing job lock fails", () => {
        beforeEach(() => {
          put.mockRejectedValue(new Error(`Failed to post ${url}/${jobName}/${jobId}/interrupt`));
        });

        test("fails to interrupt the job", async () => {
          await expect(job.interrupt()).rejects.toMatchObject({
            message: `Cannot interrupt job for ${activatedJobLock.name}`,
          });
        });
      });
    }
  });
});
