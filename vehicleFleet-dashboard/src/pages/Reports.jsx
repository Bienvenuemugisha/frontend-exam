import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import ClearIcon from "@mui/icons-material/Clear";
import EmptyState from "../components/common/EmptyState.jsx";
import { useFleet } from "../context/FleetContext.jsx";
import { exportToCsv } from "../utils/csv";
import {
  VEHICLE_TYPES, VEHICLE_STATUSES, FUEL_TYPES, MAINTENANCE_TYPES,
} from "../data/constants";
import { mileageDistance } from "../utils/calculations";

const REPORT_TYPES = [
  "Vehicle Inventory",
  "Vehicle Assignment",
  "Fuel Consumption",
  "Fuel Cost",
  "Maintenance",
  "Maintenance Cost",
  "Mileage",
  "Driver Usage",
  "Vehicle Usage",
];

const EMPTY_FILTERS = {
  from: "", to: "", vehicleId: "", driverId: "", vehicleType: "", status: "", fuelType: "", maintenanceType: "",
};

function inRange(dateStr, from, to) {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  if (from && d < new Date(from)) return false;
  if (to && d > new Date(to)) return false;
  return true;
}

export default function Reports() {
  const { vehicles, drivers, assignments, fuelRecords, maintenanceRecords, mileageRecords } = useFleet();
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const set = (name) => (e) => setFilters((f) => ({ ...f, [name]: e.target.value }));

  const vehicleReg = (id) => vehicles.find((v) => v.id === id)?.registrationNumber || id;
  const driverName = (id) => drivers.find((d) => d.id === id)?.fullName || id;

  const { rows, columns } = useMemo(() => {
    switch (reportType) {
      case "Vehicle Inventory": {
        const data = vehicles.filter(
          (v) => (!filters.vehicleType || v.vehicleType === filters.vehicleType) &&
                 (!filters.status || v.status === filters.status) &&
                 (!filters.fuelType || v.fuelType === filters.fuelType) &&
                 (!filters.vehicleId || v.id === filters.vehicleId)
        );
        return { rows: data, columns: ["id", "registrationNumber", "vehicleType", "make", "model", "year", "fuelType", "currentMileage", "location", "status"] };
      }
      case "Vehicle Assignment": {
        const data = assignments
          .filter((a) => inRange(a.assignmentDate, filters.from, filters.to) &&
            (!filters.vehicleId || a.vehicleId === filters.vehicleId) &&
            (!filters.driverId || a.driverId === filters.driverId))
          .map((a) => ({ ...a, vehicle: vehicleReg(a.vehicleId), driver: driverName(a.driverId) }));
        return { rows: data, columns: ["id", "vehicle", "driver", "assignmentDate", "location", "purpose", "expectedReturnDate", "status"] };
      }
      case "Fuel Consumption":
      case "Fuel Cost": {
        const data = fuelRecords
          .filter((f) => inRange(f.date, filters.from, filters.to) &&
            (!filters.vehicleId || f.vehicleId === filters.vehicleId) &&
            (!filters.driverId || f.driverId === filters.driverId))
          .map((f) => ({ ...f, vehicle: vehicleReg(f.vehicleId), driver: driverName(f.driverId) }));
        return { rows: data, columns: ["id", "vehicle", "driver", "date", "odometer", "litres", "pricePerLitre", "totalCost", "fuelStation"] };
      }
      case "Maintenance":
      case "Maintenance Cost": {
        const data = maintenanceRecords
          .filter((m) => inRange(m.date, filters.from, filters.to) &&
            (!filters.vehicleId || m.vehicleId === filters.vehicleId) &&
            (!filters.maintenanceType || m.maintenanceType === filters.maintenanceType) &&
            (!filters.status || m.status === filters.status))
          .map((m) => ({ ...m, vehicle: vehicleReg(m.vehicleId) }));
        return { rows: data, columns: ["id", "vehicle", "maintenanceType", "date", "serviceProvider", "cost", "status"] };
      }
      case "Mileage": {
        const data = mileageRecords
          .filter((m) => inRange(m.date, filters.from, filters.to) &&
            (!filters.vehicleId || m.vehicleId === filters.vehicleId) &&
            (!filters.driverId || m.driverId === filters.driverId))
          .map((m) => ({ ...m, vehicle: vehicleReg(m.vehicleId), driver: driverName(m.driverId), distance: mileageDistance(m) }));
        return { rows: data, columns: ["id", "vehicle", "driver", "date", "startMileage", "endMileage", "distance", "purpose"] };
      }
      case "Driver Usage": {
        const data = drivers
          .filter((d) => !filters.driverId || d.id === filters.driverId)
          .map((d) => {
            const dist = mileageRecords.filter((m) => m.driverId === d.id).reduce((s, m) => s + mileageDistance(m), 0);
            const fuelCost = fuelRecords.filter((f) => f.driverId === d.id).reduce((s, f) => s + (Number(f.totalCost) || 0), 0);
            return { id: d.id, driver: d.fullName, department: d.department, totalDistance: dist, totalFuelCost: fuelCost, status: d.status };
          });
        return { rows: data, columns: ["id", "driver", "department", "totalDistance", "totalFuelCost", "status"] };
      }
      case "Vehicle Usage": {
        const data = vehicles
          .filter((v) => !filters.vehicleId || v.id === filters.vehicleId)
          .map((v) => {
            const dist = mileageRecords.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + mileageDistance(m), 0);
            const fuelCost = fuelRecords.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + (Number(f.totalCost) || 0), 0);
            const maintCost = maintenanceRecords.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + (Number(m.cost) || 0), 0);
            return { id: v.id, vehicle: v.registrationNumber, totalDistance: dist, totalFuelCost: fuelCost, totalMaintenanceCost: maintCost, status: v.status };
          });
        return { rows: data, columns: ["id", "vehicle", "totalDistance", "totalFuelCost", "totalMaintenanceCost", "status"] };
      }
      default:
        return { rows: [], columns: [] };
    }
  }, [reportType, filters, vehicles, drivers, assignments, fuelRecords, maintenanceRecords, mileageRecords]);

  const headerLabel = (col) =>
    col.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Reports</Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField select fullWidth label="Report" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              {REPORT_TYPES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <TextField fullWidth type="date" label="From" InputLabelProps={{ shrink: true }} value={filters.from} onChange={set("from")} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <TextField fullWidth type="date" label="To" InputLabelProps={{ shrink: true }} value={filters.to} onChange={set("to")} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <TextField select fullWidth label="Vehicle" value={filters.vehicleId} onChange={set("vehicleId")}>
              <MenuItem value="">All</MenuItem>
              {vehicles.map((v) => <MenuItem key={v.id} value={v.id}>{v.registrationNumber}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <TextField select fullWidth label="Driver" value={filters.driverId} onChange={set("driverId")}>
              <MenuItem value="">All</MenuItem>
              {drivers.map((d) => <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <TextField select fullWidth label="Vehicle Type" value={filters.vehicleType} onChange={set("vehicleType")}>
              <MenuItem value="">All</MenuItem>
              {VEHICLE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <TextField select fullWidth label="Status" value={filters.status} onChange={set("status")}>
              <MenuItem value="">All</MenuItem>
              {VEHICLE_STATUSES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <TextField select fullWidth label="Fuel Type" value={filters.fuelType} onChange={set("fuelType")}>
              <MenuItem value="">All</MenuItem>
              {FUEL_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <TextField select fullWidth label="Maintenance Type" value={filters.maintenanceType} onChange={set("maintenanceType")}>
              <MenuItem value="">All</MenuItem>
              {MAINTENANCE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth startIcon={<ClearIcon />} onClick={() => setFilters(EMPTY_FILTERS)}>Clear Filters</Button>
          </Grid>
        </Grid>
      </Paper>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }} className="no-print">
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>Print Report</Button>
        <Button
          variant="contained" startIcon={<DownloadIcon />}
          onClick={() => exportToCsv(reportType.replace(/\s+/g, "_"), rows.map((r) => Object.fromEntries(columns.map((c) => [headerLabel(c), r[c]]))))}
          disabled={rows.length === 0}
        >
          Export to CSV
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>{reportType} Report</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {rows.length} record{rows.length === 1 ? "" : "s"}
        </Typography>
        {rows.length === 0 ? (
          <EmptyState title="No records match these filters" />
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map((c) => <TableCell key={c}>{headerLabel(c)}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={r.id || i}>
                    {columns.map((c) => (
                      <TableCell key={c}>
                        {typeof r[c] === "number" ? r[c].toLocaleString() : r[c]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
