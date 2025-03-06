// CUSTOM ICON COMPONENT
import duotone from "@/icons/duotone"; // ==============================================================

// ==============================================================
export const navigations = [
  // {
  //   type: "label",
  //   label: "Dashboard",
  // },
  // {
  //   name: "Analytics",
  //   icon: duotone.PersonChalkboard,
  //   children: [
  //     {
  //       name: "Analytics 1",
  //       path: "/dashboard",
  //     },
  //   ],
  // },
  // {
  //   type: "label",
  //   label: "Pages",
  // },
  // {
  //   name: "User Profile",
  //   icon: duotone.UserProfile,
  //   path: "/dashboard/user-profile",
  // },
  {
    name: "Users",
    icon: duotone.UserList,
    path: "/dashboard/user-list",
  },
  {
    name: "Services",
    icon: duotone.TodoList,
    path: "/dashboard/services-list",
  },
  {
    name: "Bookings",
    icon: duotone.Calender,
    path: "/dashboard/bookings-list",
  },
];
