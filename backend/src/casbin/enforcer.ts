// src/casbin/enforcer.ts
import { newEnforcer, Enforcer } from 'casbin';
import fs from 'fs';
import path from 'path';

let enforcer: Enforcer;

export const initEnforcer = async (): Promise<void> => {
    const modelPath = path.join(__dirname, 'model.conf');
    const policyPath = path.join(__dirname, 'policy.csv');

    // Verify files exist before loading
    console.log('Model path:', modelPath);
    console.log('Policy path:', policyPath);
    console.log('Model exists:', fs.existsSync(modelPath));
    console.log('Policy exists:', fs.existsSync(policyPath));

    enforcer = await newEnforcer(modelPath, policyPath);

    // Log all loaded policies
    const policies = await enforcer.getPolicy();
    console.log('Loaded policies:', policies);

    console.log('✅ Casbin enforcer initialized');
};

export const checkPermission = async (role: string, path: string, method: string): Promise<boolean> => {
    if (!enforcer) {
        throw new Error('Casbin enforcer not initialized. Call initEnforcer() first.');
    }
    return await enforcer.enforce(role, path, method);
};