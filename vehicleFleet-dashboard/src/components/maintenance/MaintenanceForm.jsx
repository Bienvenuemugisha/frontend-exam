import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { MAINTENANCE_TYPES, MAINTENANCE_STATUSES } from "../../data/constants";
import { useFleet } from "../../context/FleetContext.jsx";

const EMPTY = {
  vehicleId: "", maintenanceType: MAINTENANCE_TYPES[0], date: new Date().toISOString().slice(0, 10),
  mileage: "", description: "", serviceProvider: "", cost: "", nextServiceDate: "",
  nextServiceMileage: "", status: "Scheduled", remarks: "",
};

export default function MaintenanceForm({ open, onClose, record, onSaved }) {
  const { vehicles, addMaintenanceRecord, updateMaintenanceRecord } = useFleet();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(record ? { ...EMPTY, ...record } : EMPTY);
      setErrors({});
    }
  }, [open, record]);

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.vehicleId) e.vehicleId = "Select a vehicle";
    if (!form.date) e.date = "Date is required";
    if (form.cost !== "" && Number(form.cost) < 0) e.cost = "Enter a valid cost";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...form,
      mileage: Number(form.mileage) || 0,
      cost: Number(form.cost) || 0,
      nextServiceMileage: Number(form.nextServiceMileage) || 0,
    };
    if (record) {
      updateMaintenanceRecord(record.id, payload);
      onSaved?.("Maintenance record updated");
    } else {
      addMaintenanceRecord(payload);
      onSaved?.("Maintenance record added");
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{record ? "Edit Maintenance Record" : "Add Maintenance Record"}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Vehicle" value={form.vehicleId} onChange={set("vehicleId")}
              error={!!errors.vehicleId} helperText={errors.vehicleId}>
              {vehicles.map((v) => <MenuItem key={v.id} value={v.id}>{v.registrationNumber}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Maintenance Type" value={form.maintenanceType} onChange={set("maintenanceType")}>
              {MAINTENANCE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }}
              value={form.date} onChange={set("date")} error={!!errors.date} helperText={errors.date} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="number" label="Mileage at Service (km)" value={form.mileage} onChange={set("mileage")} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline minRows={2} label="Description" value={form.description} onChange={set("description")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Service Provider" value={form.serviceProvider} onChange={set("serviceProvider")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="number" label="Cost (RWF)" value={form.cost} onChange={set("cost")}
              error={!!errors.cost} helperText={errors.cost} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Next Service Date" InputLabelProps={{ shrink: true }}
              value={form.nextServiceDate} onChange={set("nextServiceDate")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="number" label="Next Service Mileage (km)" value={form.nextServiceMileage}
              onChange={set("nextServiceMileage")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Status" value={form.status} onChange={set("status")}>
              {MAINTENANCE_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
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
