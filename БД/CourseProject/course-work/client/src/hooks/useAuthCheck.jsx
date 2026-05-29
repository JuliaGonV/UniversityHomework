// hooks/useAuthCheck.js
import { useState, useEffect } from "react";

export const useAuthCheck = (allowedRoles) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // ← вот это важно

  useEffect(() => {
    const checkRole = () => {
      const userRole = sessionStorage.getItem("userRole");
      if (allowedRoles === "loggedIn") {
        setIsAuthorized(!!userRole);
      } else if (userRole && allowedRoles) {
        const rolesArray = Array.isArray(allowedRoles)
          ? allowedRoles
          : [allowedRoles];
        setIsAuthorized(rolesArray.includes(userRole));
      } else {
        setIsAuthorized(false);
      }
    };

    checkRole();

    const handleStorageChange = (event) => {
      if (event.key === "userRole") {
        checkRole();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [allowedRoles]);

  return isAuthorized;
};
