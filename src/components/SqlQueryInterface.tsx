
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { executeQuery } from '@/lib/db';
import { toast } from '@/components/ui/sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Play, AlertCircle } from 'lucide-react';

const SqlQueryInterface = () => {
  const [query, setQuery] = useState("SELECT * FROM patients LIMIT 10");
  const [results, setResults] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runQuery = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Only allow SELECT queries for safety
      const trimmedQuery = query.trim().toLowerCase();
      if (!trimmedQuery.startsWith('select')) {
        throw new Error('Only SELECT queries are allowed in this interface');
      }
      
      const result = await executeQuery(query);
      
      // Type assertion to handle the TypeScript error
      const queryResult = result as unknown as { columns: { name: string }[]; rows: any[] };
      
      // Extract column names
      const columns = queryResult.columns.map((col: any) => col.name);
      
      setResults({
        columns,
        rows: queryResult.rows
      });
      
      toast.success('Query executed successfully');
    } catch (err) {
      console.error('Query error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast.error(`Query failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-[0_10px_20px_rgba(0,0,0,0.08)] rounded-2xl border border-gray-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-100 rounded-full shadow-inner">
            <Database className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-blue-900">SQL Query Interface</CardTitle>
            <CardDescription className="text-blue-700/70">Run SQL queries on patient data</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        <div className="bg-white rounded-xl p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
          <Textarea 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your SQL query here..."
            className="font-mono min-h-[120px] border-0 focus-visible:ring-0 shadow-none resize-y bg-transparent"
          />
        </div>
        
        <Button 
          onClick={runQuery} 
          disabled={isLoading} 
          className="w-full shadow-[0_4px_10px_rgba(37,99,235,0.2)] bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_4px_15px_rgba(37,99,235,0.35)] transition-all hover:from-blue-700 hover:to-indigo-700"
        >
          <Play className="mr-2 h-4 w-4" />
          {isLoading ? 'Running...' : 'Run Query'}
        </Button>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 shadow-sm flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Query Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {results && (
          <div className="border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-indigo-50/50 p-2 border-b border-indigo-100/50 text-xs font-medium text-indigo-800">
              Query Results
            </div>
            <ScrollArea className="h-[300px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      {results.columns.map((column, index) => (
                        <TableHead key={index} className="whitespace-nowrap font-semibold text-blue-900">{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-blue-50/30 transition-colors">
                        {results.columns.map((column, colIndex) => (
                          <TableCell key={colIndex} className="whitespace-nowrap">
                            {row[column] !== null ? String(row[column]) : 'null'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {results.rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={results.columns.length} className="text-center py-8 text-gray-500">
                          No results found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SqlQueryInterface;
