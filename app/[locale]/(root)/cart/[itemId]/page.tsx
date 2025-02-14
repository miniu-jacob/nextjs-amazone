// app/[locale]/(root)/cart/[itemId]/page.tsx

import CartAddItem from "./cart-add-item";

// Props는 Promise로 전달되며, itemId를 가져온다.
export default async function CartAddItemPage(props: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await props.params;

  return <CartAddItem itemId={itemId} />;
}
