import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StatusChip from "../components/common/StatusChip.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { useFleet } from "../context/FleetContext.jsx";
import { fuelEfficiencyByVehicle, mileageDistance, totalFuelCost, totalMaintenanceCost } from "../utils/calculations";

export default function VehicleDetails() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { vehicles, drivers, assignments, fuelRecords, maintenanceRecords, mileageRecords } = useFleet();
  const [tab, setTab] = useState(0);

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const vehicleAssignments = useMemo(
    () => assignments.filter((a) => a.vehicleId === vehicleId).sort((a, b) => new Date(b.assignmentDate) - new Date(a.assignmentDate)),
    [assignments, vehicleId]
  );
  const vehicleFuel = useMemo(
    () => fuelRecords.filter((f) => f.vehicleId === vehicleId).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [fuelRecords, vehicleId]
  );
  const vehicleMaintenance = useMemo(
    () => maintenanceRecords.filter((m) => m.vehicleId === vehicleId).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [maintenanceRecords, vehicleId]
  );
  const vehicleMileage = useMemo(
    () => mileageRecords.filter((m) => m.vehicleId === vehicleId).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [mileageRecords, vehicleId]
  );

  const driverName = (id) => drivers.find((d) => d.id === id)?.fullName || id || "—";

  if (!vehicle) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/vehicles")}>Back to Vehicles</Button>
        <EmptyState title="Vehicle not found" subtitle="It may have been deleted." />
      </Box>
    );
  }

  const efficiency = fuelEfficiencyByVehicle(fuelRecords, vehicleId);

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/vehicles")} sx={{ mb: 2 }}>
        Back to Vehicles
      </Button>

      <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
          <Box>
            <Typography variant="h4">{vehicle.registrationNumber}</Typography>
            <Typography variant="body2" color="text.secondary">
              {vehicle.make} {vehicle.model} · {vehicle.year}
            </Typography>
          </Box>
          <StatusChip status={vehicle.status} size="medium" />
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Field label="Vehicle Type" value={vehicle.vehicleType} />
          <Field label="Fuel Type" value={vehicle.fuelType} />
          <Field label="Current Mileage" value={`${vehicle.currentMileage.toLocaleString()} km`} />
          <Field label="Location" value={vehicle.location} />
          <Field label="Assigned Driver" value={driverName(vehicle.assignedDriverId)} />
          <Field label="Purchase Date" value={vehicle.purchaseDate} />
          <Field label="Fuel Efficiency" value={efficiency ? `${efficiency} km/L` : "Insufficient data"} />
          <Field label="Total Fuel Cost" value={`${totalFuelCost(vehicleFuel).toLocaleString()} RWF`} />
          <Field label="Total Maintenance Cost" value={`${totalMaintenanceCost(vehicleMaintenance).toLocaleString()} RWF`} />
        </Grid>
      </Paper>

      <Paper variant="outlined">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Assignment History" />
          <Tab label="Fuel History" />
          <Tab label="Maintenance History" />
          <Tab label="Mileage History" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && (
            vehicleAssignments.length === 0 ? <EmptyState title="No assignment history" /> : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Driver</TableCell><TableCell>Assigned</TableCell><TableCell>Location</TableCell>
                    <TableCell>Purpose</TableCell><TableCell>Return</TableCell><TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicleAssignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{driverName(a.driverId)}</TableCell>
                      <TableCell>{a.assignmentDate}</TableCell>
                      <TableCell>{a.location}</TableCell>
                      <TableCell>{a.purpose}</TableCell>
                      <TableCell>{a.expectedReturnDate}</TableCell>
                      <TableCell><StatusChip status={a.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
          {tab === 1 && (
            vehicleFuel.length === 0 ? <EmptyState title="No fuel records" /> : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell><TableCell>Odometer</TableCell><TableCell>Litres</TableCell>
                    <TableCell>Price/L</TableCell><TableCell>Total Cost</TableCell><TableCell>Station</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicleFuel.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{f.date}</TableCell>
                      <TableCell>{Number(f.odometer).toLocaleString()}</TableCell>
                      <TableCell>{f.litres}</TableCell>
                      <TableCell>{f.pricePerLitre}</TableCell>
                      <TableCell>{Number(f.totalCost).toLocaleString()}</TableCell>
                      <TableCell>{f.fuelStation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
          {tab === 2 && (
            vehicleMaintenance.length === 0 ? <EmptyState title="No maintenance records" /> : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell><TableCell>Type</TableCell><TableCell>Provider</TableCell>
                    <TableCell>Cost</TableCell><TableCell>Next Service</TableCell><TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicleMaintenance.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.date}</TableCell>
                      <TableCell>{m.maintenanceType}</TableCell>
                      <TableCell>{m.serviceProvider}</TableCell>
                      <TableCell>{Number(m.cost).toLocaleString()}</TableCell>
                      <TableCell>{m.nextServiceDate}</TableCell>
                      <TableCell><StatusChip status={m.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
          {tab === 3 && (
            vehicleMileage.length === 0 ? <EmptyState title="No mileage records" /> : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell><TableCell>Driver</TableCell><TableCell>Start</TableCell>
                    <TableCell>End</TableCell><TableCell>Distance</TableCell><TableCell>Purpose</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicleMileage.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.date}</TableCell>
                      <TableCell>{driverName(m.driverId)}</TableCell>
                      <TableCell>{Number(m.startMileage).toLocaleString()}</TableCell>
                      <TableCell>{Number(m.endMileage).toLocaleString()}</TableCell>
                      <TableCell>{mileageDistance(m).toLocaleString()} km</TableCell>
                      <TableCell>{m.purpose}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
        </Box>
      </Paper>
    </Box>
  );
}

function Field({ label, value }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="subtitle2">{label}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Grid>
  );
}
