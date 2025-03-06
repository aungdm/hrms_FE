import Box from "@mui/material/Box";
import { Paragraph } from "../../components/typography/index.jsx";
import IconWrapper from "@/components/icon-wrapper";
import Chat from "@/icons/Chat.jsx";
import { FlexBetween, FlexBox } from "@/components/flexbox"; // CUSTOM ICON COMPONENTS
import { useTranslation } from "react-i18next";
import duotone from "@/icons/duotone";

export default function HeadingArea() {
  const Calender = duotone.Calender;
  const { t } = useTranslation();
  return (
    <>
      <Box p={2}>
        <FlexBox alignItems="center">
          <IconWrapper>
            <Calender
              sx={{
                color: "primary.main",
              }}
            />
          </IconWrapper>
          <Paragraph fontSize={16}>{t("booking")}</Paragraph>
        </FlexBox>
      </Box>
    </>
  );
}
