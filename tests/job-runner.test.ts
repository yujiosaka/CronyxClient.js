import { afterEach, beforeAll, beforeEach, describe, expect, mock, Mock, spyOn, test } from "bun:test";
import { sub } from "date-fns";
import JobClient from "../src/job-client";
import JobRunner from "../src/job-runner";
import type { PostBody, PostResponse } from "../src/schema";

describe("JobRunner", () => {
  const requestedAt = new Date("2023-02-03T15:00:00.000Z");
  const jobIntervalStartedAt = sub(requestedAt, { days: 1 });
  const jobIntervalEndedAt = requestedAt;
  const jobId = "6541d97684f72238cf3dc0ab";
  const jobName = "jobName";
  const jobInterval = 1000 * 60 * 60 * 24; // 1 day
  const postResponse = {
    id: jobId,
    name: jobName,
    interval: jobInterval,
    intervalStartedAt: jobIntervalStartedAt,
    intervalEndedAt: jobIntervalEndedAt,
    isActive: true,
    createdAt: requestedAt,
    updatedAt: requestedAt,
  };
  const url = "http://localhost:3000";
  const credentials = { username: "username", password: "password" };

  let jobClient: JobClient;
  let runner: JobRunner;
  let post: Mock<(path: string, body: PostBody) => Promise<PostResponse>>;
  let put: Mock<(path: string) => Promise<void>>;
  let jobTask: Mock<() => Promise<void>>;

  beforeAll(() => {
    jobClient = new JobClient(url, credentials);
    runner = new JobRunner(jobClient, jobName, jobInterval);
  });

  beforeEach(() => {
    post = spyOn(jobClient, "post");
    put = spyOn(jobClient, "put");
    jobTask = mock(() => Promise.resolve());
  });

  afterEach(() => {
    put.mockRestore();
    post.mockRestore();
    jobTask.mockRestore();
  });

  describe("requestJobStart", () => {
    test("does not start job", async () => {
      post.mockResolvedValue(null);

      const job = await runner.requestJobStart();

      expect(job).toBe(null);
    });

    test("fails to start job", async () => {
      post.mockRejectedValue(new Error(`Failed to post ${url}/${jobName}`));

      await expect(runner.requestJobStart()).rejects.toMatchObject({
        message: `Cannot activate job lock for ${jobName}`,
      });
    });

    test("starts job", async () => {
      post.mockResolvedValue(postResponse);

      const job = await runner.requestJobStart();

      expect(job?.id).toBe(jobId);
      expect(job?.name).toBe(jobName);
      expect(job?.interval).toBe(jobInterval);
      expect(job?.intervalStartedAt.getTime()).toBe(jobIntervalStartedAt.getTime());
      expect(job?.intervalEndedAt.getTime()).toBe(jobIntervalEndedAt.getTime());
      expect(job?.isActive).toBe(true);
      expect(job?.createdAt.getTime()).toBe(requestedAt.getTime());
      expect(job?.updatedAt.getTime()).toBe(requestedAt.getTime());
    });
  });

  describe("requestJobExec", () => {
    test("does not execute job", async () => {
      post.mockResolvedValue(null);
      put.mockResolvedValue();

      await runner.requestJobExec(jobTask);

      expect(post).toHaveBeenCalledTimes(1);
      expect(put).not.toHaveBeenCalled();
      expect(jobTask).not.toHaveBeenCalled();
    });

    test("fails to start job", async () => {
      post.mockRejectedValue(new Error(`Failed to post ${url}/${jobName}`));

      await expect(runner.requestJobExec(jobTask)).rejects.toMatchObject({
        message: `Cannot activate job lock for ${jobName}`,
      });

      expect(post).toHaveBeenCalledTimes(1);
      expect(put).not.toHaveBeenCalled();
      expect(jobTask).not.toHaveBeenCalled();
    });

    test("executes job", async () => {
      post.mockResolvedValue(postResponse);
      put.mockResolvedValue();

      await runner.requestJobExec(jobTask);

      expect(post).toHaveBeenCalledTimes(1);
      expect(put).toHaveBeenCalledTimes(1);
      expect(jobTask).toHaveBeenCalledTimes(1);
    });

    test("fails to finish job", async () => {
      post.mockResolvedValue(postResponse);
      put.mockRejectedValue(new Error(`Failed to put ${url}/${jobName}/${jobId}/finish`));

      await expect(runner.requestJobExec(jobTask)).rejects.toMatchObject({
        message: `Cannot finish job for ${jobName}`,
      });

      expect(post).toHaveBeenCalledTimes(1);
      expect(put).toHaveBeenCalledTimes(1);
      expect(jobTask).toHaveBeenCalledTimes(1);
    });

    test("interrupts job", async () => {
      jobTask = mock(() => Promise.reject(new Error("Something went wrong")));
      post.mockResolvedValue(postResponse);
      put.mockResolvedValue();

      await expect(runner.requestJobExec(jobTask)).rejects.toMatchObject({
        message: "Something went wrong",
      });

      expect(post).toHaveBeenCalledTimes(1);
      expect(put).toHaveBeenCalledTimes(1);
      expect(jobTask).toHaveBeenCalledTimes(1);
    });

    test("fails to interrupt job", async () => {
      jobTask = mock(() => Promise.reject(new Error("Something went wrong")));
      post.mockResolvedValue(postResponse);
      put.mockRejectedValue(new Error(`Failed to put ${url}/${jobName}/${jobId}/interrupt`));

      await expect(runner.requestJobExec(jobTask)).rejects.toMatchObject({
        message: `Cannot interrupt job for ${jobName}`,
      });
    });
  });
});
