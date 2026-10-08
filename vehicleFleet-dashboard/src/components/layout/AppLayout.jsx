import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import BuildIcon from "@mui/icons-material/Build";
import TimelineIcon from "@mui/icons-material/Timeline";
import SummarizeIcon from "@mui/icons-material/Summarize";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const DRAWER_WIDTH = 250;

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: DashboardIcon },
  { label: "Vehicles", path: "/vehicles", icon: DirectionsCarIcon },
  { label: "Drivers", path: "/drivers", icon: PeopleIcon },
  { label: "Assignments", path: "/assignments", icon: AssignmentIndIcon },
  { label: "Fuel Records", path: "/fuel", icon: LocalGasStationIcon },
  { label: "Maintenance", path: "/maintenance", icon: BuildIcon },
  { label: "Mileage Records", path: "/mileage", icon: TimelineIcon },
  { label: "Reports", path: "/reports", icon: SummarizeIcon },
];

export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width:900px)");
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar sx={{ gap: 1 }}>
        <LocalShippingIcon sx={{ color: "#E08A2C" }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#fff" }}>
          FleetControl
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <List sx={{ flex: 1, py: 1 }}>
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const selected = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          return (
            <ListItemButton
              key={path}
              selected={selected}
              onClick={() => {
                navigate(path);
                if (!isDesktop) setMobileOpen(false);
              }}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                color: "#C7CFE0",
                "&.Mui-selected": { backgroundColor: "rgba(224,138,44,0.16)", color: "#fff" },
                "&.Mui-selected .MuiListItemIcon-root": { color: "#E08A2C" },
                "&:hover": { backgroundColor: "rgba(63, 212, 25, 0.01)" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  const currentLabel = NAV_ITEMS.find((n) =>
    n.path === "/" ? location.pathname === "/" : location.pathname.startsWith(n.path)
  )?.label || "Vehicle Details";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }} elevation={0}>
        <Toolbar sx={{ gap: 1 }}>
          {!isDesktop && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: 18 }}>
            {currentLabel}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, display: { xs: "none", sm: "block" } }}>
             Meru Admin
          </Typography>
        </Toolbar>
      </AppBar>

      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{ width: DRAWER_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
