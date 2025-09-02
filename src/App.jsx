import React, { useEffect } from "react";
import { AuthProvider } from "./components/AuthProvider";
import Routes from "./Routes";
import { schedulerService } from "./services/schedulerService";

function App() {
  useEffect(() => {
    // Initialize the billing scheduler when app starts
    schedulerService.initialize();
    
    // Cleanup function to clear intervals when component unmounts
    return () => {
      // Note: In a real production app, you'd want to properly cleanup intervals
      console.log('App unmounting - scheduler cleanup would go here');
    };
  }, []);

  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;
