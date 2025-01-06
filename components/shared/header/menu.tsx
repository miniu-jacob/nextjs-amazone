// components/shared/header/menu.tsx

import Link from "next/link";
import { ShoppingCartIcon, UserIcon } from "lucide-react";

export default function Menu() {
  return (
    <div className="flex justify-end">
      <nav className="flex gap-3 w-full">
        <Link href={"/signin"} className="header-button flex items-center">
          Hello, Sign in
        </Link>

        <Link href={"/cart"} className="header-button">
          <div className="flex items-end">
            <ShoppingCartIcon className="h-6 w-6 mr-1" />
            Cart
          </div>
        </Link>
      </nav>
    </div>
  );
}
