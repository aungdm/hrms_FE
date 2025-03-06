import { Fragment, useContext, useState } from "react"; // MUI

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import ClickAwayListener from "@mui/material/ClickAwayListener"; // SITE SETTINGS CONTEXT FILE

import { SettingsContext } from "@/contexts/settingsContext"; // CUSTOM ICON COMPONENTS

import Menu from "@/icons/Menu";
import MenuLeft from "@/icons/MenuLeft";
import ThemeIcon from "@/icons/ThemeIcon";
import Search from "@/icons/duotone/Search";
import MenuLeftRight from "@/icons/MenuLeftRight"; // LAYOUT BASED HOOK

import useLayout from "@/layouts/layout-1/context/useLayout"; // CUSTOM COMPONENTS

import SearchBar from "@/layouts/layout-parts/SearchBar";
import ProfilePopover from "@/layouts/layout-parts/popovers/ProfilePopover";
import ServicePopover from "@/layouts/layout-parts/popovers/ServicePopover";
import LanguagePopover from "@/layouts/layout-parts/popovers/LanguagePopover";
import NotificationsPopover from "@/layouts/layout-parts/popovers/NotificationsPopover"; // STYLED COMPONENTS
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useTranslation } from "react-i18next";
import ToggleButton from "@mui/material/ToggleButton";
import { DashboardHeaderRoot, StyledToolBar } from "@/layouts/layout-1/styles";
import axios from "axios";

export default function DashboardHeader() {
  const { t, i18n } = useTranslation();
  const [alignment, setAlignment] = useState(i18n.language); // Use the active language
  const { handleOpenMobileSidebar } = useLayout();
  const [openSearchBar, setSearchBar] = useState(false);
  const { settings, saveSettings } = useContext(SettingsContext);
  const upSm = useMediaQuery((theme) => theme.breakpoints.up("sm"));
  const downMd = useMediaQuery((theme) => theme.breakpoints.down(1200));

  const handleChangeDirection = (value) => {
    saveSettings({ ...settings, direction: value });
  };

  const handleChangeTheme = (value) => {
    saveSettings({ ...settings, theme: value });
  };

  const handleChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      i18n.changeLanguage(newAlignment);
      const direction = newAlignment === "ar" ? "rtl" : "ltr";
      saveSettings({ ...settings, direction });
    }
    axios.defaults.headers.common["x-current-language"] =
      newAlignment === "ar" ? "ar" : "";
    window.location.reload();
  };

  return (
    <DashboardHeaderRoot position="sticky">
      <StyledToolBar>
        {/* SMALL DEVICE SIDE BAR OPEN BUTTON */}
        {downMd && (
          <IconButton onClick={handleOpenMobileSidebar}>
            <Menu />
          </IconButton>
        )}

        {/* SEARCH ICON BUTTON */}
        <ClickAwayListener onClickAway={() => setSearchBar(false)}>
          <div>
            {!openSearchBar ? (
              <IconButton onClick={() => setSearchBar(true)}>
                <Search
                  sx={{
                    color: "grey.400",
                    fontSize: 18,
                  }}
                />
              </IconButton>
            ) : null}

            <SearchBar
              open={openSearchBar}
              handleClose={() => setSearchBar(false)}
            />
          </div>
        </ClickAwayListener>

        <Box flexGrow={1} ml={1} />

        {/* TEXT DIRECTION SWITCH BUTTON */}
        {/*{settings.direction === 'rtl' ? <IconButton onClick={() => handleChangeDirection('ltr')}>*/}
        {/*    <MenuLeft sx={{*/}
        {/*  color: 'grey.400'*/}
        {/*}} />*/}
        {/*  </IconButton> : <IconButton onClick={() => handleChangeDirection('rtl')}>*/}
        {/*    <MenuLeftRight sx={{*/}
        {/*  color: 'grey.400'*/}
        {/*}} />*/}
        {/*  </IconButton>}*/}

        {/* THEME SWITCH BUTTON */}
        {/*<IconButton onClick={() => handleChangeTheme(settings.theme === 'light' ? 'dark' : 'light')}>*/}
        {/*  <ThemeIcon />*/}
        {/*</IconButton>*/}

        {/*{upSm && <Fragment>*/}
        {/*    <LanguagePopover />*/}
        {/*    <NotificationsPopover />*/}
        {/*    <ServicePopover />*/}
        {/*  </Fragment>}*/}
        <ToggleButtonGroup
          style={{ marginRight: "76px" }}
          color="primary"
          value={alignment}
          exclusive
          onChange={handleChange}
          aria-label="Platform"
        >
          <ToggleButton
            value="en"
            sx={{
              fontSize: "11px",
              fontWeight: "700",
              "&.Mui-selected": {
                backgroundColor: "#6950E8",
                color: "white",
                "&:hover": {
                  backgroundColor: "#4b38ac",
                },
              },
            }}
          >
            English
          </ToggleButton>

          <ToggleButton
            value="ar"
            sx={{
              fontSize: "11px",
              fontWeight: "700",
              "&.Mui-selected": {
                backgroundColor: "#6950E8",
                color: "white",
                "&:hover": {
                  backgroundColor: "#4b38ac",
                },
              },
            }}
          >
            arabic
          </ToggleButton>
        </ToggleButtonGroup>

        <ProfilePopover />
      </StyledToolBar>
    </DashboardHeaderRoot>
  );
}
