import { Fragment } from "react";
import { Box } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Import the edit modal
import OvertimeEditModal from "@/page-sections/overtime/components/OvertimeEditModal";

export default function OvertimeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In a real implementation, you'd fetch the record data here
  // For now, we'll use a dummy implementation
  useEffect(() => {
    // Mock implementation - in reality, you would use an API call
    setLoading(false);
    setRecord({
      _id: id,
      date: new Date(),
      employeeId: {
        name: "Sample Employee"
      },
      overtTimeStart: null,
      overtTimeEnd: null,
      overTimeMinutes: 0,
      overTimeStatus: "Pending"
    });
  }, [id]);

  const handleBack = () => {
    navigate("/overtime-list");
  };

  if (loading) {
    return (
      <Box p={3}>
        <Card sx={{ p: 3 }}>
          <Typography>Loading overtime details...</Typography>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Card sx={{ p: 3 }}>
          <Typography color="error">Error loading overtime record: {error}</Typography>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to List
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Fragment>
      <Box pt={2} pb={4}>
        <Card sx={{ p: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mb: 3 }}
          >
            Back to List
          </Button>
          
          <Typography variant="h5" gutterBottom>
            Edit Overtime Record
          </Typography>
          
          {record && (
            <Box mt={3}>
              <OvertimeEditModal
                open={true}
                handleClose={handleBack}
                record={record}
                onSuccess={() => {
                  // Navigate back after successful save
                  navigate("/overtime-list");
                }}
              />
            </Box>
          )}
        </Card>
      </Box>
    </Fragment>
  );
}
