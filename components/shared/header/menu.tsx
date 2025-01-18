// components/shared/header/menu.tsx

import CartButton from "./cart-button";
import UserButton from "./user-button";

export default function Menu() {
  return (
    <div className="flex justify-end">
      <nav className="flex gap-3 w-full">
        {/* <Link href={"/login"} className="header-button flex items-center">
          Hello, Sign in
        </Link> */}
        <UserButton />

        {/* 카트 Link 대신 CartButton 컴포넌트 랜더링 */}
        <CartButton />
        {/* <Link href={"/cart"} className="header-button">
          <div className="flex items-end">
            <ShoppingCartIcon className="h-6 w-6 mr-1" />
            Cart
          </div>
        </Link> */}
      </nav>
    </div>
  );
}
