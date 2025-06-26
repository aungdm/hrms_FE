import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreateView } from "@/page-sections/loan/page-view";

export default function Create() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the list page since we're using modals now
    navigate("/loan");
  }, [navigate]);
  
  return null;
}
