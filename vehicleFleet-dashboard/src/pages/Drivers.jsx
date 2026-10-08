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
import VisibilityIcon from "@mui/icons-material/Visibility";
import StatusChip from "../components/common/StatusChip.jsx";
import FilterPanel from "../components/common/FilterPanel.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import DriverForm from "../components/drivers/DriverForm.jsx";
import DriverDetailsDialog from "../components/drivers/DriverDetailsDialog.jsx";
import { useSnackbar } from "../components/common/useSnackbar.jsx";
import { useFleet } from "../context/FleetContext.jsx";
import { DEPARTMENTS, DRIVER_STATUSES } from "../data/constants";

export default function Drivers() {
  const { drivers, vehicles, deleteDriver } = useFleet();
  const { notify, SnackbarElement } = useSnackbar();

  const [filters, setFilters] = useState({ search: "", department: "", status: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewing, setViewing] = useState(null);

  const rows = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return drivers
      .filter((d) => {
        const matchesSearch =
          !term ||
          d.fullName.toLowerCase().includes(term) ||
          d.staffNumber.toLowerCase().includes(term) ||
          d.phone.toLowerCase().includes(term);
        const matchesDept = !filters.department || d.department === filters.department;
        const matchesStatus = !filters.status || d.status === filters.status;
        return matchesSearch && matchesDept && matchesStatus;
      })
      .map((d) => ({
        ...d,
        vehicleReg: vehicles.find((v) => v.id === d.assignedVehicleId)?.registrationNumber || "—",
      }));
  }, [drivers, vehicles, filters]);

  const columns = [
    { field: "id", headerName: "Driver ID", width: 100 },
    { field: "fullName", headerName: "Full Name", width: 170 },
    { field: "staffNumber", headerName: "Staff No.", width: 110 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "email", headerName: "Email", width: 190 },
    { field: "licenseNumber", headerName: "License No.", width: 120 },
    { field: "licenseExpiry", headerName: "License Expiry", width: 130 },
    { field: "department", headerName: "Department", width: 130 },
    { field: "vehicleReg", headerName: "Assigned Vehicle", width: 140 },
    {
      field: "status", headerName: "Status", width: 120,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "actions", headerName: "Actions", width: 130, sortable: false, filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => setViewing(params.row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
        <Typography variant="h4">Drivers</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
          Add Driver
        </Button>
      </Stack>

      <FilterPanel
        searchLabel="Search by name, staff number, phone"
        values={filters}
        onChange={setFilters}
        onClear={() => setFilters({ search: "", department: "", status: "" })}
        fields={[
          { name: "department", label: "Department", options: DEPARTMENTS },
          { name: "status", label: "Status", options: DRIVER_STATUSES },
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

      <DriverForm
        open={formOpen}
        driver={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(msg) => notify(msg, "success")}
      />
      <DriverDetailsDialog open={!!viewing} driver={viewing} onClose={() => setViewing(null)} />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete driver?"
        message={`This will remove ${deleteTarget?.fullName} from the roster.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteDriver(deleteTarget.id);
          notify("Driver deleted", "info");
          setDeleteTarget(null);
        }}
      />
      {SnackbarElement}
    </Box>
  );
}
