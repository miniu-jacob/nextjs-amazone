// app/(home)/page.tsx

import { HomeCarousel } from "@/components/shared/home/home-carousel";
import data from "@/lib/data";

export default function Page() {
  return (
    <div>
      <h1 className="h1-bold text-center p-10">Home Page Content</h1>
      <div>
        <HomeCarousel items={data.carousels} />
      </div>
    </div>
  );
}
