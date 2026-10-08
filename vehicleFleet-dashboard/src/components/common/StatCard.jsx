import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function StatCard({ label, value, icon: Icon, accent = "#1B2A4A", suffix }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, "&:last-child": { pb: 2 } }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: `${accent}1A`,
            color: accent,
            flexShrink: 0,
          }}
        >
          {Icon && <Icon fontSize="small" />}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ lineHeight: 1.2 }}>
            {value}
            {suffix ? (
              <Typography component="span" variant="body2" sx={{ ml: 0.5, color: "text.secondary" }}>
                {suffix}
              </Typography>
            ) : null}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
