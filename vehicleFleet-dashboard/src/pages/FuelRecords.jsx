import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import PaidIcon from "@mui/icons-material/Paid";
import StatCard from "../components/common/StatCard.jsx";
import FilterPanel from "../components/common/FilterPanel.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import FuelRecordForm from "../components/fuel/FuelRecordForm.jsx";
import { useSnackbar } from "../components/common/useSnackbar.jsx";
import { useFleet } from "../context/FleetContext.jsx";
import { totalFuelCost, totalLitres } from "../utils/calculations";

export default function FuelRecords() {
  const { fuelRecords, vehicles, drivers, deleteFuelRecord } = useFleet();
  const { notify, SnackbarElement } = useSnackbar();
  const [filters, setFilters] = useState({ search: "", vehicleId: "", driverId: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const rows = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return fuelRecords
      .map((f) => ({
        ...f,
        vehicleReg: vehicles.find((v) => v.id === f.vehicleId)?.registrationNumber || f.vehicleId,
        driverName: drivers.find((d) => d.id === f.driverId)?.fullName || f.driverId,
      }))
      .filter((f) => {
        const matchesSearch =
          !term || f.vehicleReg.toLowerCase().includes(term) || f.driverName.toLowerCase().includes(term) ||
          (f.fuelStation || "").toLowerCase().includes(term);
        const matchesVehicle = !filters.vehicleId || f.vehicleId === filters.vehicleId;
        const matchesDriver = !filters.driverId || f.driverId === filters.driverId;
        return matchesSearch && matchesVehicle && matchesDriver;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [fuelRecords, vehicles, drivers, filters]);

  const columns = [
    { field: "id", headerName: "Record ID", width: 100 },
    { field: "vehicleReg", headerName: "Vehicle", width: 120 },
    { field: "driverName", headerName: "Driver", width: 150 },
    { field: "date", headerName: "Date", width: 110 },
    { field: "odometer", headerName: "Odometer", width: 100, type: "number" },
    { field: "litres", headerName: "Litres", width: 90, type: "number" },
    { field: "pricePerLitre", headerName: "Price/L", width: 90, type: "number" },
    { field: "totalCost", headerName: "Total Cost", width: 110, type: "number" },
    { field: "fuelStation", headerName: "Station", width: 140 },
    { field: "referenceNumber", headerName: "Reference", width: 120 },
    {
      field: "actions", headerName: "Actions", width: 100, sortable: false, filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => { setEditing(params.row); setFormOpen(true); }}>
              <EditIcon fontSize="small" />
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
        <Typography variant="h4">Fuel Records</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
          Add Fuel Record
        </Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <StatCard label="Total Fuel Cost" value={totalFuelCost(rows).toLocaleString()} suffix="RWF" icon={PaidIcon} accent="#E08A2C" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard label="Total Litres Consumed" value={totalLitres(rows).toLocaleString()} suffix="L" icon={LocalGasStationIcon} accent="#2C7BA6" />
        </Grid>
      </Grid>

      <FilterPanel
        searchLabel="Search by vehicle, driver, station"
        values={filters}
        onChange={setFilters}
        onClear={() => setFilters({ search: "", vehicleId: "", driverId: "" })}
        fields={[
          { name: "vehicleId", label: "Vehicle", options: vehicles.map((v) => v.id) },
          { name: "driverId", label: "Driver", options: drivers.map((d) => d.id) },
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

      <FuelRecordForm
        open={formOpen}
        record={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(msg) => notify(msg, "success")}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete fuel record?"
        message="This record will be permanently removed."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteFuelRecord(deleteTarget.id);
          notify("Fuel record deleted", "info");
          setDeleteTarget(null);
        }}
      />
      {SnackbarElement}
    </Box>
  );
}
