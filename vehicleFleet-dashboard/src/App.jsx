import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import VehicleDetails from "./pages/VehicleDetails.jsx";
import Drivers from "./pages/Drivers.jsx";
import Assignments from "./pages/Assignments.jsx";
import FuelRecords from "./pages/FuelRecords.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import MileageRecords from "./pages/MileageRecords.jsx";
import Reports from "./pages/Reports.jsx";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:vehicleId" element={<VehicleDetails />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/fuel" element={<FuelRecords />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/mileage" element={<MileageRecords />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </AppLayout>
  );
}
