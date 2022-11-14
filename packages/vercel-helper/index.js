#!/usr/bin/env node

import { spawnSync } from "child_process"
import { readFileSync } from "fs"
import { join, resolve } from "path"

const projectJson = JSON.parse(
  readFileSync(join(process.env.INIT_CWD, "package.json"), "utf8"),
)
const orgId = projectJson.vercel.orgId
const projectId = projectJson.vercel.projectId
const localConfig = resolve(
  process.env.INIT_CWD,
  projectJson.vercel.localConfig,
)

const { status } = spawnSync(
  "vercel",
  ["--local-config", localConfig, ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      VERCEL_ORG_ID: orgId,
      VERCEL_PROJECT_ID: projectId,
    },
  },
)

process.exit(status)
