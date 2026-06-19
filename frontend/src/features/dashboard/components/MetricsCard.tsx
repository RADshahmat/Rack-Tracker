import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RacksCreatedChart } from './RacksCreatedChart';
import { HttpRequestRateChart } from './HttpRequestRateChart';
import { LoginAttemptsChart } from './LoginAttemptsChart';

export function MetricsCard() {
    return (
        <div className="lg:col-span-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Infrastructure Metrics
            </h3>

            <Tabs defaultValue="racks">
                <TabsList className="mb-4">
                    <TabsTrigger value="racks">Racks Created</TabsTrigger>
                    <TabsTrigger value="requests">Request Rate</TabsTrigger>
                    <TabsTrigger value="logins">Login Attempts</TabsTrigger>
                </TabsList>

                <TabsContent value="racks">
                    <RacksCreatedChart />
                </TabsContent>
                <TabsContent value="requests">
                    <HttpRequestRateChart />
                </TabsContent>
                <TabsContent value="logins">
                    <LoginAttemptsChart />
                </TabsContent>
            </Tabs>
        </div>
    );
}