// components/shared/header/menu.tsx

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CartButton from "./cart-button";
import ThemeSwitcher from "./theme-switcher";
import UserButton from "./user-button";
import { EllipsisVertical } from "lucide-react";

// export default function Menu() {
const Menu = ({ forAdmin = false }: { forAdmin?: boolean }) => {
  return (
    <div className="flex justify-end">
      {/* DESKTOP MENU */}
      <nav className="md:flex gap-3 hidden w-full">
        <ThemeSwitcher />
        <UserButton />
        {forAdmin ? null : <CartButton />}
      </nav>
      {/* MOBILE MENU */}
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle header-button">
            <EllipsisVertical className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent className="bg-black text-white flex flex-col items-start">
            <SheetHeader className="w-full">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-white ">Site Menu</SheetTitle>
                <SheetDescription />
              </div>
            </SheetHeader>
            <ThemeSwitcher />
            <UserButton />
            <CartButton />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
