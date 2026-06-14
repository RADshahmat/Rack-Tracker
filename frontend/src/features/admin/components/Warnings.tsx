import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWarnings, useResolveWarning } from '../hooks/useAdmin';

export function Warnings() {
  const [activeTab, setActiveTab] = useState('unresolved');
  
  const { data: warningsData, isLoading: warningsLoading } = useWarnings(activeTab === 'unresolved' ? false : undefined);
  const { mutate: resolveWarning, isPending: isResolving } = useResolveWarning();

  const warnings = warningsData?.data || [];

  const handleResolveWarning = (warningId: number) => {
    resolveWarning(warningId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Warnings</span>
          <Badge variant="outline">
            {warnings.filter((w) => !w.resolved).length} Unresolved
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {warningsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-sky-600" />
              </div>
            ) : warnings.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">
                  {activeTab === 'unresolved' ? 'No unresolved warnings' : 'No warnings'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Rack Tag</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-16">Emailed</TableHead>
                      <TableHead className="w-32">Created At</TableHead>
                      <TableHead className="w-24 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warnings.map((warning) => (
                      <TableRow key={warning.id}>
                        <TableCell className="font-medium text-sm">
                          {warning.rackTag}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {warning.message}
                        </TableCell>
                        <TableCell>
                          <Badge variant={warning.resolved ? 'default' : 'destructive'}>
                            {warning.resolved ? 'Resolved' : 'Unresolved'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {warning.emailed ? 'Sent' : '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(warning.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {!warning.resolved && (
                            <Button
                              onClick={() => handleResolveWarning(warning.id)}
                              disabled={isResolving}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              {isResolving ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                'Resolve'
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
