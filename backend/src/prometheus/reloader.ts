import axios from 'axios';

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://prometheus:9090';

// POST /-/reload triggers Prometheus to reload its config
// Requires --web.enable-lifecycle flag on Prometheus startup
// ⚠️ This is called internally only — never exposed publicly
export async function reloadPrometheus(): Promise<void> {
    try {
        await axios.post(
            `${PROMETHEUS_URL}/-/reload`,
            null,
            { timeout: 10_000 }
        );
        console.log('[Reloader] Prometheus config reloaded successfully');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                `Failed to reload Prometheus: ${error.response?.status} ${error.message}`
            );
        }
        throw error;
    }
}

// Verify Prometheus is reachable before attempting reload
export async function checkPrometheusHealth(): Promise<boolean> {
    try {
        const res = await axios.get(
            `${PROMETHEUS_URL}/-/healthy`,
            { timeout: 5_000 }
        );
        return res.status === 200;
    } catch {
        return false;
    }
}