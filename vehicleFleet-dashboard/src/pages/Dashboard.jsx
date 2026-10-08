import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BuildIcon from "@mui/icons-material/Build";
import BlockIcon from "@mui/icons-material/Block";
import PeopleIcon from "@mui/icons-material/People";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import PaidIcon from "@mui/icons-material/Paid";
import TimelineIcon from "@mui/icons-material/Timeline";
import StatCard from "../components/common/StatCard.jsx";
import StatusChip from "../components/common/StatusChip.jsx";
import { useFleet } from "../context/FleetContext.jsx";
import {
  totalFuelCost, totalMaintenanceCost, totalDistance, groupCount,
  sumByGroup, seriesByMonth, daysUntil,
} from "../utils/calculations";

const PIE_COLORS = ["#1B2A4A", "#E08A2C", "#2C7BA6", "#1F9E7A", "#C24444", "#8A7CA8"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { vehicles, drivers, fuelRecords, maintenanceRecords, mileageRecords } = useFleet();

  const stats = useMemo(() => {
    const byStatus = groupCount(vehicles, "status");
    return {
      total: vehicles.length,
      available: byStatus.Available || 0,
      assigned: (byStatus.Assigned || 0) + (byStatus["In Use"] || 0),
      maintenance: byStatus.Maintenance || 0,
      outOfService: (byStatus["Out of Service"] || 0) + (byStatus.Retired || 0),
      totalDrivers: drivers.length,
      totalFuel: totalFuelCost(fuelRecords),
      totalMaintenance: totalMaintenanceCost(maintenanceRecords),
      totalMileage: totalDistance(mileageRecords),
    };
  }, [vehicles, drivers, fuelRecords, maintenanceRecords, mileageRecords]);

  const fuelByMonth = useMemo(
    () => seriesByMonth(fuelRecords, "date", (r) => Number(r.totalCost) || 0),
    [fuelRecords]
  );
  const maintenanceByMonth = useMemo(
    () => seriesByMonth(maintenanceRecords, "date", (r) => Number(r.cost) || 0),
    [maintenanceRecords]
  );
  const usageByMonth = useMemo(
    () => seriesByMonth(mileageRecords, "date", (r) => Math.max(0, (Number(r.endMileage) || 0) - (Number(r.startMileage) || 0))),
    [mileageRecords]
  );

  const vehiclesByStatus = useMemo(() => {
    const counts = groupCount(vehicles, "status");
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [vehicles]);

  const vehiclesByType = useMemo(() => {
    const counts = groupCount(vehicles, "vehicleType");
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [vehicles]);

  const fuelByVehicle = useMemo(() => {
    const sums = sumByGroup(fuelRecords, "vehicleId", (r) => Number(r.totalCost) || 0);
    return Object.entries(sums)
      .map(([id, value]) => ({ name: vehicles.find((v) => v.id === id)?.registrationNumber || id, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [fuelRecords, vehicles]);

  const recentVehicles = useMemo(
    () => [...vehicles].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)).slice(0, 5),
    [vehicles]
  );
  const currentlyAssigned = useMemo(
    () => vehicles.filter((v) => v.assignedDriverId).slice(0, 5),
    [vehicles]
  );
  const dueForMaintenance = useMemo(
    () =>
      maintenanceRecords
        .filter((m) => m.nextServiceDate && daysUntil(m.nextServiceDate) !== null && daysUntil(m.nextServiceDate) <= 30)
        .sort((a, b) => daysUntil(a.nextServiceDate) - daysUntil(b.nextServiceDate))
        .slice(0, 5),
    [maintenanceRecords]
  );
  const recentFuel = useMemo(
    () => [...fuelRecords].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [fuelRecords]
  );

  const findVehicle = (id) => vehicles.find((v) => v.id === id);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}> Meru Fleet  Overview</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Live statistics computed from current fleet data.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}><StatCard label="Total Vehicles" value={stats.total} icon={DirectionsCarIcon} accent="#1B2A4A" /></Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}><StatCard label="Available" value={stats.available} icon={CheckCircleIcon} accent="#1F9E7A" /></Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}><StatCard label="Assigned / In Use" value={stats.assigned} icon={AssignmentIndIcon} accent="#2C7BA6" /></Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}><StatCard label="In Maintenance" value={stats.maintenance} icon={BuildIcon} accent="#E08A2C" /></Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}><StatCard label="Out of Service / Retired" value={stats.outOfService} icon={BlockIcon} accent="#C24444" /></Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}><StatCard label="Total Drivers" value={stats.totalDrivers} icon={PeopleIcon} accent="#1B2A4A" /></Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}><StatCard label="Fuel Cost" value={stats.totalFuel.toLocaleString()} suffix="RWF" icon={LocalGasStationIcon} accent="#E08A2C" /></Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}><StatCard label="Maintenance Cost" value={stats.totalMaintenance.toLocaleString()} suffix="RWF" icon={PaidIcon} accent="#C24444" /></Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}><StatCard label="Total Mileage" value={stats.totalMileage.toLocaleString()} suffix="km" icon={TimelineIcon} accent="#2C7BA6" /></Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Fuel Consumption (last 6 months)</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={fuelByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="value" name="Fuel cost (RWF)" stroke="#E08A2C" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Maintenance Cost (last 6 months)</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={maintenanceByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" name="Maintenance cost (RWF)" fill="#C24444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Vehicle Usage — Distance (last 6 months)</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={usageByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" name="Distance (km)" fill="#2C7BA6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Vehicles by Status</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={vehiclesByStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                  {vehiclesByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Vehicles by Type</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={vehiclesByType} dataKey="value" nameKey="name" outerRadius={90} label>
                  {vehiclesByType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: 320 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Top Fuel Consumption by Vehicle</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={fuelByVehicle} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" fontSize={12} width={80} />
                <Tooltip />
                <Bar dataKey="value" name="Fuel cost (RWF)" fill="#E08A2C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <ActivityPanel title="Recently Registered Vehicles" items={recentVehicles.map((v) => ({
          primary: `${v.registrationNumber} — ${v.make} ${v.model}`,
          secondary: `Purchased ${v.purchaseDate}`,
          onClick: () => navigate(`/vehicles/${v.id}`),
        }))} />
        <ActivityPanel title="Currently Assigned Vehicles" items={currentlyAssigned.map((v) => ({
          primary: `${v.registrationNumber}`,
          secondary: `Driver: ${drivers.find((d) => d.id === v.assignedDriverId)?.fullName || "—"}`,
          chip: v.status,
          onClick: () => navigate(`/vehicles/${v.id}`),
        }))} />
        <ActivityPanel title="Vehicles Due for Maintenance" items={dueForMaintenance.map((m) => ({
          primary: `${findVehicle(m.vehicleId)?.registrationNumber || m.vehicleId} — ${m.maintenanceType}`,
          secondary: `Next service: ${m.nextServiceDate} (${daysUntil(m.nextServiceDate)}d)`,
        }))} />
        <ActivityPanel title="Recent Fuel Records" items={recentFuel.map((f) => ({
          primary: `${findVehicle(f.vehicleId)?.registrationNumber || f.vehicleId} — ${f.litres} L`,
          secondary: `${f.date} · ${Number(f.totalCost).toLocaleString()} RWF`,
        }))} />
      </Grid>
    </Box>
  );
}

function ActivityPanel({ title, items }) {
  return (
    <Grid item xs={12} md={6}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>{title}</Typography>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No data available.</Typography>
        ) : (
          <List dense disablePadding>
            {items.map((item, idx) => (
              <Box key={idx}>
                <ListItem
                  disablePadding
                  sx={{ py: 0.75, cursor: item.onClick ? "pointer" : "default" }}
                  onClick={item.onClick}
                  secondaryAction={item.chip ? <StatusChip status={item.chip} /> : null}
                >
                  <ListItemText primary={item.primary} secondary={item.secondary} />
                </ListItem>
                {idx < items.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Grid>
  );
}
