import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { doc, getDoc } from "firebase/firestore";
import { redirect } from "next/navigation";

interface SetupLayoutProps {
  children: React.ReactNode;
}

const SetupLayout = async ({ children }: SetupLayoutProps) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const userDocRef = doc(db, "users", userId);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();

    if (!userData.phone) {
      redirect("/enter-phone");
    }

    if (userData.status === "pending") {
      redirect("/pending?status=pending");
    } else if (userData.status !== "approved") {
      redirect("/pending?status=rejected");
    }
  }

  return <div>{children}</div>;
};

export default SetupLayout;

