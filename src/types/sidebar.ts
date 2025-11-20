import { ReactNode } from "react";

export interface SidebarMenuItem {
    icon: ReactNode;
    label: string;
    route: string;
    children?: SidebarDropdownItem[];
}

export interface SidebarDropdownItem {
    route: string;
    label: string;
}

export interface MenuGroup {
    name: string;
    menuItems: SidebarMenuItem[];
}
