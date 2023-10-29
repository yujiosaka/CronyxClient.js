import { afterEach, beforeAll, beforeEach, describe, expect, Mock, spyOn, test } from "bun:test";
import { sub } from "date-fns";
import JobClient from "../src/job-client";

describe("JobClient", () => {
  const requestedAt = new Date("2023-02-03T15:00:00.000Z");
  const jobIntervalStartedAt = sub(requestedAt, { days: 1 });
  const jobIntervalEndedAt = requestedAt;
  const jobId = "6541d97684f72238cf3dc0ab";
  const jobName = "jobName";
  const jobInterval = 1000 * 60 * 60 * 24; // 1 day
  const postBody = {
    jobInterval: "0 0 0 * *", // daily
  };
  const postResponse = {
    id: jobId,
    name: jobName,
    interval: jobInterval,
    intervalStartedAt: jobIntervalStartedAt.toISOString(),
    intervalEndedAt: jobIntervalEndedAt.toISOString(),
    isActive: true,
    createdAt: requestedAt.toISOString(),
    updatedAt: requestedAt.toISOString(),
  };
  const url = "http://localhost:3000";
  const credentials = { username: "user", password: "pass" };
  const postPath = `/${jobName}`;
  const putPath = `/${jobName}/${jobId}/finish`;

  let jobClient: JobClient;
  let fetch: Mock<(request: Request) => Promise<Response>>;

  beforeAll(() => {
    jobClient = new JobClient(url, credentials);
  });

  beforeEach(() => {
    fetch = spyOn(global, "fetch");
  });

  afterEach(() => {
    fetch.mockRestore();
  });

  describe("post", () => {
    test("activates job", async () => {
      fetch.mockResolvedValue({ status: 200, json: async () => postResponse } as Response);

      const response = await jobClient.post(postPath, postBody);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(response?.id).toBe(jobId);
      expect(response?.name).toBe(jobName);
      expect(response?.interval).toBe(jobInterval);
      expect(response?.intervalStartedAt.getTime()).toBe(jobIntervalStartedAt.getTime());
      expect(response?.intervalEndedAt.getTime()).toBe(jobIntervalEndedAt.getTime());
      expect(response?.isActive).toBe(true);
      expect(response?.createdAt.getTime()).toBe(requestedAt.getTime());
      expect(response?.updatedAt.getTime()).toBe(requestedAt.getTime());
    });

    test("fails to activate job", async () => {
      fetch.mockResolvedValue({ status: 500 } as Response);

      await expect(jobClient.post(postPath, postBody)).rejects.toMatchObject({
        message: `Failed to post ${url}/${jobName}`,
      });
    });
  });

  describe("put", () => {
    test("finishes job", async () => {
      fetch.mockResolvedValue({ status: 200 } as Response);

      await jobClient.put(putPath);

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    test("fails to finish job", async () => {
      fetch.mockResolvedValue({ status: 500 } as Response);

      await expect(jobClient.put(putPath)).rejects.toMatchObject({
        message: `Failed to put ${url}/${jobName}/${jobId}/finish`,
      });
    });
  });
});
