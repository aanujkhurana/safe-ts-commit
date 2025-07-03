#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const getStagedFiles_1 = require("../src/getStagedFiles");
const utils_1 = require("../src/utils");
const checkTsErrors_1 = require("../src/checkTsErrors");
function checkTypeScriptInstalled() {
    try {
        // Try to use local TypeScript installation first
        const tscPath = path.join(process.cwd(), 'node_modules', '.bin', 'tsc');
        if (fs.existsSync(tscPath)) {
            return { installed: true, path: tscPath };
        }
        // Fall back to global TypeScript
        return { installed: true, path: 'tsc' };
    }
    catch {
        return { installed: false };
    }
}
function getFilesToCheck(tsFiles, cache) {
    const toCheck = [];
    const hashes = {};
    for (const file of tsFiles) {
        try {
            const hash = (0, utils_1.hashFile)(file);
            hashes[file] = hash;
            if (!cache[file] || cache[file].hash !== hash) {
                toCheck.push(file);
            }
        }
        catch {
            toCheck.push(file);
        }
    }
    return { toCheck, hashes };
}
function main() {
    const tsResult = checkTypeScriptInstalled();
    if (!tsResult.installed || !tsResult.path) {
        console.error('TypeScript is not installed. Please install TypeScript and try again.');
        process.exit(1);
    }
    const stagedFiles = (0, getStagedFiles_1.getStagedFiles)();
    const tsFiles = (0, utils_1.filterTypeScriptFiles)(stagedFiles);
    const cache = (0, utils_1.loadCache)();
    const { toCheck, hashes } = getFilesToCheck(tsFiles, cache);
    if (toCheck.length > 0) {
        (0, checkTsErrors_1.checkTypeScriptErrors)(toCheck, tsResult.path, cache, hashes);
    }
    else if (tsFiles.length > 0) {
        // All files unchanged and previously checked
        const hasPrevErrors = tsFiles.some(f => cache[f] && cache[f].hadErrors);
        if (hasPrevErrors) {
            // Rerun the check to show detailed error output
            (0, checkTsErrors_1.checkTypeScriptErrors)(tsFiles, tsResult.path, cache, hashes);
        }
        else {
            console.log('No TypeScript errors found (from cache). Proceeding with commit.');
        }
    }
    else {
        console.log('No TypeScript files staged for commit.');
    }
}
main();
