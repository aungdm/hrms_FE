import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Edit() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the list page since we're using modals now
    navigate("/loan");
  }, [navigate]);
  
  return null;
} 