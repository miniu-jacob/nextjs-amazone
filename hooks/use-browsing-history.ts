// hooks/use-browsing-history.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

// (1). 스토어에서는 우선 타입/인터페이스를 정의한다.
type BrowsingHistory = {
  products: { id: string; category: string }[];
};

// (2). 상태 및 동작을 정의한다. 초기 상태는 빈 배열이다.
const initialState: BrowsingHistory = {
  products: [],
};

// (3). zustand 라이브러리를 사용하여 스토어를 생성한다.(create)
export const browsingHistoryStore = create<BrowsingHistory>()(
  persist(() => initialState, {
    name: "browsingHistoryStore",
  }),
);

// (4). 스토어에 상태와 관련된 동작을 간단히 호출할 수 있도록 커스텀 훅을 생성한다.
export default function useBrowsingHistory() {
  const { products } = browsingHistoryStore();

  return {
    products, // (a). 상품 배열의 상태를 반환한다.
    addItem: (product: { id: string; category: string }) => {
      // (b). 상품 배열에서 인덱스를찾아 현재 상품이 있는지를 확인한다.
      const index = products.findIndex((p) => p.id === product.id);
      // (c). 상품이 없는 경우는 -1을 반환한다. 즉 상품이 있다면 (-1이 아니라면) 상품을 삭제한다.
      if (index !== -1) products.splice(index, 1);
      // (d). 상품 배열에 상품을 맨 앞에 추가한다. 이때 unshift를 사용하면 배열의 맨 앞에 추가할 수 있다.
      products.unshift(product);

      // (e). 10개 이상의 상품이 있다면 마지막 상품을 삭제한다. 이때, pop을 사용하면 배열의 맨 뒤에 있는 요소를 삭제할 수 있다.
      if (products.length > 10) products.pop();

      // (f). zustand의 setState 함수를 호출해 상태를 업데이트한다.
      browsingHistoryStore.setState({ products });
    },

    // (B). 모든 상품을 삭제하는(초기화) 함수를 정의한다.
    clear: () => {
      browsingHistoryStore.setState({ products: [] });
    },
  };
}
