"server only";

import { headers } from "next/headers";
import { type getAmountHandler } from "~/app/api/kazna/amount/route";

type Res = Awaited<ReturnType<typeof getAmountHandler>>;

export const getKaznaAmount = async (): Promise<Res> => {
  const headersList = headers();
  const host = headersList.get("host");
  const clientCookie = headersList.get("Cookie");

  const response = await fetch(`http://${host}/api/kazna/amount`, {
    method: "GET",
    headers: {
      Cookie: clientCookie ?? "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch kazna/amount");
  }

  return await response.json();
};

export default getKaznaAmount;
