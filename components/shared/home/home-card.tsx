// components/shared/home/home-card.tsx

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

type CardItem = {
  title: string;
  link: { text: string; href: string };
  items: {
    name: string;
    items?: string[];
    image: string;
    href: string;
  }[];
};

export function HomeCard({ cards }: { cards: CardItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
      {/* 상위 컴포넌트에서 배열을 받기 때문에 이를 순회한다. */}
      {cards.map((card) => (
        <Card key={card.title} className="rounded-none flex flex-col">
          <CardContent className="p-4 flex-1">
            <h3 className="text-xl font-bold mb-4">{card.title}</h3>
            {/* 하위 카테고리 */}
            <div className="grid grid-cols-2 gap-4">
              {card.items.map((item) => (
                <Link key={item.name} href={item.href} className="flex flex-col">
                  <Image
                    src={item.image}
                    alt={item.name}
                    height={120}
                    width={120}
                    className="aspect-square object-scale-down max-w-full mx-auto "
                  />
                  {/* 아이템 설명 */}
                  <p className="text-center text-sm whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</p>
                </Link>
              ))}
            </div>
          </CardContent>
          {/* Card Footer */}
          {card.link && (
            <CardFooter>
              <Link href={card.link.href} className="mt-4 block">
                {card.link.text}
              </Link>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
