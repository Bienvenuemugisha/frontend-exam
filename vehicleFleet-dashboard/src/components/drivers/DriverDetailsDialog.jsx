import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import StatusChip from "../common/StatusChip.jsx";
import EmptyState from "../common/EmptyState.jsx";
import { useFleet } from "../../context/FleetContext.jsx";

export default function DriverDetailsDialog({ open, onClose, driver }) {
  const { vehicles, assignments } = useFleet();
  if (!driver) return null;

  const assignedVehicle = vehicles.find((v) => v.id === driver.assignedVehicleId);
  const history = assignments
    .filter((a) => a.driverId === driver.id)
    .sort((a, b) => new Date(b.assignmentDate) - new Date(a.assignmentDate));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{driver.fullName}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={6}><Typography variant="subtitle2">Staff Number</Typography><Typography>{driver.staffNumber}</Typography></Grid>
          <Grid item xs={6}><Typography variant="subtitle2">Department</Typography><Typography>{driver.department}</Typography></Grid>
          <Grid item xs={6}><Typography variant="subtitle2">Phone</Typography><Typography>{driver.phone}</Typography></Grid>
          <Grid item xs={6}><Typography variant="subtitle2">Email</Typography><Typography>{driver.email || "—"}</Typography></Grid>
          <Grid item xs={6}><Typography variant="subtitle2">License</Typography><Typography>{driver.licenseNumber} (exp. {driver.licenseExpiry})</Typography></Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Status</Typography>
            <StatusChip status={driver.status} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Currently Assigned Vehicle</Typography>
            <Typography>{assignedVehicle ? `${assignedVehicle.registrationNumber} — ${assignedVehicle.make} ${assignedVehicle.model}` : "None"}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Previous Assignments</Typography>
        {history.length === 0 ? (
          <EmptyState title="No assignment history" />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow><TableCell>Vehicle</TableCell><TableCell>Date</TableCell><TableCell>Purpose</TableCell><TableCell>Status</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {history.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{vehicles.find((v) => v.id === a.vehicleId)?.registrationNumber || a.vehicleId}</TableCell>
                  <TableCell>{a.assignmentDate}</TableCell>
                  <TableCell>{a.purpose}</TableCell>
                  <TableCell><StatusChip status={a.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
