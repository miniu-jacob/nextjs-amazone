import React from "react";
import Menu from "./shared/header/menu";
import Search from "./shared/header/search";

const Header = () => {
  return (
    <div className="w-full h-[60px] flex flex-row">
      Header
      <div>
        <Search />
      </div>
      <div>
        <Menu />
      </div>
    </div>
  );
};

export default Header;
