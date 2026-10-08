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
import { round } from "../../utils/calculations";

const EMPTY = {
  vehicleId: "", driverId: "", date: new Date().toISOString().slice(0, 10),
  odometer: "", litres: "", pricePerLitre: "", fuelStation: "", referenceNumber: "", remarks: "",
};

export default function FuelRecordForm({ open, onClose, record, onSaved }) {
  const { vehicles, drivers, addFuelRecord, updateFuelRecord } = useFleet();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(record ? { ...EMPTY, ...record } : EMPTY);
      setErrors({});
    }
  }, [open, record]);

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const totalCost = useMemo(
    () => round((Number(form.litres) || 0) * (Number(form.pricePerLitre) || 0)),
    [form.litres, form.pricePerLitre]
  );

  const validate = () => {
    const e = {};
    if (!form.vehicleId) e.vehicleId = "Select a vehicle";
    if (!form.date) e.date = "Date is required";
    if (form.odometer === "" || Number(form.odometer) < 0) e.odometer = "Enter a valid odometer reading";
    if (!form.litres || Number(form.litres) <= 0) e.litres = "Enter litres";
    if (!form.pricePerLitre || Number(form.pricePerLitre) <= 0) e.pricePerLitre = "Enter price per litre";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...form,
      odometer: Number(form.odometer),
      litres: Number(form.litres),
      pricePerLitre: Number(form.pricePerLitre),
      totalCost,
    };
    if (record) {
      updateFuelRecord(record.id, payload);
      onSaved?.("Fuel record updated");
    } else {
      addFuelRecord(payload);
      onSaved?.("Fuel record added");
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{record ? "Edit Fuel Record" : "Add Fuel Record"}</DialogTitle>
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
            <TextField fullWidth type="number" label="Odometer Reading (km)" value={form.odometer}
              onChange={set("odometer")} error={!!errors.odometer} helperText={errors.odometer} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="number" label="Litres" value={form.litres} onChange={set("litres")}
              error={!!errors.litres} helperText={errors.litres} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="number" label="Price per Litre (RWF)" value={form.pricePerLitre}
              onChange={set("pricePerLitre")} error={!!errors.pricePerLitre} helperText={errors.pricePerLitre} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Total Cost (RWF)" value={totalCost} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Fuel Station" value={form.fuelStation} onChange={set("fuelStation")} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Receipt / Reference Number" value={form.referenceNumber}
              onChange={set("referenceNumber")} />
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
