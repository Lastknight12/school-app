import { redirect } from "next/navigation";
import Settings from "~/app/_components/(student)/settings";
import { getServerAuthSession } from "~/server/auth";

export default async function SettingsPage() {
    const session = await getServerAuthSession();

    if (!session) {
        return redirect("/login");
    }
    
    return (
        <Settings session={session} />       
    );
}