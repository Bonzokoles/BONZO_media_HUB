import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const root = process.cwd()
const shouldStaticExport = process.env.NEXT_STATIC_EXPORT === '1'
const apiDir = join(root, 'app', 'api')
const tempRoot = join(root, '.build-tmp')
const backupManifestPath = join(tempRoot, 'static-export-route-backups.json')

const STATIC_ROUTE_STUB = `import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

function unsupported() {
  return NextResponse.json(
    { error: 'API routes are disabled in static export build.' },
    { status: 503 }
  )
}

export function GET() {
  return unsupported()
}

export function POST() {
  return unsupported()
}

export function PUT() {
  return unsupported()
}

export function PATCH() {
  return unsupported()
}

export function DELETE() {
  return unsupported()
}

export function OPTIONS() {
  return new Response(null, { status: 204 })
}
`

function ensureTempRoot() {
  if (!existsSync(tempRoot)) {
    mkdirSync(tempRoot, { recursive: true })
  }
}

function collectRouteFiles(dir, results = []) {
  if (!existsSync(dir)) {
    return results
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      collectRouteFiles(fullPath, results)
      continue
    }

    if (entry.isFile() && entry.name === 'route.ts') {
      results.push(fullPath)
    }
  }

  return results
}

function replaceRoutesForStaticExport() {
  if (!shouldStaticExport || !existsSync(apiDir)) {
    return []
  }

  ensureTempRoot()

  const routeFiles = collectRouteFiles(apiDir)
  const backups = routeFiles.map((filePath) => ({
    filePath,
    content: readFileSync(filePath, 'utf8'),
  }))

  for (const backup of backups) {
    writeFileSync(backup.filePath, STATIC_ROUTE_STUB, 'utf8')
  }

  writeFileSync(backupManifestPath, JSON.stringify(backups), 'utf8')
  return backups
}

function restoreRoutesAfterBuild(backups) {
  if (!Array.isArray(backups) || backups.length === 0) {
    return
  }

  for (const backup of backups) {
    writeFileSync(backup.filePath, backup.content, 'utf8')
  }
}

function runNextBuild() {
  return new Promise((resolve, reject) => {
    const nextBin = join(root, 'node_modules', 'next', 'dist', 'bin', 'next')
    const child = spawn(process.execPath, [nextBin, 'build', '--webpack'], {
      cwd: root,
      env: process.env,
      stdio: 'inherit',
      shell: false,
    })

    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }

      const details = signal ? `signal ${signal}` : `code ${code ?? 'unknown'}`
      reject(new Error(`next build failed with ${details}`))
    })

    child.on('error', reject)
  })
}

let backups = []

try {
  backups = replaceRoutesForStaticExport()
  await runNextBuild()
} finally {
  restoreRoutesAfterBuild(backups)
}
