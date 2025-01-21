// app/checkout/page.tsx

import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import CheckoutForm from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }
  // return <div>Checkout Form</div>;
  return <CheckoutForm />;
  // return <AnotherCheckoutForm />;
}
