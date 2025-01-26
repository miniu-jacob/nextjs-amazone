// lib/paypal.ts

// const base = process.env.PAYPAL_API_URL || "https://api.sandbox.paypal.com";
const base = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

// 1). Paypal API와 상호작용하는 paypal 객체를 생성한다.
export const paypal = {
  createOrder: async function createOrder(price: number) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE", //
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: price,
            },
          },
        ],
      }),
    });
    // 응답을 반환한다.
    return handleResponse(response);
  },
  // 주문을 캡쳐하는 함수
  capturePayment: async function capturePayment(orderId: string) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 응답을 반환한다.
    return handleResponse(response);
  },
};

// 2). Paypal API에 접근하기 위한 토큰을 생성한다.
async function generateAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET).toString("base64");

  // access token을 요청한다.
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`, // 위에서 Base64로 변환한 인증 정보를 사용한다는 의미이다.
    },
  });

  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}

// 3). 응답을 처리하는 함수를 정의한다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleResponse(response: any) {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  // 응답 본문을 텍스트로 변환한다.
  const errorMessage = await response.text();

  // 에러를 발생시킨다.
  throw new Error(errorMessage);
}
