import { useMemo, useState } from "react";
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
import StatusChip from "../components/common/StatusChip.jsx";
import StatCard from "../components/common/StatCard.jsx";
import FilterPanel from "../components/common/FilterPanel.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import MaintenanceForm from "../components/maintenance/MaintenanceForm.jsx";
import { useSnackbar } from "../components/common/useSnackbar.jsx";
import { useFleet } from "../context/FleetContext.jsx";
import { MAINTENANCE_TYPES, MAINTENANCE_STATUSES } from "../data/constants";
import { totalMaintenanceCost } from "../utils/calculations";
import Grid from "@mui/material/Grid";
import PaidIcon from "@mui/icons-material/Paid";

export default function Maintenance() {
  const { maintenanceRecords, vehicles, deleteMaintenanceRecord } = useFleet();
  const { notify, SnackbarElement } = useSnackbar();
  const [filters, setFilters] = useState({ search: "", maintenanceType: "", status: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const rows = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return maintenanceRecords
      .map((m) => ({ ...m, vehicleReg: vehicles.find((v) => v.id === m.vehicleId)?.registrationNumber || m.vehicleId }))
      .filter((m) => {
        const matchesSearch =
          !term || m.vehicleReg.toLowerCase().includes(term) || (m.serviceProvider || "").toLowerCase().includes(term);
        const matchesType = !filters.maintenanceType || m.maintenanceType === filters.maintenanceType;
        const matchesStatus = !filters.status || m.status === filters.status;
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [maintenanceRecords, vehicles, filters]);

  const columns = [
    { field: "id", headerName: "Record ID", width: 100 },
    { field: "vehicleReg", headerName: "Vehicle", width: 120 },
    { field: "maintenanceType", headerName: "Type", width: 150 },
    { field: "date", headerName: "Date", width: 110 },
    { field: "mileage", headerName: "Mileage", width: 100, type: "number" },
    { field: "serviceProvider", headerName: "Provider", width: 150 },
    { field: "cost", headerName: "Cost", width: 100, type: "number" },
    { field: "nextServiceDate", headerName: "Next Service", width: 120 },
    { field: "status", headerName: "Status", width: 130, renderCell: (p) => <StatusChip status={p.value} /> },
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
        <Typography variant="h4">Maintenance</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
          Add Maintenance Record
        </Button>
      </Stack>

      <Grid container sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Total Maintenance Cost" value={totalMaintenanceCost(rows).toLocaleString()} suffix="RWF" icon={PaidIcon} accent="#C24444" />
        </Grid>
      </Grid>

      <FilterPanel
        searchLabel="Search by vehicle or provider"
        values={filters}
        onChange={setFilters}
        onClear={() => setFilters({ search: "", maintenanceType: "", status: "" })}
        fields={[
          { name: "maintenanceType", label: "Type", options: MAINTENANCE_TYPES },
          { name: "status", label: "Status", options: MAINTENANCE_STATUSES },
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

      <MaintenanceForm
        open={formOpen}
        record={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(msg) => notify(msg, "success")}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete maintenance record?"
        message="This record will be permanently removed."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteMaintenanceRecord(deleteTarget.id);
          notify("Maintenance record deleted", "info");
          setDeleteTarget(null);
        }}
      />
      {SnackbarElement}
    </Box>
  );
}
