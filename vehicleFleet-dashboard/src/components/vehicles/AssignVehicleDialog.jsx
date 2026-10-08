import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { useFleet } from "../../context/FleetContext.jsx";

export default function AssignVehicleDialog({ open, onClose, vehicle, onSaved }) {
  const { vehicles, drivers, assignVehicle } = useFleet();
  const [form, setForm] = useState({
    vehicleId: "", driverId: "", assignmentDate: new Date().toISOString().slice(0, 10),
    startMileage: 0, location: "", purpose: "", expectedReturnDate: "", remarks: "",
  });
  const [error, setError] = useState("");

  const availableVehicles = vehicles.filter(
    (v) => v.status === "Available" || v.id === vehicle?.id
  );
  const availableDrivers = drivers.filter((d) => d.status === "Available" || d.status === "Assigned");

  useEffect(() => {
    if (open) {
      setError("");
      setForm((f) => ({
        ...f,
        vehicleId: vehicle?.id || "",
        startMileage: vehicle?.currentMileage || 0,
        location: vehicle?.location || "",
        driverId: "",
        expectedReturnDate: "",
        purpose: "",
        remarks: "",
        assignmentDate: new Date().toISOString().slice(0, 10),
      }));
    }
  }, [open, vehicle]);

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleSave = () => {
    const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);
    if (!form.vehicleId || !form.driverId) {
      setError("Please select both a vehicle and a driver.");
      return;
    }
    if (selectedVehicle && !["Available"].includes(selectedVehicle.status)) {
      setError("This vehicle is not available for assignment (unavailable or in maintenance).");
      return;
    }
    assignVehicle({
      vehicleId: form.vehicleId,
      driverId: form.driverId,
      assignmentDate: form.assignmentDate,
      startMileage: Number(form.startMileage),
      location: form.location,
      purpose: form.purpose,
      expectedReturnDate: form.expectedReturnDate,
      remarks: form.remarks,
    });
    onSaved?.("Vehicle assigned successfully");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Vehicle</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Vehicle" value={form.vehicleId} onChange={set("vehicleId")}>
              {availableVehicles.map((v) => (
                <MenuItem key={v.id} value={v.id}>{v.registrationNumber} — {v.make} {v.model}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Driver" value={form.driverId} onChange={set("driverId")}>
              {availableDrivers.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Assignment Date" InputLabelProps={{ shrink: true }}
              value={form.assignmentDate} onChange={set("assignmentDate")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="number" label="Start Mileage (km)" value={form.startMileage}
              onChange={set("startMileage")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Location" value={form.location} onChange={set("location")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Expected Return Date" InputLabelProps={{ shrink: true }}
              value={form.expectedReturnDate} onChange={set("expectedReturnDate")} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Purpose" value={form.purpose} onChange={set("purpose")} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline minRows={2} label="Remarks" value={form.remarks} onChange={set("remarks")} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Assign</Button>
      </DialogActions>
    </Dialog>
  );
}
