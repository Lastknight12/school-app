"server only";

import { headers } from "next/headers";
import { type getKaznaAmountHandler } from "~/app/api/kazna/amount/route";

type Res = Awaited<ReturnType<typeof getKaznaAmountHandler>>;

export const getKaznaAmount = async (): Promise<Res> => {
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = host?.includes("localhost") ? "http://" : "https://";
  const clientCookie = headersList.get("Cookie");

  const response = await fetch(`${protocol}${host}/api/kazna/amount`, {
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
