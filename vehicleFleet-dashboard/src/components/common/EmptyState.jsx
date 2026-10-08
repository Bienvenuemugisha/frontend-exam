import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxIcon from "@mui/icons-material/InventoryOutlined";

export default function EmptyState({ title = "Nothing here yet", subtitle }) {
  return (
    <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
      <InboxIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
        {title}
      </Typography>
      {subtitle && <Typography variant="body2">{subtitle}</Typography>}
    </Box>
  );
}
