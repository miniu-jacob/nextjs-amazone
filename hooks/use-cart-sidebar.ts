// hooks/use-cart-sidebar.ts

import { usePathname } from "next/navigation";
import useCartStore from "./use-cart-store";
import useDeviceType from "./use-device-type";

// (3). 함수 밖에서 특정 경로인지 확인하는 변수를 선언한다.
// 경로 s 가 제외 경로에 포함되어 있지 않아야 true를 반환한다.
const isNotInPaths = (s: string) =>
  !/^\/$|^\/cart$|^\/checkout$|^\/login$|^\/register$|^\/order(\/.*)?$|^\/account(\/.*)?$|^\/admin(\/.*)?$/.test(s);

function useCartSidebar() {
  // (1). 현재 경로를 가져온다. Next.js 에서는 usePathname Next.js 클라이언트 훅을 사용할 수 있다.
  const currentPath = usePathname();

  // (5). deviceType을 추가해 준다.
  const deviceType = useDeviceType();

  // (2). 카트 스토어에서 상품 배열을 가져온다.
  const {
    cart: { items },
  } = useCartStore();

  // (4). 경로가 제외 경로에 포함되어 있지 않으면서, 카트에 상품이 있는 경우 true를 반환한다.
  return items.length > 0 && deviceType === "desktop" && isNotInPaths(currentPath);
}

export default useCartSidebar;
