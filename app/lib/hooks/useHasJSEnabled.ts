import { useEffect, useState } from "react";

export default function useHasJSEnabled() {
  const [hasJsEnabled, setHasJsEnabled] = useState(false);

  useEffect(() => {
    // only disable buttons when js is enabled
    setHasJsEnabled(true);
  }, []);

  return hasJsEnabled;
}
