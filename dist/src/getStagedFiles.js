"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStagedFiles = getStagedFiles;
const child_process_1 = require("child_process");
function getStagedFiles() {
    try {
        const output = (0, child_process_1.execSync)('git diff --cached --name-only').toString().trim();
        if (!output)
            return [];
        return output.split('\n');
    }
    catch (error) {
        throw new Error(`Error getting staged files: ${error.message}`);
    }
}
