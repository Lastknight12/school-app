"server only";

import { headers } from "next/headers";
import { type z } from "zod";
import {
  type getAdminDataHandler,
  type getAdminDataInput,
} from "~/app/api/klass/adminData/route";

type Res = Awaited<ReturnType<typeof getAdminDataHandler>>;

type Props = z.infer<typeof getAdminDataInput>;

export const getAdminData = async (body: Props): Promise<Res> => {
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = host?.includes("localhost") ? "http://" : "https://";
  const clientCookie = headersList.get("Cookie");

  const response = await fetch(`${protocol}${host}/api/klass/adminData`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Cookie: clientCookie ?? "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch /klass/adminData");
  }

  return await response.json();
};

export default getAdminData;
