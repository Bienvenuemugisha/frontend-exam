import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { generateSeedData } from "../data/seedGenerator";
import { loadFromStorage, saveToStorage } from "../utils/storage";
import { nextId } from "../utils/ids";

const FleetContext = createContext(null);

const STORAGE_KEYS = {
  vehicles: "vehicles",
  drivers: "drivers",
  assignments: "assignments",
  fuelRecords: "fuelRecords",
  maintenanceRecords: "maintenanceRecords",
  mileageRecords: "mileageRecords",
  seeded: "seeded",
};

function useSeededState(key, seedValue) {
  const [value, setValue] = useState(() => loadFromStorage(key, seedValue));
  useEffect(() => {
    saveToStorage(key, value);
  }, [key, value]);
  return [value, setValue];
}

export function FleetProvider({ children }) {
  const seed = useMemo(() => {
    const alreadySeeded = loadFromStorage(STORAGE_KEYS.seeded, false);
    if (alreadySeeded) return null;
    return generateSeedData();
  }, []);

  const [vehicles, setVehicles] = useSeededState(
    STORAGE_KEYS.vehicles,
    seed ? seed.vehicles : []
  );
  const [drivers, setDrivers] = useSeededState(STORAGE_KEYS.drivers, seed ? seed.drivers : []);
  const [assignments, setAssignments] = useSeededState(
    STORAGE_KEYS.assignments,
    seed ? seed.assignments : []
  );
  const [fuelRecords, setFuelRecords] = useSeededState(
    STORAGE_KEYS.fuelRecords,
    seed ? seed.fuelRecords : []
  );
  const [maintenanceRecords, setMaintenanceRecords] = useSeededState(
    STORAGE_KEYS.maintenanceRecords,
    seed ? seed.maintenanceRecords : []
  );
  const [mileageRecords, setMileageRecords] = useSeededState(
    STORAGE_KEYS.mileageRecords,
    seed ? seed.mileageRecords : []
  );

  useEffect(() => {
    if (seed) saveToStorage(STORAGE_KEYS.seeded, true);
  
  }, []);

  // ---------- Vehicles ----------
  const addVehicle = useCallback(
    (data) => {
      const id = nextId("V", vehicles);
      setVehicles((prev) => [...prev, { id, assignedDriverId: null, status: "Available", ...data }]);
      return id;
    },
    [vehicles, setVehicles]
  );
  const updateVehicle = useCallback(
    (id, data) => setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v))),
    [setVehicles]
  );
  const deleteVehicle = useCallback(
    (id) => setVehicles((prev) => prev.filter((v) => v.id !== id)),
    [setVehicles]
  );
  const isRegistrationDuplicate = useCallback(
    (regNumber, excludeId) =>
      vehicles.some(
        (v) => v.registrationNumber.toLowerCase() === regNumber.toLowerCase() && v.id !== excludeId
      ),
    [vehicles]
  );

  // ---------- Drivers ----------
  const addDriver = useCallback(
    (data) => {
      const id = nextId("D", drivers);
      setDrivers((prev) => [...prev, { id, assignedVehicleId: null, status: "Available", ...data }]);
      return id;
    },
    [drivers, setDrivers]
  );
  const updateDriver = useCallback(
    (id, data) => setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d))),
    [setDrivers]
  );
  const deleteDriver = useCallback(
    (id) => setDrivers((prev) => prev.filter((d) => d.id !== id)),
    [setDrivers]
  );

  // ---------- Assignment workflow ----------
  const assignVehicle = useCallback(
    (data) => {
      const id = nextId("A", assignments);
      setAssignments((prev) => [
        ...prev,
        { id, status: "Active", remarks: "", ...data },
      ]);
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === data.vehicleId ? { ...v, assignedDriverId: data.driverId, status: "Assigned" } : v
        )
      );
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === data.driverId ? { ...d, assignedVehicleId: data.vehicleId, status: "Assigned" } : d
        )
      );
      return id;
    },
    [assignments, setAssignments, setVehicles, setDrivers]
  );

  const endAssignment = useCallback(
    (assignmentId) => {
      const assignment = assignments.find((a) => a.id === assignmentId);
      if (!assignment) return;
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, status: "Completed" } : a))
      );
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === assignment.vehicleId ? { ...v, assignedDriverId: null, status: "Available" } : v
        )
      );
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === assignment.driverId ? { ...d, assignedVehicleId: null, status: "Available" } : d
        )
      );
    },
    [assignments, setAssignments, setVehicles, setDrivers]
  );

  // ---------- Fuel ----------
  const addFuelRecord = useCallback(
    (data) => {
      const id = nextId("F", fuelRecords);
      const record = { id, ...data };
      setFuelRecords((prev) => [...prev, record]);
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === data.vehicleId && Number(data.odometer) > Number(v.currentMileage)
            ? { ...v, currentMileage: Number(data.odometer) }
            : v
        )
      );
      return id;
    },
    [fuelRecords, setFuelRecords, setVehicles]
  );
  const updateFuelRecord = useCallback(
    (id, data) => setFuelRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r))),
    [setFuelRecords]
  );
  const deleteFuelRecord = useCallback(
    (id) => setFuelRecords((prev) => prev.filter((r) => r.id !== id)),
    [setFuelRecords]
  );

  // ---------- Maintenance ----------
  const addMaintenanceRecord = useCallback(
    (data) => {
      const id = nextId("M", maintenanceRecords);
      setMaintenanceRecords((prev) => [...prev, { id, ...data }]);
      if (data.status === "In Progress" || data.status === "Scheduled") {
        setVehicles((prev) =>
          prev.map((v) => (v.id === data.vehicleId ? { ...v, status: "Maintenance" } : v))
        );
      }
      return id;
    },
    [maintenanceRecords, setMaintenanceRecords, setVehicles]
  );
  const updateMaintenanceRecord = useCallback(
    (id, data) => {
      setMaintenanceRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
      if (data.status === "Completed") {
        const record = maintenanceRecords.find((r) => r.id === id);
        const vehicleId = data.vehicleId || record?.vehicleId;
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicleId ? { ...v, status: "Available" } : v))
        );
      } else if (data.status === "In Progress" || data.status === "Scheduled") {
        const record = maintenanceRecords.find((r) => r.id === id);
        const vehicleId = data.vehicleId || record?.vehicleId;
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicleId ? { ...v, status: "Maintenance" } : v))
        );
      }
    },
    [maintenanceRecords, setMaintenanceRecords, setVehicles]
  );
  const deleteMaintenanceRecord = useCallback(
    (id) => setMaintenanceRecords((prev) => prev.filter((r) => r.id !== id)),
    [setMaintenanceRecords]
  );

  // ---------- Mileage ----------
  const addMileageRecord = useCallback(
    (data) => {
      const id = nextId("MI", mileageRecords);
      setMileageRecords((prev) => [...prev, { id, ...data }]);
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === data.vehicleId && Number(data.endMileage) > Number(v.currentMileage)
            ? { ...v, currentMileage: Number(data.endMileage) }
            : v
        )
      );
      return id;
    },
    [mileageRecords, setMileageRecords, setVehicles]
  );
  const updateMileageRecord = useCallback(
    (id, data) => setMileageRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r))),
    [setMileageRecords]
  );
  const deleteMileageRecord = useCallback(
    (id) => setMileageRecords((prev) => prev.filter((r) => r.id !== id)),
    [setMileageRecords]
  );

  const changeVehicleStatus = useCallback(
    (id, status) => setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v))),
    [setVehicles]
  );

  const value = useMemo(
    () => ({
      vehicles,
      drivers,
      assignments,
      fuelRecords,
      maintenanceRecords,
      mileageRecords,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      isRegistrationDuplicate,
      addDriver,
      updateDriver,
      deleteDriver,
      assignVehicle,
      endAssignment,
      addFuelRecord,
      updateFuelRecord,
      deleteFuelRecord,
      addMaintenanceRecord,
      updateMaintenanceRecord,
      deleteMaintenanceRecord,
      addMileageRecord,
      updateMileageRecord,
      deleteMileageRecord,
      changeVehicleStatus,
    }),
    [
      vehicles, drivers, assignments, fuelRecords, maintenanceRecords, mileageRecords,
      addVehicle, updateVehicle, deleteVehicle, isRegistrationDuplicate,
      addDriver, updateDriver, deleteDriver,
      assignVehicle, endAssignment,
      addFuelRecord, updateFuelRecord, deleteFuelRecord,
      addMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord,
      addMileageRecord, updateMileageRecord, deleteMileageRecord,
      changeVehicleStatus,
    ]
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error("useFleet must be used within a FleetProvider");
  return ctx;
}
