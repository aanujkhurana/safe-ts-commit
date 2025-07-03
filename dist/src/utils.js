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
exports.CACHE_FILE = void 0;
exports.hashFile = hashFile;
exports.loadCache = loadCache;
exports.saveCache = saveCache;
exports.filterTypeScriptFiles = filterTypeScriptFiles;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
exports.CACHE_FILE = path.join(process.cwd(), '.ts-check-commit-cache.json');
function hashFile(filePath) {
    const data = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(data).digest('hex');
}
function loadCache() {
    if (fs.existsSync(exports.CACHE_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(exports.CACHE_FILE, 'utf-8'));
        }
        catch {
            return {};
        }
    }
    return {};
}
function saveCache(cache) {
    fs.writeFileSync(exports.CACHE_FILE, JSON.stringify(cache, null, 2));
}
function filterTypeScriptFiles(files) {
    return files.filter(file => (file.endsWith('.ts') || file.endsWith('.tsx')) && fs.existsSync(file));
}
