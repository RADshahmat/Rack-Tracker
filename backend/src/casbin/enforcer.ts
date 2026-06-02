// src/casbin/enforcer.ts
import { newEnforcer, Enforcer } from 'casbin';
import path from 'path';

let enforcer: Enforcer;

export const initEnforcer = async (): Promise<void> => {
    const modelPath = path.join(__dirname, 'model.conf');
    const policyPath = path.join(__dirname, 'policy.csv');
    enforcer = await newEnforcer(modelPath, policyPath);
    console.log('✅ Casbin enforcer initialized');
};

export const checkPermission = async (role: string, path: string, method: string): Promise<boolean> => {
    if (!enforcer) {
        throw new Error('Casbin enforcer not initialized. Call initEnforcer() first.');
    }
    return await enforcer.enforce(role, path, method);
};