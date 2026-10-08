import Chip from "@mui/material/Chip";
import { STATUS_COLORS } from "../../data/constants";

export default function StatusChip({ status, size = "small" }) {
  return <Chip label={status} color={STATUS_COLORS[status] || "default"} size={size} variant="filled" />;
}
