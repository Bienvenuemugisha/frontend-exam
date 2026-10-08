import { createTheme } from "@mui/material/styles";

// A "control-room" palette: deep slate-navy for structure/chrome, a warm
// amber for attention/alerts (fuel, maintenance due), and teal for
// positive/active states (assigned, in use). Avoids the generic
// indigo-on-white SaaS default.
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1B2A4A", light: "#3A4C74", dark: "#0F1B33", contrastText: "#fff" },
    secondary: { main: "#E08A2C", light: "#F2A34D", dark: "#B96E1A", contrastText: "#1B2A4A" },
    success: { main: "#1F9E7A" },
    warning: { main: "#E08A2C" },
    error: { main: "#C24444" },
    info: { main: "#2C7BA6" },
    background: { default: "#F4F5F7", paper: "#FFFFFF" },
    text: { primary: "#1A2332", secondary: "#5B6474" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, color: "#5B6474" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: { root: { backgroundColor: "#1B2A4A" } },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: "#152238", color: "#E6E9F0", borderRight: "none" },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: "0 1px 3px rgba(15,27,51,0.08)", border: "1px solid #E4E7EC" },
      },
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

export default theme;
