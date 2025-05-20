
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PatientRegistrationForm from './PatientRegistrationForm';
import SqlQueryInterface from './SqlQueryInterface';
import PatientList from './PatientList';
import { initializeDB } from '@/lib/db';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Dashboard = () => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const setup = async () => {
      try {
        console.log('Initializing database...');
        await initializeDB();
        console.log('Database initialized successfully');
        setIsDbReady(true);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        // Show a clearer error message with fallback information
        setError('There was an issue initializing the database. The app is using a fallback local storage solution. Your data will still be saved in this browser.');
        
        // Since we have a fallback mechanism, we'll consider the DB ready despite the error
        setIsDbReady(true);
      }
    };

    setup();
  }, [retryCount]);

  if (error && !isDbReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md neo-card shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <button 
          onClick={() => setRetryCount(prev => prev + 1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!isDbReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex items-center justify-center p-8 neo-card shadow-lg rounded-full">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
        <p className="text-gray-500 animate-pulse mt-4 neo-card px-6 py-2 rounded-full">Initializing database...</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="patients" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6 bg-gray-100/80 shadow-inner rounded-xl overflow-hidden">
        <TabsTrigger 
          value="register" 
          className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-[inset_0_-2px_0_0_#3b82f6,_0_1px_3px_rgba(0,0,0,0.1)] py-3 data-[state=active]:translate-y-[1px] transition-all duration-200"
        >
          Register
        </TabsTrigger>
        <TabsTrigger 
          value="patients" 
          className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-[inset_0_-2px_0_0_#3b82f6,_0_1px_3px_rgba(0,0,0,0.1)] py-3 data-[state=active]:translate-y-[1px] transition-all duration-200"
        >
          Patients
        </TabsTrigger>
        <TabsTrigger 
          value="query" 
          className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-[inset_0_-2px_0_0_#3b82f6,_0_1px_3px_rgba(0,0,0,0.1)] py-3 data-[state=active]:translate-y-[1px] transition-all duration-200"
        >
          SQL Query
        </TabsTrigger>
      </TabsList>
      <TabsContent value="register" className="animate-in fade-in-50 slide-in-from-left-5 duration-300">
        <PatientRegistrationForm />
      </TabsContent>
      <TabsContent value="patients" className="animate-in fade-in-50 slide-in-from-left-5 duration-300">
        <PatientList />
      </TabsContent>
      <TabsContent value="query" className="animate-in fade-in-50 slide-in-from-left-5 duration-300">
        <SqlQueryInterface />
      </TabsContent>
    </Tabs>
  );
};

export default Dashboard;
