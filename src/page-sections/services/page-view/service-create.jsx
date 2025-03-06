import Box from "@mui/material/Box";
import HeadingArea from "../HeadingArea.jsx";
import SearchArea from "../SearchArea.jsx";
import Card from "@mui/material/Card";
import { Paragraph } from "@/components/typography"; // CUSTOM PAGE SECTION COMPONENTS
import IconWrapper from "@/components/icon-wrapper";
import { FlexBetween, FlexBox } from "@/components/flexbox"; // CUSTOM ICON COMPONENTS
import ShoppingCart from "@/icons/ShoppingCart.jsx";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import DropZone from "@/components/dropzone";
import { useCallback } from "react";
import Button from "@mui/material/Button";
import { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";
import { useFormik } from "formik"; // CUSTOM COMPONENTS
import * as Yup from "yup";
import { createServices, getService, updateService } from "../request.js";
import convertToFormData from "@/utils/convertToFormData.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export default function ServiceCreate() {
  const params = useParams();
  const id = params.id;
  console.log({ id });
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);
  const editorRef = useRef(null);
  const [files, setFiles] = useState(null);

  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  const handleDropFile = useCallback((acceptedFiles) => {
    const mappedFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    console.log({ mappedFiles }, "handleDropFilecalled");
    setFieldValue("image", mappedFiles[0]);
    setFiles(mappedFiles[0]?.preview);

    // setFiles(mappedFiles);
    console.log({ mappedFiles });
  }, []);

  const handleRemoveFile = () => {
    // setFiles([]);
    setFiles(null);
    setFieldValue("image", "");
  };

  const initialValues = {
    name: "",
    description: "",
    estimated_time: "",
    estimated_cost: "",
    image: "",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is Required!"),
    description: Yup.string(),
    estimated_time: Yup.number(),
    estimated_cost: Yup.number().min(1, "Cost must be at least 1"),
    image: Yup.mixed(),
  });
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    touched,
    setFieldValue,
    resetForm,
    setValues,
  } = useFormik({
    initialValues,
    validationSchema,

    onSubmit: async (values) => {
      console.log({ values });
      try {
        const formData = convertToFormData(values);

        let responseData;
        if (!isEdit) {
          responseData = await createServices(formData);
          console.log({ responseData });
        } else {
          formData.append("_method", "put");
          responseData = await updateService(id, formData);
        }
        console.log({ responseData });
        if (responseData.success) {
          toast.success(
            isEdit
              ? "Service updated successfully"
              : "Service created successfully "
          );
          resetForm();
          navigate("/services-list");
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

  const getServicesData = async (id) => {
    try {
      const response = await getService(id);
      console.log(response.data);
      if (response.success) {
        setValues({
          name: response?.data?.name || "",
          description: response?.data?.description || "",
          estimated_time: response?.data?.estimated_time || "",
          estimated_cost: response?.data?.estimated_cost || "",
          // image: response?.data?.image || "",
        });
        setFiles(response?.data?.image || null);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    if (id) {
      getServicesData(id);
    }
    // fetchList();
    setIsEdit(id ? true : false);
  }, []);

  return (
    <>
      <Box p={2}>
        <FlexBox alignItems="center">
          <IconWrapper>
            <ShoppingCart
              sx={{
                color: "primary.main",
              }}
            />
          </IconWrapper>
          <Paragraph fontSize={16}>
            {isEdit ? "Update Service" : "Create New Service"}
          </Paragraph>
        </FlexBox>
      </Box>
      <form onSubmit={handleSubmit}>
        <Grid container p={2} spacing={3}>
          <Grid size={{ md: 6, sm: 12, xs: 12 }}>
            <Card>
              <Box p={3} sx={{ mb: 4 }}>
                <Grid
                  size={{
                    sm: 12,
                    xs: 12,
                  }}
                >
                  <Paragraph fontSize={14} sx={{ pb: 2 }}>
                    Service Name
                  </Paragraph>
                  <TextField
                    type="text"
                    fullWidth
                    name="name"
                    label="Service Name"
                    value={values.name}
                    onChange={handleChange}
                    helperText={touched.name && errors.name}
                    error={Boolean(touched.name && errors.name)}
                  />
                </Grid>
              </Box>
            </Card>
            <Card sx={{ mt: 3 }}>
              <Box p={3} sx={{ mb: 4 }}>
                <Grid
                  size={{
                    sm: 12,
                    xs: 12,
                  }}
                >
                  <Paragraph fontSize={14} sx={{ pb: 2 }}>
                    Description{" "}
                  </Paragraph>
                  <TextField
                    type="text"
                    fullWidth
                    name="description"
                    label="Description"
                    value={values.description}
                    onChange={handleChange}
                    helperText={touched.description && errors.description}
                    error={Boolean(touched.description && errors.description)}
                  />
                </Grid>
              </Box>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6 }}>
            <Card style={{ minHeight: "165px" }}>
              <Box p={3}>
                <Grid
                  size={{
                    sm: 12,
                    xs: 12,
                  }}
                >
                  <Paragraph fontSize={14} sx={{ pb: 2 }}>
                    Estiamted Cost
                  </Paragraph>
                  <TextField
                    type="number"
                    fullWidth
                    name="estimated_cost"
                    label="Estiamted Cost"
                    value={values.estimated_cost}
                    onChange={handleChange}
                    helperText={touched.estimated_cost && errors.estimated_cost}
                    error={Boolean(
                      touched.estimated_cost && errors.estimated_cost
                    )}
                  />
                </Grid>
              </Box>
            </Card>
            <Card style={{ minHeight: "165px" }} sx={{ mt: 2 }}>
              <Box p={3}>
                <Grid
                  size={{
                    sm: 12,
                    xs: 12,
                  }}
                >
                  <Paragraph fontSize={14} sx={{ pb: 2 }}>
                    Estiamted Time
                  </Paragraph>
                  <TextField
                    type="text"
                    fullWidth
                    name="estimated_time"
                    label="Estiamted Time"
                    value={values.estimated_time}
                    onChange={handleChange}
                    helperText={touched.estimated_time && errors.estimated_time}
                    error={Boolean(
                      touched.estimated_time && errors.estimated_time
                    )}
                  />
                </Grid>
              </Box>
            </Card>
          </Grid>
          <Grid size={12}>
            <Card
              sx={{
                my: 3,
              }}
            >
              <DropZone
                // file={isEdit ? files : files[0]?.preview}
                file={files}
                onRemove={handleRemoveFile}
                onDrop={handleDropFile}
              />
              {/* <img src={files[0]?.preview} width={250} height={250} /> */}
              {touched.image && errors.image && (
                <Paragraph color="error.main" mt={2}>
                  {errors.image}
                </Paragraph>
              )}
            </Card>
          </Grid>
        </Grid>
        <Grid size={12}>
          <Button type="submit" variant="contained">
            {" "}
            {isEdit ? "Update Service" : "Create Service"}
          </Button>
        </Grid>
      </form>
    </>
  );
}
