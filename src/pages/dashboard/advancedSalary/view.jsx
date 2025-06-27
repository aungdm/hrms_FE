import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function View() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the list page since we're using modals now
    navigate("/advanced-salary");
  }, [navigate]);
  
  return null;
} 