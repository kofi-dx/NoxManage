import { Navbar } from "@/components/navbar";
import { db } from "@/lib/firebase";
import { Store } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { redirect } from "next/navigation";

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: { storeId: string };
}

const DashboardLayout = async ({ children, params }: DashboardLayoutProps) => {
    const { userId } = await auth();

    // Check if the user is authenticated
    if (!userId) {
        redirect("/sign-in");
    }

    // Ensure params are awaited before using
    const { storeId } = await params;
    
    // Fetch the store data
    const storeSnap = await getDocs(
        query(
            collection(db, "stores"),
            where("userId", "==", userId),
            where("id", "==", storeId)
        )
    );

    // Map the store data and ensure JSON-serializable values
    const store = storeSnap.docs.map((doc) => {
        const data = doc.data();
        return {
            ...data,
        } as Store;
    })[0]; // Expect only one result

    
    if (!store) {
        redirect("/sign-in");
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    );
};

export default DashboardLayout;
