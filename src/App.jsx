import { useEffect } from "react";
import Navbar from "./components/Navbar";
import SmartParkingDashboard from "./components/SmartParkingDashboard";
import { requestPermission } from "./firebase/firebase";


function App() {
  useEffect(() => {
    requestPermission();
  }, []);
  return (
    <div>
      <Navbar></Navbar>
      <SmartParkingDashboard />
    </div>
  );
}

export default App;
