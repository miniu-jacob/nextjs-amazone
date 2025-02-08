// emails/ask-review-order-items.tsx

import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Img,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { formatCurrency } from "@/lib/utils";
import { IOrder } from "@/lib/db/models/order.model";
import { SERVER_URL } from "@/lib/constants";

type OrderInformationProps = {
  order: IOrder;
};

// 테스트용으로 이메일 템플릿으로 확인할 수 있도록 만든 코드
AskReviewOrderItemsEmail.PreviewProps = {
  order: {
    _id: "123",
    isPaid: true,
    paidAt: new Date(),
    totalPrice: 100,
    itemsPrice: 100,
    taxPrice: 0,
    shippingPrice: 0,
    user: {
      name: "Jacob AC",
      email: "jacob@miniu.kr",
    },
    shippingAddress: {
      fullName: "Jacob AC",
      street: "123 Main St.",
      city: "Quan 2",
      postalCode: "700000",
      country: "Vietnam",
      phone: "123-456-789",
      province: "TP. Ho Chi Minh",
    },
    items: [
      {
        clientId: "1234",
        name: "Product 1",
        image: "https://nextjs-amazone-nine.vercel.app/_next/image?url=%2Fimages%2Fp46-1.jpg&w=1920&q=75",
        price: 100,
        quantity: 1,
        product: "1234567",
        slug: "product-1",
        category: "Category 1",
        countInStock: 10,
      },
    ],
    paymentMethod: "PayPal",
    expectedDeliveryDate: new Date(),
    isDelivered: true,
  } as IOrder,
} satisfies OrderInformationProps;

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default async function AskReviewOrderItemsEmail({ order }: OrderInformationProps) {
  return (
    <Html>
      {/* 이메일 미리보기에 표시될 간단한 내용(제목)  */}
      <Preview>Review Order Item</Preview>

      {/* Tailwind CSS 적용 */}
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          {/* 이메일 내용을 포함하는 중앙 정렬 컨테이너 */}
          <Container className="max-w-xl">
            <Heading>Review Order Items</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">Order ID</Text>
                  <Text className="mt-0 mr-4">{order._id.toString()}</Text>
                </Column>
                <Column>
                  <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">Purchased On</Text>
                  <Text className="mt-0 mr-4">{dateFormatter.format(order.createdAt)}</Text>
                </Column>
                <Column>
                  <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">Price Paid</Text>
                  <Text className="mt-0 mr-4">{formatCurrency(order.totalPrice)}</Text>
                </Column>
              </Row>
            </Section>
            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
              {order.items.map((item) => (
                <Row key={item.product} className="mt-8">
                  {/* 상품 이미지 표시 및 링크 제공 */}
                  <Column className="w-20">
                    <Link href={`${SERVER_URL}/product/${item.slug}`}>
                      <Img
                        width="80"
                        alt={item.name}
                        className="rounded mr-4"
                        src={item.image.startsWith("/") ? `${SERVER_URL}${item.image}` : item.image}
                      />
                    </Link>
                  </Column>
                  {/* 상품 이름과 갯수 */}
                  <Column className="align-top">
                    <Link href={`${SERVER_URL}/product/${item.slug}`}>
                      <Text className="mx-2 my-0">
                        {item.name} x {item.quantity}
                      </Text>
                    </Link>
                  </Column>
                  {/* 리뷰 버튼 */}
                  <Column align="right" className="align-top">
                    <Button
                      href={`${SERVER_URL}/product/${item.slug}#reviews`}
                      className="text-center bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">
                      Review this product
                    </Button>
                  </Column>
                </Row>
              ))}
              {[
                { name: "Items", price: order.itemsPrice },
                { name: "Tax", price: order.taxPrice },
                { name: "Shipping", price: order.shippingPrice },
                { name: "Total", price: order.totalPrice },
              ].map(({ name, price }) => (
                <Row key={name} className="py-1">
                  <Column align="right">{name}: </Column>
                  <Column align="right" width={70} className="align-top">
                    <Text className="m-0">{formatCurrency(price)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
