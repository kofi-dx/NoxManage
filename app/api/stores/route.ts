
import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, updateDoc, serverTimestamp, arrayUnion, query, getDocs, getDoc, where } from "firebase/firestore";
import { NextResponse } from "next/server";

// POST handler for store creation
export const POST = async (req: Request) => {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, location, city, region, phone } = body;

    if (!name || !location || !city || !region || !phone) {
      return new NextResponse("All fields are required", { status: 400 });
    }

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      return new NextResponse("User not found", { status: 404 });
    }

    const userData = userDoc.data();
    const allowedStores = userData?.subscription?.allowedStores || 0;

    const storesRef = collection(db, "stores");
    const storesQuery = query(storesRef, where("userId", "==", userId));
    const storeSnapshots = await getDocs(storesQuery);
    const existingStoresCount = storeSnapshots.size;

    // Check if the user has reached the store limit, only if they have existing stores
    if (existingStoresCount > 0) {
      if (existingStoresCount >= allowedStores) {
        const existingStoreDoc = storeSnapshots.docs[0]; // Get the first store
        const existingStoreId = existingStoreDoc.id;

        console.log("User has reached store limit. Redirecting to existing store:", existingStoreId);
        return new NextResponse(
          JSON.stringify({
            redirect: `/${existingStoreId}`,
            message: `You cannot add more than ${allowedStores} stores unless you upgrade your subscription.`,
          }),
          { status: 403 }
        );
      }
    }

    // Prepare the new store data with allowed product limit (20 products)
    const storeData = {
      name,
      userId,
      location,
      city,
      region,
      phone,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      productRefs: [], // Initially empty product list
      categoryRefs: [], // You can update this field later
      subscription: {
        isActive: false,
        allowedProduct: 15,
        planId: "",
        price: 0,
      },
      amount: 0,
    };

    // Add the store to the "stores" collection
    const storeRef = await addDoc(collection(db, "stores"), storeData);
    console.log("Store added with ID:", storeRef.id);

    // Update the store with its unique ID
    const id = storeRef.id;
    await updateDoc(doc(db, "stores", id), { id, updatedAt: serverTimestamp() });

    // After store creation, update the user's storeRef with the new store's ID
    await updateDoc(userRef, {
      storeRef: arrayUnion({ id, name }),
    });

    console.log("Store created and user updated with new storeRef");

    return NextResponse.json({ id, name });
  } catch (error) {
    console.error("STORES_POST Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

// GET handler for fetching stores
export const GET = async () => {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const storesRef = collection(db, "stores");
    const storesQuery = query(storesRef, where("userId", "==", userId));
    const storeSnapshots = await getDocs(storesQuery);

    if (storeSnapshots.empty) {
      return new NextResponse("No stores found", { status: 404 });
    }

    const storesWithDetails = await Promise.all(
      storeSnapshots.docs.map(async (storeDoc) => {
        const storeData = storeDoc.data();
        const productsRef = collection(db, "stores", storeDoc.id, "products");
        const productsSnap = await getDocs(productsRef);
        const products = productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const categoriesRef = collection(db, "stores", storeDoc.id, "categories");
        const categoriesSnap = await getDocs(categoriesRef);
        const categories = categoriesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const sizesRef = collection(db, "stores", storeDoc.id, "sizes");
        const sizesSnap = await getDocs(sizesRef);
        const sizes = sizesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        return {
          id: storeDoc.id,
          ...storeData,
          products,
          categories,
          sizes,
        };
      })
    );

    return NextResponse.json(storesWithDetails);
  } catch (error) {
    console.error("GET_STORES Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
