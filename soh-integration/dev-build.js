#!/usr/bin/env node
/**
 * dev-build.js - Fast development build for SoH Tracker.
 *
 * Does what `yarn buildDev` does via gulp, but with a direct file copy.
 * Produces dev/ in ~5 seconds instead of 5+ minutes.
 *
 * What it does:
 *   1. Mirror src/ -> dev/
 *   2. Copy each node_modules/<dep>/src -> dev/<DepName>/
 *   3. Copy logic/ -> dev/logic/
 *   4. Copy soh-integration/mappings/ -> dev/soh-integration/mappings/
 *
 * Run: node soh-integration/dev-build.js
 */

'use strict';

const fs = require('node:fs');
const fsp = require('node:fs').promises;
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DEV = path.join(ROOT, 'dev');
const LOGIC = path.join(ROOT, 'logic');
const MODS = path.join(ROOT, 'node_modules');
const INTEG_MAPPINGS = path.join(ROOT, 'soh-integration', 'mappings');

// Mapping of import-path aliases -> node_modules package src folder.
// Matches gulpfile.js MODULE_PATHS.
const DEP_MAP = [
    { alias: 'emcJS',         pkg: 'emcjs' },
    { alias: 'GameTrackerJS', pkg: 'gametrackerjs' },
    { alias: 'JSEditors',     pkg: 'jseditors' },
    { alias: 'RTCClient',     pkg: 'rtcclient' },
    { alias: 'ArchipelagoJS', pkg: 'archipelagojs' },
];

async function rmrf(target) {
    try {
        await fsp.rm(target, { recursive: true, force: true });
    } catch (_) {}
}

async function copyDir(src, dst) {
    await fsp.mkdir(dst, { recursive: true });
    await fsp.cp(src, dst, { recursive: true, force: true });
}

function mustExist(p, label) {
    if (!fs.existsSync(p)) {
        console.error(`ERROR: missing ${label}: ${p}`);
        process.exit(1);
    }
}

async function main() {
    const clean = process.argv.includes('--clean');

    console.log(`[dev-build] ROOT: ${ROOT}`);

    mustExist(SRC, 'src/');
    mustExist(MODS, 'node_modules/ (run `yarn install` first)');
    mustExist(LOGIC, 'logic/');

    if (clean) {
        console.log('[dev-build] cleaning dev/');
        await rmrf(DEV);
    }

    await fsp.mkdir(DEV, { recursive: true });

    const start = Date.now();

    console.log('[dev-build] copying src/ -> dev/');
    await copyDir(SRC, DEV);

    console.log('[dev-build] copying logic/ -> dev/logic/');
    await copyDir(LOGIC, path.join(DEV, 'logic'));

    for (const { alias, pkg } of DEP_MAP) {
        const srcDir = path.join(MODS, pkg, 'src');
        const dstDir = path.join(DEV, alias);
        if (!fs.existsSync(srcDir)) {
            console.warn(`[dev-build] skip ${alias} - ${srcDir} not found`);
            continue;
        }
        console.log(`[dev-build] copying ${pkg}/src -> dev/${alias}/`);
        await copyDir(srcDir, dstDir);
    }

    // Copy soh-integration mappings so the renderer can fetch them
    if (fs.existsSync(INTEG_MAPPINGS)) {
        const dstMap = path.join(DEV, 'soh-integration', 'mappings');
        await fsp.mkdir(path.dirname(dstMap), { recursive: true });
        console.log('[dev-build] copying soh-integration/mappings -> dev/');
        await copyDir(INTEG_MAPPINGS, dstMap);
    }

    const ms = Date.now() - start;
    console.log(`[dev-build] done in ${(ms / 1000).toFixed(1)}s`);

    // Stats
    let files = 0, bytes = 0;
    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(p);
            else if (entry.isFile()) { files++; bytes += fs.statSync(p).size; }
        }
    }
    walk(DEV);
    console.log(`[dev-build] ${files.toLocaleString()} files, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((err) => {
    console.error('[dev-build] failed:', err);
    process.exit(1);
});
