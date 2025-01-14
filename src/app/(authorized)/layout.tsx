import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function AuthorizedLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerAuthSession();

    if (!session?.user) {
        return redirect("/login");
    }
    
    return children;
}