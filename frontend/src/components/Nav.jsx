import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
  User,
  Avatar,
  AvatarIcon,
} from "@nextui-org/react";
import { useAuth } from "../authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, FileText } from "react-feather";

export default function Nav() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar
      isBordered={false}
      isBlurred={false}
      className="bg-transparent border-b border-white/5"
      maxWidth="full"
      height="4rem"
      classNames={{
        wrapper: "max-w-[1200px] px-4 sm:px-6 lg:px-8",
      }}
    >
      <NavbarBrand className="gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
          <FileText size={16} className="text-white" />
        </div>
        <Link href="/" className="font-semibold text-white text-lg tracking-tight">
          NotesApp
        </Link>
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-3">
        {isLoggedIn ? (
          <NavbarItem>
            <Dropdown
              showArrow
              className="dark"
              radius="lg"
              classNames={{
                base: "before:bg-white/10",
                content: "p-1 border border-white/10 bg-zinc-900/90 backdrop-blur-xl",
              }}
            >
              <DropdownTrigger>
                <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/5 transition-colors outline-none">
                  <Avatar
                    icon={<AvatarIcon />}
                    size="sm"
                    classNames={{
                      base: "bg-gradient-to-br from-violet-500 to-blue-500",
                      icon: "text-white/90",
                    }}
                  />
                  <span className="text-sm text-white/80 hidden sm:inline">
                    {user?.username || "User"}
                  </span>
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="User menu"
                disabledKeys={["profile"]}
                className="p-2"
                itemClasses={{
                  base: [
                    "rounded-lg",
                    "text-white/70",
                    "transition-all",
                    "data-[hover=true]:text-white",
                    "data-[hover=true]:bg-white/5",
                  ],
                }}
              >
                <DropdownSection aria-label="Profile" showDivider>
                  <DropdownItem
                    isReadOnly
                    key="profile"
                    className="h-14 gap-2 opacity-100"
                  >
                    <User
                      name={user?.username || "User"}
                      description={user?.email || ""}
                      classNames={{
                        name: "text-white/90 font-medium",
                        description: "text-white/50 text-xs",
                      }}
                    />
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection aria-label="Actions">
                  <DropdownItem
                    key="logout"
                    onPress={handleLogout}
                    startContent={<LogOut size={14} />}
                    className="text-red-400 data-[hover=true]:text-red-300"
                  >
                    Log Out
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        ) : (
          <>
            <NavbarItem>
              <Link
                href="/login"
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Login
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Button
                color="primary"
                href="/signup"
                as={Link}
                size="sm"
                radius="full"
                className="bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium px-5 shadow-lg shadow-violet-500/20"
              >
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </Navbar>
  );
}
