import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom"; // CUSTOM DEFINED HOOK
import useAuth from "@/hooks/useAuth"; // LAYOUT BASED HOOK
import useLayout from "@/layouts/layout-1/context/useLayout"; // CUSTOM COMPONENTS
import SidebarAccordion from "./SidebarAccordion";
import duotone from "@/icons/duotone";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  ItemText,
  ListLabel,
  BulletIcon,
  ICON_STYLE,
  ExternalLink,
  NavItemButton,
} from "@/layouts/layout-1/styles";

export default function MultiLevelMenu({ sidebarCompact }) {
  const { t } = useTranslation();
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);

  // Handle right-click context menu
  const handleContextMenu = (event, path) => {
    event.preventDefault();
    setSelectedPath(path);
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX, mouseY: event.clientY }
        : null,
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setSelectedPath(null);
  };

  // Open in new tab functionality
  const handleOpenInNewTab = () => {
    if (selectedPath) {
      window.open(selectedPath, '_blank');
    }
    handleCloseContextMenu();
  };

  const navigations = [
    {
      name: "People",
      icon: duotone.Calendar,
      children: [
        {
          name: "Employee",
          path: "/employee-list",
        },
        {
          name: "Salary Revisions",
          path: "/salary-revisions-list",
        },
      ],
    },
    {
      name: "Attendance",
      icon: duotone.Calendar,
      children: [
        {
          name: "Time Sheet",
          path: "/time-sheet-list",
        },
        {
          name: "Attendance Logs",
          path: "/attendance-logs-list",
        },
        {
          name: "Employee Schedule",
          path: "/employee-schedule-list",
        },
      ],
    },
    {
      name: "Payroll",
      icon: duotone.Wallet,
      children: [
        {
          name: "Pay Rolls",
          icon: duotone.Dollar,
          path: "/pay-rolls-list",
        },
        {
          name: "Salary Sheet",
          icon: duotone.FileText,
          path: "/salary-sheet-list",
        },
        {
          name: "Pay Slips",
          icon: duotone.Receipt,
          path: "/pay-slips-list",
        },
        {
          name: "Custom PayItems",
          icon: duotone.Settings,
          children: [
            {
              name: "Fine / Deduction",
              path: "/fine-deduction-list",
            },
            {
              name: "Other Deductions",
              path: "/other-deduction-list",
            },
            {
              name: "Other Incentives",
              path: "/other-incentives-list",
            },
            {
              name: "Arrears",
              path: "/arrears-list",
            },
          ],
        },
      ],
    },
    {
      name: "Requests",
      icon: duotone.Wallet,
      children: [
        {
          name: "Leave",
          path: "/leave-list",
        },
        {
          name: "Overtime",
          path: "/overtime-list",
        },
        {
          name: "Punch",
          path: "/punch-list",
        },
        {
          name: "Relaxation",
          path: "/relaxation-request-list",
        },
        {
          name: "Loan",
          path: "/loan-list",
        },
        {
          name: "Advanced Salary",
          path: "/advanced-salary-list",
        },
      ],
    },
    {
      name: "Settings",
      icon: duotone.Wallet,
      children: [
        {
          name: "Time Slots",
          path: "/time-slot-list",
        },
        {
          name: "Attendance Logs",
          path: "/attendance-logs-list",
        },
      ],
    },
    // {
    //   name: t("bookings"),
    //   icon: duotone.Calender,
    //   path: "/bookings-list",
    // },
  ];

  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { handleCloseMobileSidebar } = useLayout(); // HANDLE ACTIVE CURRENT PAGE

  const activeRoute = (path) => (pathname === path ? 1 : 0); // HANDLE NAVIGATE TO ANOTHER PAGE

  const handleNavigation = (path) => {
    navigate(path);
    handleCloseMobileSidebar?.();
  }; // ACTIVATE SIDEBAR COMPACT

  const COMPACT = sidebarCompact ? 1 : 0; // RECURSIVE FUNCTION TO RENDER MULTI LEVEL MENU

  const renderLevels = (data) => {
    return data.map((item, index) => {
      // MENU LABEL DESIGN
      if (item.type === "label") {
        return (
          <ListLabel key={index} compact={COMPACT}>
            {t(item.label)}
          </ListLabel>
        );
      } // MENU LIST WITH CHILDREN

      if (item.children) {
        return (
          <SidebarAccordion key={index} item={item} sidebarCompact={COMPACT}>
            {renderLevels(item.children)}
          </SidebarAccordion>
        );
      } // MENU ITEM WITH EXTERNAL LINK

      if (item.type === "extLink") {
        return (
          <ExternalLink
            key={index}
            href={item.path}
            rel="noopener noreferrer"
            target="_blank"
          >
            <NavItemButton key={item.name} name="child" active={0}>
              {item.icon ? (
                <item.icon sx={ICON_STYLE(0)} />
              ) : (
                <span className="item-icon icon-text">{item.iconText}</span>
              )}

              <ItemText compact={COMPACT} active={activeRoute(item.path)}>
                {item.name}
              </ItemText>
            </NavItemButton>
          </ExternalLink>
        );
      }

      return (
        <NavItemButton
          key={index}
          disabled={item.disabled}
          active={activeRoute(item.path)}
          onClick={() => handleNavigation(item.path)}
          onContextMenu={(e) => handleContextMenu(e, item.path)}
        >
          {item?.icon ? (
            <item.icon sx={ICON_STYLE(activeRoute(item.path))} />
          ) : (
            <BulletIcon active={activeRoute(item.path)} />
          )}

          <ItemText compact={COMPACT} active={activeRoute(item.path)}>
            {t(item.name)}
          </ItemText>
        </NavItemButton>
      );
    });
  }; // USER ROLE BASED ON FILTER NAVIGATION

  const filterNavigation = useMemo(() => {
    return navigations.filter((navigation) => {
      if (!navigation.access) return true;
      else if (navigation.access === user?.role) return true;
      else return false;
    });
  }, [user?.role]);
  
  return (
    <>
      {renderLevels(filterNavigation)}
      
      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleOpenInNewTab}>Open in new tab</MenuItem>
      </Menu>
    </>
  );
}
