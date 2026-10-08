import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

/**
 * Generic filter bar.
 * fields: [{ name, label, type: 'select', options: [] }]
 * values / onChange operate on a flat object keyed by field name plus "search".
 */
export default function FilterPanel({ searchLabel = "Search", values, onChange, fields = [], onClear }) {
  const set = (name, value) => onChange({ ...values, [name]: value });

  return (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
        <TextField
          size="small"
          placeholder={searchLabel}
          value={values.search || ""}
          onChange={(e) => set("search", e.target.value)}
          sx={{ minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        {fields.map((f) => (
          <TextField
            key={f.name}
            select
            size="small"
            label={f.label}
            value={values[f.name] ?? ""}
            onChange={(e) => set(f.name, e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            {f.options.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        ))}
        <Button size="small" startIcon={<ClearIcon />} onClick={onClear}>
          Clear Filters
        </Button>
      </Stack>
    </Paper>
  );
}
