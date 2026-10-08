import { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useFleet } from "../../context/FleetContext.jsx";

const EMPTY = {
  vehicleId: "", driverId: "", date: new Date().toISOString().slice(0, 10),
  startMileage: "", endMileage: "", purpose: "", destination: "", remarks: "",
};

export default function MileageForm({ open, onClose, record, onSaved }) {
  const { vehicles, drivers, addMileageRecord, updateMileageRecord } = useFleet();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(record ? { ...EMPTY, ...record } : EMPTY);
      setErrors({});
    }
  }, [open, record]);

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const distance = useMemo(
    () => Math.max(0, (Number(form.endMileage) || 0) - (Number(form.startMileage) || 0)),
    [form.startMileage, form.endMileage]
  );

  const validate = () => {
    const e = {};
    if (!form.vehicleId) e.vehicleId = "Select a vehicle";
    if (!form.date) e.date = "Date is required";
    if (form.startMileage === "") e.startMileage = "Enter starting mileage";
    if (form.endMileage === "") e.endMileage = "Enter ending mileage";
    else if (Number(form.endMileage) < Number(form.startMileage))
      e.endMileage = "Ending mileage cannot be less than starting mileage";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...form,
      startMileage: Number(form.startMileage),
      endMileage: Number(form.endMileage),
    };
    if (record) {
      updateMileageRecord(record.id, payload);
      onSaved?.("Mileage record updated");
    } else {
      addMileageRecord(payload);
      onSaved?.("Mileage record added");
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{record ? "Edit Mileage Record" : "Add Mileage Record"}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Vehicle" value={form.vehicleId} onChange={set("vehicleId")}
              error={!!errors.vehicleId} helperText={errors.vehicleId}>
              {vehicles.map((v) => <MenuItem key={v.id} value={v.id}>{v.registrationNumber}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Driver" value={form.driverId} onChange={set("driverId")}>
              {drivers.map((d) => <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }}
              value={form.date} onChange={set("date")} error={!!errors.date} helperText={errors.date} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Distance Travelled (km)" value={distance} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="number" label="Starting Mileage (km)" value={form.startMileage}
              onChange={set("startMileage")} error={!!errors.startMileage} helperText={errors.startMileage} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="number" label="Ending Mileage (km)" value={form.endMileage}
              onChange={set("endMileage")} error={!!errors.endMileage} helperText={errors.endMileage} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Purpose" value={form.purpose} onChange={set("purpose")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Destination" value={form.destination} onChange={set("destination")} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline minRows={2} label="Remarks" value={form.remarks} onChange={set("remarks")} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
