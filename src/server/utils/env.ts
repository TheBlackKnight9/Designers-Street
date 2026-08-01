/**
 * Data-source switch for repositories / façade.
 * Default is mock so the app runs without PostgreSQL.
 */
export function isDatabaseEnabled(): boolean {
  const flag = (process.env.USE_DATABASE ?? "false").toLowerCase();
  return flag === "true" || flag === "1" || flag === "db";
}

export function getAppEnv(): string {
  return process.env.NODE_ENV ?? "development";
}
