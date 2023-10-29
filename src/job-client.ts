import type { Credentials } from ".";
import type { PostBody } from "./schema";
import { PostResponse } from "./schema";

/**
 * @internal
 */
export default class JobClient {
  #url: string;
  #credentials: Credentials | undefined;

  constructor(url: string, credentials: Credentials | undefined) {
    this.#url = url;
    this.#credentials = credentials;
  }

  async post(path: string, body: PostBody): Promise<PostResponse> {
    const url = new URL(path, this.#url);
    const response = await fetch(url, {
      method: "POST",
      headers: this.#headers,
      body: JSON.stringify(body),
    });
    if (response.status !== 200) {
      throw new Error(`Failed to post ${url}`);
    }
    const json = await response.json();
    return PostResponse.parse(json);
  }

  async put(path: string): Promise<void> {
    const url = new URL(path, this.#url);
    const response = await fetch(url, {
      method: "PUT",
      headers: this.#headers,
    });
    if (response.status !== 200) {
      throw new Error(`Failed to put ${url}`);
    }
  }

  get #headers(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.#credentials) {
      const decoded = `${this.#credentials.username}:${this.#credentials.password}`;
      const encoded = Buffer.from(decoded).toString("base64");
      headers["Authorization"] = `Basic ${encoded}`;
    }
    return headers;
  }
}
