
import Dashboard from '../components/Dashboard';
import { Activity, Calendar, Clock, Database, User, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-2 rounded-lg mr-3 neo-card flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Patient Registration System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center text-sm text-gray-600 neo-inset rounded-full px-4 py-1.5">
                <Clock className="h-4 w-4 mr-1 text-blue-500" />
                <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <div className="mx-2 h-3 w-px bg-gray-300"></div>
                <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="neo-card p-6 mb-8 transition-all hover:shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff]">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Patient Management Portal</h2>
              <p className="text-gray-600 max-w-2xl">
                Register new patients, browse existing records, and run SQL queries on patient data.
              </p>
            </div>
            <div className="flex space-x-4">
              <div className="neo-card flex items-center justify-center h-14 w-14 animate-float">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="neo-card flex items-center justify-center h-14 w-14 animate-float" style={{ animationDelay: "0.2s" }}>
                <Database className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="neo-card flex items-center justify-center h-14 w-14 animate-float" style={{ animationDelay: "0.4s" }}>
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Dashboard />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="neo-card p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center space-x-4 transform transition-all hover:shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff]">
            <div className="neo-inset p-3 rounded-lg">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1 text-blue-800">Local Database</h3>
              <p className="text-blue-700/70">All patient data is stored securely in your browser using PGlite</p>
            </div>
          </div>
          
          <div className="neo-card p-6 bg-gradient-to-br from-indigo-50 to-indigo-100/50 flex items-center space-x-4 transform transition-all hover:shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff]">
            <div className="neo-inset p-3 rounded-lg">
              <Activity className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1 text-indigo-800">Real-Time Sync</h3>
              <p className="text-indigo-700/70">Changes synchronize between multiple tabs in real-time</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-center md:text-left text-sm text-gray-600">
              Patient Registration System Demo using PGlite for client-side SQL storage.
            </p>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <div className="neo-card h-8 w-8 flex items-center justify-center text-blue-600">
                <Database className="h-4 w-4" />
              </div>
              <div className="neo-card h-8 w-8 flex items-center justify-center text-indigo-600">
                <Activity className="h-4 w-4" />
              </div>
              <div className="neo-card h-8 w-8 flex items-center justify-center text-purple-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
