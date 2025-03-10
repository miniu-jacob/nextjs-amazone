// lib/actions/order.actions.ts
"use server";

import { Cart, IOrderList, OrderItem, ShippingAddress } from "@/types";
import { formatError, round2 } from "../utils";
import { TAX_PRICE } from "../constants";
import { connectToDatabase } from "../db";
import { auth } from "../auth";
import { OrderInputSchema } from "../validator";
import Order, { IOrder } from "../db/models/order.model";
import { paypal } from "../paypal";
import { sendAskReviewOrderItems, sendPurchaseReceipt } from "@/emails";
import { revalidatePath } from "next/cache";
import { DateRange } from "react-day-picker";
import Product from "../db/models/product.model";
import User from "../db/models/user.model";
import mongoose from "mongoose";
import { getSetting } from "./setting.actions";

type CalcDeliveryDateAndPriceProps = {
  items: OrderItem[];
  deliveryDateIndex?: number;
  shippingAddress?: ShippingAddress;
};

export const calcDeliveryDateAndPrice = async ({ items, shippingAddress, deliveryDateIndex }: CalcDeliveryDateAndPriceProps) => {
  const { availableDeliveryDates,  } = await getSetting();

  // 상품의 개별 가격(item.price) 과 수량 (item.quantity) 을 곱하여 총 가격을 계산한다.
  // lib/actions/order.actions.ts

  // 초기값은 0으로 설정하기 위해 reduce() 함수의 두 번째 인자로 0을 전달한다.
  const itemsPrice = round2(items.reduce((acc, item) => acc + item.price * item.quantity, 0));

  // 세금을 계산한다.
  // const taxPrice = round2(itemsPrice * TAX_PRICE); <-- 기존 코드
  const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * TAX_PRICE); // 배송 주소가 없으면 세금을 계산하지 않는다.

  // 사용 가능한 배송 날짜 계산
  const deliveryDate =
    availableDeliveryDates[
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1 // 기본값: 마지막 날짜
        : deliveryDateIndex // 사용자가 선택한 날짜 인덱스
    ];

  // 배송비를 계산한다.
  // const shippingPrice = itemsPrice > FREE_SHIPPING_MIN_PRICE ? 0 : 5; <-- 기존 코드
  const shippingPrice =
    !shippingAddress || !deliveryDate // 배송 주속나 배송 날짜가 없으면 배송비 무료 (undefined)
      ? undefined
      : deliveryDate.freeShippingMinPrice > 0 && itemsPrice >= deliveryDate.freeShippingMinPrice // 무료배송 최소금액 이상이면 배송비 무료
        ? 0
        : deliveryDate.shippingPrice; // 기본 배송비

  // 최종 금액 계산
  const totalPrice = round2(itemsPrice + (shippingPrice ? round2(shippingPrice) : 0) + (taxPrice ? round2(taxPrice) : 0));

  // 각 금액들을 리턴한다.
  // return { itemsPrice, shippingPrice, taxPrice, totalPrice };
  return {
    availableDeliveryDates, // 사용 가능한 배송 날짜 반환
    deliveryDateIndex:
      deliveryDateIndex === undefined // 선택된 배송 날짜 반환
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex, // 기본값: 마지막 날짜
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

// CREATE - 주문 생성
export const createOrder = async (clientSideCart: Cart) => {
  try {
    // (a). DB 에 연결한다.
    await connectToDatabase();

    // (b). 사용자 인증 정보를 확인한다.
    const session = await auth();
    if (!session) throw new Error("User not authenticated");

    // (c). 함수를 호출하여 서버에서 주문을 생성한다. - 서버에서 가격과 날짜를 다시 계산한다.
    const createOrder = await createOrderFromCart(
      clientSideCart, // 클라이언트에서 전달받은 카트 정보
      session.user.id!, // 사용자 ID
    );

    // (d). 응답과 메시지, 데이터를 반환한다.
    return {
      success: true,
      message: "Order placed successfully",
      data: { orderId: createOrder._id.toString() },
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const createOrderFromCart = async (clientSideCart: Cart, userId: string) => {
  // (a). 클라이언트 데이터를 기반으로 서버에서 가격 및 배송날짜를 재계산한다.
  const cart = {
    ...clientSideCart, // 클라이언트에서 전달받은 카트 정보를 복사한다.
    ...calcDeliveryDateAndPrice({
      items: clientSideCart.items, // 클라이언트에서 전달받은 아이템 정보
      shippingAddress: clientSideCart.shippingAddress, // 클라이언트에서 전달받은 배송 주소
      deliveryDateIndex: clientSideCart.deliveryDateIndex, // 클라이언트에서 전달받은 배송 날짜 인덱스
    }),
  };

  // 스키마의 parse() 함수를 사용하여 데이터를 검증한다.
  const order = OrderInputSchema.parse({
    user: userId, // 사용자 ID
    items: cart.items, // 주문 아이템
    shippingAddress: cart.shippingAddress, // 배송 주소
    paymentMethod: cart.paymentMethod, // 결제 수단
    itemsPrice: cart.itemsPrice, // 상품 가격
    shippingPrice: cart.shippingPrice, // 배송비
    taxPrice: cart.taxPrice, // 세금
    totalPrice: cart.totalPrice, // 총 가격
    expectedDeliveryDate: cart.expectedDeliveryDate, // 예상 배송 날짜
  });

  return await Order.create(order);
};

// 주문 ID를 통해 주문 정보를 가져오는 함수를 정의한다.
export async function getOrderById(orderId: string): Promise<IOrder> {
  // DB에 연결한다.
  await connectToDatabase();
  // 주문 ID를 통해 주문 정보를 찾는다.
  const order = await Order.findById(orderId);
  // 주문 정보를 JSON 형태로 반환한다.
  return JSON.parse(JSON.stringify(order));
}

export async function createPayPalOrder(orderId: string) {
  // a). DB에 연결한다.
  await connectToDatabase();

  // b). 주문 데이터를 조회한다. try-catch 블록을 사용하여 오류를 처리한다.
  try {
    const order = await Order.findById(orderId);
    if (order) {
      // c). PayPal 주문을 생성한다. 매개변수로 총 가격을 전달한다.
      const paypalOrder = await paypal.createOrder(order.totalPrice);

      // d). 결제 정보를 업데이트한다.
      order.paymentResult = {
        id: paypalOrder.id, // PayPal 주문 ID
        email_address: "", // 이메일 주소
        status: "", // 상태
        pricePaid: "0", // 지불한 가격
      };
      await order.save();

      // e). PayPal 주문 ID를 반환한다.
      return {
        success: true,
        message: "PayPal order created successfully",
        data: paypalOrder.id, // PayPal 주문 ID
      };
    } else {
      throw new Error("Order not found");
    }
  } catch (error) {
    // 오류가 발생하면 오류 메시지를 반환한다.
    return { success: false, message: formatError(error) };
  }
}

// 주문을 확정하는 함수를 정의한다.
export async function approvePayPalOrder(
  orderId: string, // 주문 ID
  data: { orderID: string }, // PayPal 결제 ID
) {
  // a). DB 에 연결
  await connectToDatabase();

  try {
    // b). 주문 정보를 조회한다. 주문은 populate() 함수를 사용하여 사용자 모델에서 이메일 주소를 가져온다.
    const order = await Order.findById(orderId).populate("user", "email");
    if (!order) throw new Error("Order not found");

    // c). PayPal 결제를 승인한다. 매개변수로 결제 ID를 전달한다.
    const captureData = await paypal.capturePayment(data.orderID);

    // d). 예외 처리
    if (!captureData || captureData.id !== order.paymentResult?.id || captureData.status !== "COMPLETED")
      throw new Error("Error in paypal payment");

    // e). 주문 데이터를 업데이트한다.
    order.isPaid = true; // 결제 완료
    order.paidAt = new Date(); // 결제 일자
    order.paymentResult = {
      id: captureData.id, // PayPal 주문 ID
      status: captureData.status, // 상태
      email_address: captureData.player.email_address, // 이메일 주소
      pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value, // 지불한 가격
    };

    // f). 저장
    await order.save();

    // g). 사용자의 이메일로 영수증을 전송한다.
    await sendPurchaseReceipt({ order });

    // h). 데이터 업데이트
    revalidatePath(`/account/orders/${orderId}`);
    return {
      success: true,
      message: "Your order has been successfully paid by PayPal",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// 사용자가 주문한 내역을 가져오는 함수를 정의한다.
export async function getMyOrders({ limit, page }: { limit?: number; page: number }) {
  const {
    common: { pageSize },
  } = await getSetting();
  // limit에 대한 기본값 설졍
  limit = limit || pageSize; // 기본값은 9로 설정하였다. (lib/constants.ts 참조)
  // DB에 연결하고 사용자를 인증한다.
  await connectToDatabase();

  const session = await auth();
  if (!session) throw new Error("User is not authenticated");

  // 페이징 처리를 위한 limit와 skip 값을 계산한다.
  const skipAmount = (Number(page) - 1) * limit; // limit가 undefined 일 수 있기 때문에 기본값을 위에 설정

  // 주문을 조회한다. 사용자 ID로 조회하고, 최신 주문이 먼저 나오도록 정렬한다.
  const orders = await Order.find({
    user: session?.user?.id, // 사용자 ID로 조회
  })
    .sort({ createdAt: "desc" }) // 최신 주문이 먼저 나오도록 정렬
    .skip(skipAmount) // skipAmount 만큼 건너뛴다.
    .limit(limit); // limit 만큼 조회한다.

  // 전체 주문 개수를 조회한다.
  const ordersCount = await Order.countDocuments({ user: session?.user?.id });

  // 주문 목록과 전체 주문 개수를 반환한다.
  return {
    data: JSON.parse(JSON.stringify(orders)), // 주문 목록
    totalPages: Math.ceil(ordersCount / limit), // 전체 페이지 수
  };
}

// 대시보드에서 사용하는 주문 통계 목록을 조회하는 함수 정의 - get orders by user
export async function getOrderSummary(date: DateRange) {
  const {
    common: { pageSize },
  } = await getSetting();
  // DB 연결
  await connectToDatabase();

  // 주어진 날짜 범위(date.from - date.to) 내의 주문 수 계산
  const ordersCount = await Order.countDocuments({
    createdAt: { $gte: date.from, $lte: date.to },
  });

  // 주어진 날짜 범위내에 등록된 상품 수 계산
  const productsCount = await Product.countDocuments({
    createdAt: { $gte: date.from, $lte: date.to },
  });

  // 해당 기간 동안 가입한 사용자 수 계산
  const usersCount = await User.countDocuments({
    createdAt: { $gte: date.from, $lte: date.to },
  });

  // 총 매출을 계산한다.
  const totalSalesResult = await Order.aggregate([
    // 특정 기간(WHERE) -> 즉 $match를 사용한다.
    { $match: { createdAt: { $gte: date.from, $lte: date.to } } },
    // 그룹화한다. -> $group을 사용한다.
    { $group: { _id: null, sales: { $sum: "$totalPrice" } } },
    // 원하는 필드만 선택한다. -> $project를 사용한다.
    // totalSales 값이 없는 경우에는 0으로 반환한다. -> $ifNull를 사용한다.
    // ifNull 연산자는 첫 번째 값이 null이면 두 번째 값으로 대체한다.
    { $project: { totalSales: { $ifNull: ["$sales", 0] } } },
  ]);

  // 최종 매출을 계산한다.
  const totalSales = totalSalesResult[0] ? totalSalesResult[0].totalSales : 0;

  // 최근 6개월 간 월별 매출(monthlySales) 계산
  const today = new Date();
  const sixMonthEarlierDate = new Date(
    today.getFullYear(),
    today.getMonth() - 5, // 6개월 전
    1, // 1일
  );

  // 월별 매출을 계산한다.
  const monthlySales = await Order.aggregate([
    { $match: { createdAt: { $gte: sixMonthEarlierDate } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, totalSales: { $sum: "$totalPrice" } } },
    // { $project: { _id: 0, label: "$_id", value:  "$totalSales" } }, <-- 기존 코드 > 소수점 2자리
    { $project: { _id: 0, label: "$_id", value: { $round: ["$totalSales", 2] } } },
    { $sort: { label: -1 } },
  ]);

  const topSalesCategories = await getTopSalesCategories(date);
  const topSalesProducts = await getTopSalesProducts(date);

  // 최신 주문 리스트를 가져온다.
  const latestOrders = await Order.find().populate("user", "name").sort({ createdAt: "desc" }).limit(pageSize);

  return {
    ordersCount, // 주문 수
    productsCount, // 상품 수
    usersCount, // 사용자 수
    totalSales, // 총 매출
    monthlySales: JSON.parse(JSON.stringify(monthlySales)), // 월별 매출
    salesChartData: JSON.parse(JSON.stringify(await getSalesChartData(date))), // 매출 차트 데이터
    topSalesCategories: JSON.parse(JSON.stringify(topSalesCategories)), // 최다 판매 카테고리
    topSalesProducts: JSON.parse(JSON.stringify(topSalesProducts)), // 최다 판매 상품
    latestOrders: JSON.parse(JSON.stringify(latestOrders)) as IOrderList, // 최신 주문 리스트
  };
}

// 특정 기간 동안의 일별 매출 데이터를 가져와서 날짜별로 정리하는 기능의 함수 > 주문 통계 목록에서 호출함
async function getSalesChartData(date: DateRange) {
  const result = await Order.aggregate([
    // 특정 기간 동안의 데이터만 필터링한다.
    { $match: { createdAt: { $gte: date.from, $lte: date.to } } },

    // 날짜별(year, month, day) 그룹화 및 매출 합산
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalSales: { $sum: "$totalPrice" },
      },
    },

    // 날짜를 YYYY/MM/DD 형식으로 변환한다.
    {
      $project: {
        _id: 0,
        date: {
          $concat: [{ $toString: "$_id.year" }, "/", { $toString: "$_id.month" }, "/", { $toString: "$_id.day" }],
        },
        totalSales: 1,
      },
    },
    // 오름차순 정렬
    { $sort: { date: 1 } },
  ]);

  return result;
}

// 최다 판매 상품 정의
async function getTopSalesProducts(date: DateRange) {
  const result = await Order.aggregate([
    { $match: { createdAt: { $gte: date.from, $lte: date.to } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: { name: "$items.name", image: "$items.image", _id: "$items.product" },
        totalSales: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 6 },
    {
      $project: { _id: 0, id: "$_id._id", label: "$_id.name", image: "$_id.image", value: "$totalSales" },
    },
  ]);
  return result;
}

// 최다 판매 카테고리
async function getTopSalesCategories(date: DateRange, limit = 5) {
  const result = await Order.aggregate([
    { $match: { createdAt: { $gte: date.from, $lte: date.to } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.category", totalSales: { $sum: "$items.quantity" } } },
    { $sort: { totalSales: -1 } },
    { $limit: limit },
  ]);
  return result;
}

// 대시보드에서 주문을 삭제하는 서버 액션을 정의한다.
export async function deleteOrder(id: string) {
  try {
    // DB에 연결하여 id를 전달해 주문을 삭제한다. (findByIdAndDelete)
    // await connectToDatabase();
    // const res = await Order.findByIdAndDelete(id);
    // if (!res) throw new Error("Order not found");

    /* (2502) 테스트를 위해 로그인 된 사용자의 정보를 가져와서 주문 사용자와 비교한다.  */
    const session = await auth();
    if (!session || !session.user) throw new Error("Unauthorized");
    await connectToDatabase();
    const order = await Order.findById(id);
    if (!order) throw new Error("Order not found");

    // 현재 로그인한 사용자의 ID와 주문을 생성한 사용자의 ID 비교
    if (order.user.toString() !== session.user.id) throw new Error("You are not authorized to delete this order");

    // 주문 삭제
    await Order.findByIdAndDelete(id);

    // 페이지 새로고침(/admin/orders)
    revalidatePath("/admin/orders");

    // 삭제 성공 시 응답 반환
    return {
      success: true,
      message: "Order deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// 대시보드에서 주문 관리를 위해 전체 주문을 가져오는 서버 액션을 정의한다.
export async function getAllOrders({ limit, page }: { limit?: number; page: number }) {
  const {
    common: { pageSize },
  } = await getSetting();
  // limit에 대한 기본값 설정
  limit = limit || pageSize;
  // DB에 연결한다.
  await connectToDatabase();

  // 페이지네이션을 위한 offset을 계산한다. (skipAmount)
  const skipAmount = (Number(page) - 1) * limit; // limit가 undefined 일 수 있기 때문에 기본값을 위에 설정

  // 주문 목록을 조회한다.
  const orders = await Order.find()
    .populate("user", "name") // 사용자 정보 user 필드를 name만 가져온다.
    .sort({ createdAt: "desc" }) // 최신 주문이 먼저 나오도록 내림차순 정렬
    .skip(skipAmount) // skipAmount 만큼 건너뛴다.
    .limit(limit); // limit 만큼 조회한다. (한 페이지에 표시할 주문 개수)

  // 총 주문 개수를 조회한다. (몇 개 중 몇 개인지 표시하기 위함)
  const ordersCount = await Order.countDocuments();

  // 데이터 반환
  return {
    data: JSON.parse(JSON.stringify(orders)) as IOrderList[], // 주문 목록을 JSON 형태로 반환
    totalPages: Math.ceil(ordersCount / limit), // 전체 페이지 수를 계산하여 반환
  };
}

// 대시보드에서 주문의 상태를 업데이트하는 서버 액션을 정의한다. (결제 완료)
export async function updateOrderToPaid(orderId: string) {
  try {
    // DB 연결 후 사용자의 이메일 주소 가져오기
    await connectToDatabase();
    const order = await Order.findById(orderId).populate<{
      user: { email: string; name: string };
    }>("user", "email name");
    // 주문이 없으면 에러를 반환한다.
    if (!order) throw new Error("Order not found");
    // 결제가 된 상태라면 에러를 반환한다.
    if (order.isPaid) throw new Error("Order is already paid");

    // 주문 업데이트

    order.isPaid = true; // 결제 완료
    order.paidAt = new Date(); // 결제 일자
    await order.save();

    // 재고 환경 체크 및 업데이트
    if (!process.env.MONGODB_URI?.startsWith("mongodb://localhost")) await updateProductStock(order._id);

    // 결제 완료 이메일 전송
    if (order.user.email) await sendPurchaseReceipt({ order });

    // 페이지 데이터 갱신
    revalidatePath(`/account/orders/${orderId}`);

    return { success: true, message: "Order paid successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// 주문 상태를 업데이트하는 함수(updateOrderToPaid)에서 호출하는 재고 업데이트 함수
const updateProductStock = async (orderId: string) => {
  // Mongoose에서 제공하는 startSession() 함수를 사용하여 세션을 시작한다.
  const session = await mongoose.connection.startSession();
  try {
    // 세션을 사용하여 트랜잭션을 시작한다.
    session.startTransaction();

    // opts 객체를 생성하여 세션을 전달한다. opts 객체에 session: { ... } 이 포함된다.
    const opts = { session };

    // 주문 정보를 업데이트한다.
    const order = await Order.findOneAndUpdate({ _id: orderId }, { isPaid: true, paidAt: new Date() }, opts);
    // const order = await Order.findOneAndUpdate({ _id: orderId }, { isPaid: false }, opts);
    if (!order) throw new Error("Order not found");

    // 주문에 포함된 상품을 순회하며 재고를 업데이트한다.
    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new Error("Product not found");

      product.countInStock -= item.quantity; // 상품 재고를 감소시킨다.
      await Product.updateOne({ _id: product._id }, { countInStock: product.countInStock }, opts); // 상품 정보를 업데이트한다.
    }

    // 세션을 커밋하고 종료한다.
    await session.commitTransaction();
    session.endSession();
    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// 배송 완료 상태로 업데이트하는 서버 액션을 정의한다.
export async function deliverOrder(orderId: string) {
  try {
    // DB에 연결하여 주문을 조회한다.
    await connectToDatabase();

    const order = await Order.findById(orderId).populate<{ user: { email: string; name: string } }>("user", "name email");
    if (!order) throw new Error("Order not found");
    if (!order.isPaid) throw new Error("Order is not paid");

    // 배송 상태 업데이트
    order.isDelivered = true; // 배송 완료
    order.deliveredAt = new Date(); // 배송 일자
    await order.save();

    // 이메일 전송 및 페이지 갱신
    if (order.user.email) await sendAskReviewOrderItems({ order });
    revalidatePath(`/account/orders/${orderId}`);
    return { success: true, message: "Order delivered successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
