import "server-only";
import { createHash } from "node:crypto";

export const SIGNED_KEYS = ["folder", "public_id", "source", "timestamp"];

export const parameterString = (params) =>
  Object.keys(params)
    .filter((key) => SIGNED_KEYS.includes(key))
    .filter((key) => params[key] !== undefined && params[key] !== "")
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

export const signParams = (params, secret) =>
  createHash("sha1")
    .update(`${parameterString(params)}${secret}`, "utf8")
    .digest("hex");
