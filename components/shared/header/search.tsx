// components/shared/header/search.tsx

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllCategories } from "@/lib/actions/product.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { SearchIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Search() {
  // const categories = ["men", "women", "kids", "accessories"];

  // 글로벌 설정을 가져온다.
  const {
    site: { name },
  } = await getSetting();

  const t = await getTranslations();

  const categories = await getAllCategories();
  return (
    // TODO: search 컴포넌트 만들기
    <form action={"/search"} method="GET" className="flex items-stretch h-10">
      <Select name="category">
        <SelectTrigger
          className="w-auto h-full dark:border-gray-200 bg-gray-100 text-black border-r
        rounded-r-none rounded-l-md rtl:rounded-r-md rtl:rounded-l-none">
          <SelectValue className="text-sm" placeholder={t("Header.All")} />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            <SelectItem value="all" className="text-sm">
              {t("Header.All")}
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* (2). InputBox와 버튼을 만들어 준다.  */}
      <Input
        className="flex-1 rounded-none dark:border-gray-200 bg-gray-100 text-black text-base h-full"
        placeholder={t("Header.Search Site", { name })}
        name="q"
        type="search"
      />
      <button type="submit" className="bg-primary text-primary-foreground text-black rounded-s-none rounded-e-md h-full px-3 py-2">
        <SearchIcon className="w-6 h-6" />
      </button>
    </form>
  );
}
