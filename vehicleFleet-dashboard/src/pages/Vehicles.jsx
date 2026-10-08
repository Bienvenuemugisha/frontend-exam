import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import StatusChip from "../components/common/StatusChip.jsx";
import FilterPanel from "../components/common/FilterPanel.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import VehicleForm from "../components/vehicles/VehicleForm.jsx";
import AssignVehicleDialog from "../components/vehicles/AssignVehicleDialog.jsx";
import { useSnackbar } from "../components/common/useSnackbar.jsx";
import { useFleet } from "../context/FleetContext.jsx";
import { VEHICLE_TYPES, FUEL_TYPES, VEHICLE_STATUSES } from "../data/constants";

export default function Vehicles() {
  const navigate = useNavigate();
  const { vehicles, drivers, deleteVehicle } = useFleet();
  const { notify, SnackbarElement } = useSnackbar();

  const [filters, setFilters] = useState({ search: "", vehicleType: "", fuelType: "", status: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const rows = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return vehicles.filter((v) => {
      const driverName = drivers.find((d) => d.id === v.assignedDriverId)?.fullName || "";
      const matchesSearch =
        !term ||
        v.registrationNumber.toLowerCase().includes(term) ||
        v.make.toLowerCase().includes(term) ||
        v.model.toLowerCase().includes(term) ||
        v.location.toLowerCase().includes(term) ||
        driverName.toLowerCase().includes(term);
      const matchesType = !filters.vehicleType || v.vehicleType === filters.vehicleType;
      const matchesFuel = !filters.fuelType || v.fuelType === filters.fuelType;
      const matchesStatus = !filters.status || v.status === filters.status;
      return matchesSearch && matchesType && matchesFuel && matchesStatus;
    }).map((v) => ({ ...v, driverName: drivers.find((d) => d.id === v.assignedDriverId)?.fullName || "—" }));
  }, [vehicles, drivers, filters]);

  const columns = [
    { field: "id", headerName: "Vehicle ID", width: 100 },
    { field: "registrationNumber", headerName: "Registration No.", width: 140 },
    { field: "vehicleType", headerName: "Type", width: 100 },
    { field: "make", headerName: "Make", width: 100 },
    { field: "model", headerName: "Model", width: 120 },
    { field: "year", headerName: "Year", width: 80, type: "number" },
    { field: "color", headerName: "Color", width: 90 },
    { field: "fuelType", headerName: "Fuel", width: 90 },
    { field: "currentMileage", headerName: "Mileage (km)", width: 120, type: "number" },
    { field: "location", headerName: "Location", width: 130 },
    { field: "driverName", headerName: "Assigned Driver", width: 150 },
    { field: "purchaseDate", headerName: "Purchase Date", width: 120 },
    {
      field: "status", headerName: "Status", width: 130,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "actions", headerName: "Actions", width: 170, sortable: false, filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View details">
            <IconButton size="small" onClick={() => navigate(`/vehicles/${params.row.id}`)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => { setEditing(params.row); setFormOpen(true); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Assign vehicle">
            <IconButton size="small" onClick={() => setAssignTarget(params.row)} disabled={params.row.status !== "Available"}>
              <AssignmentIndIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(params.row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Vehicles</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
          Register Vehicle
        </Button>
      </Stack>

      <FilterPanel
        searchLabel="Search by registration, make, model, driver, location"
        values={filters}
        onChange={setFilters}
        onClear={() => setFilters({ search: "", vehicleType: "", fuelType: "", status: "" })}
        fields={[
          { name: "vehicleType", label: "Vehicle Type", options: VEHICLE_TYPES },
          { name: "fuelType", label: "Fuel Type", options: FUEL_TYPES },
          { name: "status", label: "Status", options: VEHICLE_STATUSES },
        ]}
      />

      <Box sx={{ height: 600, bgcolor: "background.paper", borderRadius: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>

      <VehicleForm
        open={formOpen}
        vehicle={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(msg) => notify(msg, "success")}
      />
      <AssignVehicleDialog
        open={!!assignTarget}
        vehicle={assignTarget}
        onClose={() => setAssignTarget(null)}
        onSaved={(msg) => notify(msg, "success")}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete vehicle?"
        message={`This will permanently remove ${deleteTarget?.registrationNumber} from the fleet.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteVehicle(deleteTarget.id);
          notify("Vehicle deleted", "info");
          setDeleteTarget(null);
        }}
      />
      {SnackbarElement}
    </Box>
  );
}
