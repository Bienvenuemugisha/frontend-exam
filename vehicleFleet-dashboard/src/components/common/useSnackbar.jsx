import { useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export function useSnackbar() {
  const [state, setState] = useState({ open: false, message: "", severity: "success" });

  const notify = useCallback((message, severity = "success") => {
    setState({ open: true, message, severity });
  }, []);

  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  const SnackbarElement = (
    <Snackbar
      open={state.open}
      autoHideDuration={3500}
      onClose={close}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert onClose={close} severity={state.severity} variant="filled" sx={{ width: "100%" }}>
        {state.message}
      </Alert>
    </Snackbar>
  );

  return { notify, SnackbarElement };
}
