import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import StatusChip from "../components/common/StatusChip.jsx";
import FilterPanel from "../components/common/FilterPanel.jsx";
import AssignVehicleDialog from "../components/vehicles/AssignVehicleDialog.jsx";
import { useSnackbar } from "../components/common/useSnackbar.jsx";
import { useFleet } from "../context/FleetContext.jsx";

export default function Assignments() {
  const { assignments, vehicles, drivers, endAssignment } = useFleet();
  const { notify, SnackbarElement } = useSnackbar();
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [assignOpen, setAssignOpen] = useState(false);

  const rows = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return assignments
      .map((a) => ({
        ...a,
        vehicleReg: vehicles.find((v) => v.id === a.vehicleId)?.registrationNumber || a.vehicleId,
        driverName: drivers.find((d) => d.id === a.driverId)?.fullName || a.driverId,
      }))
      .filter((a) => {
        const matchesSearch =
          !term || a.vehicleReg.toLowerCase().includes(term) || a.driverName.toLowerCase().includes(term);
        const matchesStatus = !filters.status || a.status === filters.status;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.assignmentDate) - new Date(a.assignmentDate));
  }, [assignments, vehicles, drivers, filters]);

  const columns = [
    { field: "id", headerName: "Assignment ID", width: 120 },
    { field: "vehicleReg", headerName: "Vehicle", width: 130 },
    { field: "driverName", headerName: "Driver", width: 150 },
    { field: "assignmentDate", headerName: "Assigned", width: 110 },
    { field: "startMileage", headerName: "Start Mileage", width: 120, type: "number" },
    { field: "location", headerName: "Location", width: 130 },
    { field: "purpose", headerName: "Purpose", width: 150 },
    { field: "expectedReturnDate", headerName: "Expected Return", width: 130 },
    {
      field: "status", headerName: "Status", width: 120,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "actions", headerName: "Actions", width: 130, sortable: false, filterable: false,
      renderCell: (params) =>
        params.row.status === "Active" ? (
          <Button size="small" onClick={() => { endAssignment(params.row.id); notify("Assignment ended", "info"); }}>
            End
          </Button>
        ) : null,
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Vehicle Assignments</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAssignOpen(true)}>
          New Assignment
        </Button>
      </Stack>

      <FilterPanel
        searchLabel="Search by vehicle or driver"
        values={filters}
        onChange={setFilters}
        onClear={() => setFilters({ search: "", status: "" })}
        fields={[{ name: "status", label: "Status", options: ["Active", "Completed"] }]}
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

      <AssignVehicleDialog
        open={assignOpen}
        vehicle={null}
        onClose={() => setAssignOpen(false)}
        onSaved={(msg) => notify(msg, "success")}
      />
      {SnackbarElement}
    </Box>
  );
}
