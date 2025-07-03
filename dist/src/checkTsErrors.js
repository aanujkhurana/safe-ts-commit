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
exports.checkTypeScriptErrors = checkTypeScriptErrors;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("./utils");
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    bold: '\x1b[1m',
};
function checkTypeScriptErrors(tsFiles, tscPath, cache, hashes) {
    if (tsFiles.length === 0)
        return false;
    console.log(`${colors.blue}Checking TypeScript errors in ${tsFiles.length} staged files...${colors.reset}`);
    const tempFilePath = path.join(process.cwd(), '.ts-files-to-check.txt');
    fs.writeFileSync(tempFilePath, tsFiles.join('\n'));
    try {
        const result = (0, child_process_1.spawnSync)(tscPath, ['--noEmit', '--pretty', '@' + tempFilePath], {
            stdio: 'pipe',
            encoding: 'utf-8',
            shell: process.platform === 'win32',
        });
        fs.unlinkSync(tempFilePath);
        if (result.status !== 0) {
            console.error(`\n${colors.red}${colors.bold}TypeScript errors found:${colors.reset}\n`);
            console.error(result.stderr || result.stdout);
            console.error(`\n${colors.yellow}${colors.bold}Commit aborted. Please fix the TypeScript errors and try again.${colors.reset}\n`);
            for (const file of tsFiles) {
                cache[file] = { hash: hashes[file], lastChecked: Date.now(), hadErrors: true };
            }
            (0, utils_1.saveCache)(cache);
            process.exit(1);
        }
        for (const file of tsFiles) {
            cache[file] = { hash: hashes[file], lastChecked: Date.now(), hadErrors: false };
        }
        (0, utils_1.saveCache)(cache);
        console.log(`${colors.green}No TypeScript errors found. Proceeding with commit.${colors.reset}`);
        return false;
    }
    catch (error) {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        if (error instanceof Error) {
            throw new Error(`${colors.red}${colors.bold}Error running TypeScript compiler:${colors.reset} ${error.message}`);
        }
        else {
            throw new Error(`${colors.red}${colors.bold}Error running TypeScript compiler:${colors.reset} Unknown error`);
        }
    }
}
