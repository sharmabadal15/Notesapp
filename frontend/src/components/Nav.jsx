import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from "@nextui-org/react";
import { AcmeLogo } from "./AcmeLogo.jsx";
import { useAuth } from "../authentication/AuthContext";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
  User,
} from "@nextui-org/react";
import { Avatar, AvatarIcon } from "@nextui-org/react";

export default function Nav() {
  const { isLoggedIn, setIsLoggedIn,user, setUser} = useAuth();
  const [notes, setNotes] = useState([]);

  // const handleLogout = () => {
  //   setIsLoggedIn(false);
  //   setUser(null);
  //   setNotes([]);
  // };
  
  const handleLogout = () => {
    localStorage.setItem('user',null); // Remove user data from localStorage
    localStorage.setItem('isLoggedIn', false); // Set isLoggedIn to false in localStorage
        setNotes([]);
        window.location.reload();

  };

  return (
    <>
      <Navbar isBordered>
        <NavbarBrand>
          <AcmeLogo as={Link} href="/" />
          <Link href="/" className="font-bold text-inherit">
            NotesApp
          </Link>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#">
              Features
            </Link>
          </NavbarItem>
          <NavbarItem isActive>
            <Link href="#" aria-current="page">
              Customers
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Integrations
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          {isLoggedIn ? (
            <NavbarItem>
              <Dropdown
                showArrow
                className="dark bg-black " //very important line for dark theme
                radius="sm"
                classNames={{
                  base: "before:bg-default-200",
                  content: "p-0 border-small border-divider bg-background",
                }}
              >
                <DropdownTrigger>
                  <Button isIconOnly disableRipple radius="full">
                    {" "}
                    <Avatar
                      icon={<AvatarIcon />}
                      classNames={{
                        base: "bg-gradient-to-br from-[#FFB457] to-[#FF705B]",
                        icon: "text-black/80",
                      }}
                    />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Custom item styles"
                  disabledKeys={["profile"]}
                  className="p-3"
                  itemClasses={{
                    base: [
                      "rounded-md",
                      "text-default-500",
                      "transition-opacity",
                      "data-[hover=true]:text-foreground",
                      "data-[hover=true]:bg-default-100",
                      "dark:data-[hover=true]:bg-default-50",
                      "data-[selectable=true]:focus:bg-default-50",
                      "data-[pressed=true]:opacity-70",
                      "data-[focus-visible=true]:ring-default-500",
                    ],
                  }}
                >
                  <DropdownSection aria-label="Profile & Actions" showDivider>
                    <DropdownItem
                      isReadOnly
                      key="profile"
                      className="h-14 gap-2"
                    >
                      <User
                        // name={user.username}
                        name="Test"
                        classNames={{
                          name: "text-default-600",
                          description: "text-default-500",
                        }}
                      />
                    </DropdownItem>
                    <DropdownItem key="dashboard">Dashboard</DropdownItem>
                    <DropdownItem key="settings">Settings</DropdownItem>
                  </DropdownSection>

                  <DropdownSection aria-label="Preferences" showDivider>
                    <DropdownItem key="quick_search" shortcut="⌘K">
                      Quick search
                    </DropdownItem>
                  </DropdownSection>

                  <DropdownSection aria-label="Help & Feedback">
                    <DropdownItem key="help_and_feedback">
                      Help & Feedback
                    </DropdownItem>
                    <DropdownItem key="logout" onClick={handleLogout}>
                      Log Out
                    </DropdownItem>
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          ) : (
            <>
              <NavbarItem className="hidden lg:flex">
                <Link href="/login">Login</Link>
              </NavbarItem>
              <NavbarItem>
                <Button color="primary" href="/signup" as={Link} variant="flat">
                  Sign Up
                </Button>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>
      <div className="h-10"></div>
    </>
  );
}
