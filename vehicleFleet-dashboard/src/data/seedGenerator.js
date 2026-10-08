import {
  VEHICLE_TYPES,
  FUEL_TYPES,
  VEHICLE_STATUSES,
  DRIVER_STATUSES,
  MAINTENANCE_TYPES,
  MAINTENANCE_STATUSES,
  LOCATIONS,
  DEPARTMENTS,
  MAKES_BY_TYPE,
  COLORS,
} from "./constants";

const FIRST_NAMES = [
  "Jean", "Marie", "Eric", "Alice", "Patrick", "Diane", "Robert", "Grace",
  "Emmanuel", "Claudine", "Vincent", "Josiane", "Aime", "Solange", "Fabrice",
  "Yvonne", "Olivier", "Chantal", "Innocent", "Beatrice",
];
const LAST_NAMES = [
  "Uwase", "Mugisha", "Niyonzima", "Ishimwe", "Habimana", "Mukamana",
  "Nkurunziza", "Uwimana", "Bizimana", "Mutesi", "Rugamba", "Nshimiyimana",
  "Karangwa", "Iradukunda", "Ndayishimiye", "Umutoni", "Gasana", "Kayitesi",
  "Munyaneza", "Ingabire",
];

function pick(arr, i) {
  return arr[i % arr.length];
}
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rand = seededRandom(42);
function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pickRandom(arr) {
  return arr[Math.floor(rand() * arr.length)];
}
function isoDateAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
function isoDateFuture(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateSeedData() {
  // ---- Vehicles ----
  const vehicles = [];
  for (let i = 1; i <= 30; i++) {
    const type = pick(VEHICLE_TYPES, i - 1);
    const make = pickRandom(MAKES_BY_TYPE[type]);
    const status =
      i <= 12 ? "Available" :
      i <= 20 ? "Assigned" :
      i <= 24 ? "In Use" :
      i <= 27 ? "Maintenance" :
      i <= 29 ? "Out of Service" : "Retired";
    vehicles.push({
      id: `V-${String(i).padStart(4, "0")}`,
      registrationNumber: `RA${String(100 + i)}${["A", "B", "C"][i % 3]}`,
      vehicleType: type,
      make: make.split(" ")[0],
      model: make.split(" ").slice(1).join(" ") || "Standard",
      year: 2016 + (i % 9),
      color: pick(COLORS, i),
      fuelType: pick(FUEL_TYPES, i),
      currentMileage: randInt(5000, 180000),
      location: pick(LOCATIONS, i),
      assignedDriverId: null,
      purchaseDate: isoDateAgo(randInt(200, 2200)),
      purchasePrice: randInt(8000, 60000),
      status,
      description: "",
    });
  }

  // ---- Drivers ----
  const drivers = [];
  for (let i = 1; i <= 20; i++) {
    const status = i <= 8 ? "Assigned" : i <= 16 ? "Available" : i <= 18 ? "On Leave" : "Inactive";
    drivers.push({
      id: `D-${String(i).padStart(4, "0")}`,
      fullName: `${pick(FIRST_NAMES, i - 1)} ${pick(LAST_NAMES, i - 1)}`,
      staffNumber: `EMP-${String(2000 + i)}`,
      phone: `+250 78${randInt(1000000, 9999999)}`,
      email: `driver${i}@fleetco.rw`,
      licenseNumber: `DL-${randInt(100000, 999999)}`,
      licenseExpiry: isoDateFuture(randInt(-60, 720)),
      department: pick(DEPARTMENTS, i),
      assignedVehicleId: null,
      status,
    });
  }

  // Link the first 8 vehicles marked Assigned/In Use to the 8 assigned drivers
  const assignedVehicles = vehicles.filter((v) => v.status === "Assigned" || v.status === "In Use");
  const assignedDrivers = drivers.filter((d) => d.status === "Assigned");
  assignedDrivers.forEach((driver, idx) => {
    const vehicle = assignedVehicles[idx];
    if (vehicle) {
      vehicle.assignedDriverId = driver.id;
      driver.assignedVehicleId = vehicle.id;
    }
  });

  // ---- Assignments (history, includes the current active ones above) ----
  const assignments = [];
  let assignmentCounter = 1;
  assignedDrivers.forEach((driver, idx) => {
    const vehicle = assignedVehicles[idx];
    if (!vehicle) return;
    assignments.push({
      id: `A-${String(assignmentCounter).padStart(4, "0")}`,
      vehicleId: vehicle.id,
      driverId: driver.id,
      assignmentDate: isoDateAgo(randInt(5, 60)),
      startMileage: Math.max(0, vehicle.currentMileage - randInt(200, 2000)),
      location: vehicle.location,
      purpose: pickRandom(["Field operations", "Client visits", "Logistics run", "Site supervision"]),
      expectedReturnDate: isoDateFuture(randInt(10, 90)),
      remarks: "",
      status: "Active",
    });
    assignmentCounter++;
  });
  // Historical (returned) assignments to reach 20 total
  while (assignments.length < 20) {
    const vehicle = pickRandom(vehicles);
    const driver = pickRandom(drivers);
    assignments.push({
      id: `A-${String(assignmentCounter).padStart(4, "0")}`,
      vehicleId: vehicle.id,
      driverId: driver.id,
      assignmentDate: isoDateAgo(randInt(90, 400)),
      startMileage: randInt(1000, 100000),
      location: pickRandom(LOCATIONS),
      purpose: pickRandom(["Field operations", "Client visits", "Logistics run", "Delivery"]),
      expectedReturnDate: isoDateAgo(randInt(30, 89)),
      remarks: "Returned on schedule",
      status: "Completed",
    });
    assignmentCounter++;
  }

  // ---- Fuel records (50, spread over the last 6 months) ----
  const fuelRecords = [];
  for (let i = 1; i <= 50; i++) {
    const vehicle = pickRandom(vehicles);
    const litres = randInt(15, 80);
    const pricePerLitre = [1350, 1400, 1450][randInt(0, 2)];
    fuelRecords.push({
      id: `F-${String(i).padStart(4, "0")}`,
      vehicleId: vehicle.id,
      driverId: vehicle.assignedDriverId || pickRandom(drivers).id,
      date: isoDateAgo(randInt(0, 180)),
      odometer: Math.max(0, vehicle.currentMileage - randInt(0, 15000)),
      litres,
      pricePerLitre,
      totalCost: litres * pricePerLitre,
      fuelStation: pickRandom(["Engen Kacyiru", "SP Remera", "Kobil Nyabugogo", "Total Kimironko"]),
      referenceNumber: `RCPT-${randInt(10000, 99999)}`,
      remarks: "",
    });
  }

  // ---- Maintenance records (30) ----
  const maintenanceRecords = [];
  for (let i = 1; i <= 30; i++) {
    const vehicle = pickRandom(vehicles);
    const status = i <= 4 ? "Scheduled" : i <= 8 ? "In Progress" : i <= 27 ? "Completed" : "Cancelled";
    maintenanceRecords.push({
      id: `M-${String(i).padStart(4, "0")}`,
      vehicleId: vehicle.id,
      maintenanceType: pickRandom(MAINTENANCE_TYPES),
      date: status === "Scheduled" ? isoDateFuture(randInt(1, 30)) : isoDateAgo(randInt(0, 200)),
      mileage: vehicle.currentMileage,
      description: "Scheduled service and inspection",
      serviceProvider: pickRandom(["AutoCare Kigali", "FleetFix Garage", "RwandaMotors Service"]),
      cost: status === "Cancelled" ? 0 : randInt(20000, 400000),
      nextServiceDate: isoDateFuture(randInt(60, 180)),
      nextServiceMileage: vehicle.currentMileage + randInt(3000, 8000),
      status,
      remarks: "",
    });
  }

  // ---- Mileage records (50) ----
  const mileageRecords = [];
  for (let i = 1; i <= 50; i++) {
    const vehicle = pickRandom(vehicles);
    const start = Math.max(0, vehicle.currentMileage - randInt(50, 500));
    const distance = randInt(10, 300);
    mileageRecords.push({
      id: `MI-${String(i).padStart(4, "0")}`,
      vehicleId: vehicle.id,
      driverId: vehicle.assignedDriverId || pickRandom(drivers).id,
      date: isoDateAgo(randInt(0, 150)),
      startMileage: start,
      endMileage: start + distance,
      purpose: pickRandom(["Delivery", "Client visit", "Site inspection", "Errand", "Transport"]),
      destination: pickRandom(LOCATIONS),
      remarks: "",
    });
  }

  return { vehicles, drivers, assignments, fuelRecords, maintenanceRecords, mileageRecords };
}
