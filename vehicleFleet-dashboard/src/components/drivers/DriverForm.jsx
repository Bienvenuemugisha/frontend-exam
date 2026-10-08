import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { DEPARTMENTS, DRIVER_STATUSES } from "../../data/constants";
import { useFleet } from "../../context/FleetContext.jsx";

const EMPTY = {
  fullName: "", staffNumber: "", phone: "", email: "", licenseNumber: "",
  licenseExpiry: "", department: DEPARTMENTS[0], status: "Available",
};

export default function DriverForm({ open, onClose, driver, onSaved }) {
  const { addDriver, updateDriver, drivers } = useFleet();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(driver ? { ...EMPTY, ...driver } : EMPTY);
      setErrors({});
    }
  }, [open, driver]);

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.staffNumber.trim()) e.staffNumber = "Staff number is required";
    else if (drivers.some((d) => d.staffNumber === form.staffNumber.trim() && d.id !== driver?.id))
      e.staffNumber = "Staff number already exists";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.licenseNumber.trim()) e.licenseNumber = "License number is required";
    if (!form.licenseExpiry) e.licenseExpiry = "License expiry date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = { ...form, fullName: form.fullName.trim() };
    if (driver) {
      updateDriver(driver.id, payload);
      onSaved?.("Driver updated successfully");
    } else {
      addDriver(payload);
      onSaved?.("Driver added successfully");
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{driver ? "Edit Driver" : "Add Driver"}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Full Name" value={form.fullName} onChange={set("fullName")}
              error={!!errors.fullName} helperText={errors.fullName} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Staff Number" value={form.staffNumber} onChange={set("staffNumber")}
              error={!!errors.staffNumber} helperText={errors.staffNumber} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Phone" value={form.phone} onChange={set("phone")}
              error={!!errors.phone} helperText={errors.phone} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="email" label="Email" value={form.email} onChange={set("email")}
              error={!!errors.email} helperText={errors.email} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Driving License Number" value={form.licenseNumber}
              onChange={set("licenseNumber")} error={!!errors.licenseNumber} helperText={errors.licenseNumber} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="License Expiry Date" InputLabelProps={{ shrink: true }}
              value={form.licenseExpiry} onChange={set("licenseExpiry")} error={!!errors.licenseExpiry}
              helperText={errors.licenseExpiry} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Department" value={form.department} onChange={set("department")}>
              {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Status" value={form.status} onChange={set("status")}>
              {DRIVER_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
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
