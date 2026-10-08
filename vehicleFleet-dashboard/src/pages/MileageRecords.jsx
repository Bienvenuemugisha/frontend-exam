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
import TimelineIcon from "@mui/icons-material/Timeline";
import StatCard from "../components/common/StatCard.jsx";
import FilterPanel from "../components/common/FilterPanel.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import MileageForm from "../components/mileage/MileageForm.jsx";
import { useSnackbar } from "../components/common/useSnackbar.jsx";
import { useFleet } from "../context/FleetContext.jsx";
import { mileageDistance, totalDistance } from "../utils/calculations";

export default function MileageRecords() {
  const { mileageRecords, vehicles, drivers, deleteMileageRecord } = useFleet();
  const { notify, SnackbarElement } = useSnackbar();
  const [filters, setFilters] = useState({ search: "", vehicleId: "", driverId: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const rows = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return mileageRecords
      .map((m) => ({
        ...m,
        vehicleReg: vehicles.find((v) => v.id === m.vehicleId)?.registrationNumber || m.vehicleId,
        driverName: drivers.find((d) => d.id === m.driverId)?.fullName || m.driverId,
        distance: mileageDistance(m),
      }))
      .filter((m) => {
        const matchesSearch =
          !term || m.vehicleReg.toLowerCase().includes(term) || m.driverName.toLowerCase().includes(term);
        const matchesVehicle = !filters.vehicleId || m.vehicleId === filters.vehicleId;
        const matchesDriver = !filters.driverId || m.driverId === filters.driverId;
        return matchesSearch && matchesVehicle && matchesDriver;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [mileageRecords, vehicles, drivers, filters]);

  const columns = [
    { field: "id", headerName: "Record ID", width: 100 },
    { field: "vehicleReg", headerName: "Vehicle", width: 120 },
    { field: "driverName", headerName: "Driver", width: 150 },
    { field: "date", headerName: "Date", width: 110 },
    { field: "startMileage", headerName: "Start", width: 100, type: "number" },
    { field: "endMileage", headerName: "End", width: 100, type: "number" },
    { field: "distance", headerName: "Distance (km)", width: 120, type: "number" },
    { field: "purpose", headerName: "Purpose", width: 140 },
    { field: "destination", headerName: "Destination", width: 140 },
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
        <Typography variant="h4">Mileage Records</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
          Add Mileage Record
        </Button>
      </Stack>

      <Grid container sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Total Distance Travelled" value={totalDistance(rows).toLocaleString()} suffix="km" icon={TimelineIcon} accent="#2C7BA6" />
        </Grid>
      </Grid>

      <FilterPanel
        searchLabel="Search by vehicle or driver"
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

      <MileageForm
        open={formOpen}
        record={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(msg) => notify(msg, "success")}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete mileage record?"
        message="This record will be permanently removed."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteMileageRecord(deleteTarget.id);
          notify("Mileage record deleted", "info");
          setDeleteTarget(null);
        }}
      />
      {SnackbarElement}
    </Box>
  );
}
