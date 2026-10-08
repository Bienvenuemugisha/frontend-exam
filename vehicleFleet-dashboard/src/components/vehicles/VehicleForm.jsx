import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { VEHICLE_TYPES, FUEL_TYPES, VEHICLE_STATUSES } from "../../data/constants";
import { useFleet } from "../../context/FleetContext.jsx";

const EMPTY = {
  registrationNumber: "",
  vehicleType: "Car",
  make: "",
  model: "",
  year: new Date().getFullYear(),
  color: "",
  fuelType: "Petrol",
  currentMileage: 0,
  purchaseDate: "",
  purchasePrice: "",
  location: "",
  status: "Available",
  description: "",
};

export default function VehicleForm({ open, onClose, vehicle, onSaved }) {
  const { addVehicle, updateVehicle, isRegistrationDuplicate } = useFleet();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(vehicle ? { ...EMPTY, ...vehicle } : EMPTY);
      setErrors({});
    }
  }, [open, vehicle]);

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.registrationNumber.trim()) e.registrationNumber = "Registration number is required";
    else if (isRegistrationDuplicate(form.registrationNumber.trim(), vehicle?.id))
      e.registrationNumber = "This registration number is already in use";
    if (!form.make.trim()) e.make = "Make is required";
    if (!form.model.trim()) e.model = "Model is required";
    if (!form.year || form.year < 1980 || form.year > new Date().getFullYear() + 1)
      e.year = "Enter a valid year";
    if (form.currentMileage === "" || Number(form.currentMileage) < 0)
      e.currentMileage = "Enter a valid mileage";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.purchaseDate) e.purchaseDate = "Purchase date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...form,
      registrationNumber: form.registrationNumber.trim(),
      year: Number(form.year),
      currentMileage: Number(form.currentMileage),
      purchasePrice: Number(form.purchasePrice) || 0,
    };
    if (vehicle) {
      updateVehicle(vehicle.id, payload);
      onSaved?.("Vehicle updated successfully", vehicle.id);
    } else {
      const id = addVehicle(payload);
      onSaved?.("Vehicle registered successfully", id);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{vehicle ? "Edit Vehicle" : "Register Vehicle"}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Registration Number" value={form.registrationNumber}
              onChange={set("registrationNumber")} error={!!errors.registrationNumber}
              helperText={errors.registrationNumber} required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Vehicle Type" value={form.vehicleType} onChange={set("vehicleType")}>
              {VEHICLE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Make" value={form.make} onChange={set("make")}
              error={!!errors.make} helperText={errors.make} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Model" value={form.model} onChange={set("model")}
              error={!!errors.model} helperText={errors.model} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="number" label="Manufacturing Year" value={form.year}
              onChange={set("year")} error={!!errors.year} helperText={errors.year} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Color" value={form.color} onChange={set("color")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Fuel Type" value={form.fuelType} onChange={set("fuelType")}>
              {FUEL_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="number" label="Current Mileage (km)" value={form.currentMileage}
              onChange={set("currentMileage")} error={!!errors.currentMileage} helperText={errors.currentMileage} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Purchase Date" InputLabelProps={{ shrink: true }}
              value={form.purchaseDate} onChange={set("purchaseDate")} error={!!errors.purchaseDate}
              helperText={errors.purchaseDate} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="number" label="Purchase Price (RWF)" value={form.purchasePrice}
              onChange={set("purchasePrice")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Location" value={form.location} onChange={set("location")}
              error={!!errors.location} helperText={errors.location} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Status" value={form.status} onChange={set("status")}>
              {VEHICLE_STATUSES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline minRows={2} label="Description" value={form.description}
              onChange={set("description")} />
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
