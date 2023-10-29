import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, Mock, mock, test } from "bun:test";
import type { MongodbJobLock } from "cronyx";
import { MongodbJobStore } from "cronyx";
import type { Connection, Model } from "mongoose";
import { createConnection } from "mongoose";
import CronyxClient from "../src";
import { waitUntil } from "./helper";

describe("integration tests", () => {
  const jobName = "jobName";
  const jobInterval = 1000 * 60 * 60 * 24; // 1 day
  const jobOptions = {
    jobName,
    jobInterval: "0 0 0 * * *", // daily
  };

  let conn: Connection;
  let jobStore: MongodbJobStore;
  let model: Model<MongodbJobLock>;
  let cronyxClient: CronyxClient;
  let jobTask: Mock<() => Promise<void>>;

  beforeEach(() => {
    jobTask = mock(() => Promise.resolve());
  });

  beforeAll(async () => {
    conn = createConnection(Bun.env.MONGO_URI!);
    await waitUntil(() => conn.asPromise());

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    jobStore = new MongodbJobStore(conn);
    model = conn.models.JobLock;
    cronyxClient = new CronyxClient({ url: Bun.env.SERVER_URL! });
  });

  afterAll(async () => {
    await jobStore.close();
  });

  afterEach(async () => {
    await model.deleteMany({});
  });

  test("runs job", async () => {
    const job = await cronyxClient.requestJobStart(jobOptions);
    expect(job?.id).not.toBe(null);
    expect(job?.name).toBe(jobName);
    expect(job?.interval).toBeLessThanOrEqual(jobInterval);
    expect(job?.intervalStartedAt).toBeDate();
    expect(job?.intervalEndedAt).toBeDate();
    expect(job?.isActive).toBe(true);
    expect(job?.createdAt).toBeDate();
    expect(job?.updatedAt).toBeDate();
    await job!.finish();
  });

  test("executes job", async () => {
    await cronyxClient.requestJobExec(jobOptions, jobTask);
    expect(jobTask).toHaveBeenCalled();
  });
});
