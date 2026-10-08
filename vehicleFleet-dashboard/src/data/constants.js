export const VEHICLE_TYPES = ["Car", "Pickup", "Van", "Bus", "Truck", "Motorcycle"];

export const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid"];

export const VEHICLE_STATUSES = [
  "Available",
  "Assigned",
  "In Use",
  "Maintenance",
  "Out of Service",
  "Retired",
];

export const DRIVER_STATUSES = ["Available", "Assigned", "On Leave", "Inactive"];

export const MAINTENANCE_TYPES = [
  "Routine Service",
  "Oil Change",
  "Tire Replacement",
  "Brake Service",
  "Engine Repair",
  "Electrical Repair",
  "Body Repair",
  "Inspection",
];

export const MAINTENANCE_STATUSES = ["Scheduled", "In Progress", "Completed", "Cancelled"];

export const LOCATIONS = [
  "Kigali Depot",
  "Musanze Yard",
  "Huye Branch",
  "Rubavu Warehouse",
  "Nyagatare Site",
  "Rusizi Terminal",
];

export const DEPARTMENTS = [
  "Logistics",
  "Operations",
  "Sales",
  "Maintenance",
  "Administration",
  "Field Services",
];

export const MAKES_BY_TYPE = {
  Car: ["Toyota Corolla", "Honda Civic", "Volkswagen Jetta"],
  Pickup: ["Toyota Hilux", "Ford Ranger", "Isuzu D-Max"],
  Van: ["Toyota HiAce", "Mercedes Sprinter", "Nissan NV350"],
  Bus: ["Toyota Coaster", "Mercedes Marco Polo", "Higer KLQ"],
  Truck: ["Isuzu FRR", "Mitsubishi Fuso", "Mercedes Actros"],
  Motorcycle: ["Yamaha AG100", "Bajaj Boxer", "TVS Star"],
};

export const COLORS = ["White", "Silver", "Black", "Blue", "Red", "Grey"];

export const STATUS_COLORS = {
  Available: "success",
  Assigned: "info",
  "In Use": "primary",
  Maintenance: "warning",
  "Out of Service": "error",
  Retired: "default",
  "On Leave": "warning",
  Inactive: "default",
  Scheduled: "info",
  "In Progress": "warning",
  Completed: "success",
  Cancelled: "default",
};
