import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { doc, getDoc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { Order } from "@/types-db";
import notificationService from "@/providers/notification_service"; // Import the notification service

export type paramsType = Promise<{ storeId: string; orderId: string }>;

export const PATCH = async (req: Request, { params }: { params: paramsType}) => {
  try {
    console.log("PATCH Params:", params); // Debugging
    const { storeId, orderId } = await params;

    if (!storeId || !orderId) {
      return new NextResponse("StoreId or OrderId is missing", { status: 400 });
    }

    const authResult = await auth();
    const userId = authResult?.userId;
    console.log("User ID:", userId); // Debugging

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("PATCH Request Body:", body); // Debugging

    const { order_status } = body;
    if (!order_status) {
      return new NextResponse("Order Status is required", { status: 400 });
    }

    const store = await getDoc(doc(db, "stores", storeId));
    if (!store.exists() || store.data()?.userId !== userId) {
      return new NextResponse("Unauthorized Access", { status: 403 });
    }

    const orderRef = doc(db, "stores", storeId, "orders", orderId);
    const orderSnapshot = await getDoc(orderRef);

    if (!orderSnapshot.exists()) {
      return new NextResponse("Order Not Found", { status: 404 });
    }

    const orderData = orderSnapshot.data() as Order;
    const clientId = orderData.clientId;

    if (!clientId) {
      return new NextResponse("Client ID is missing from the order", { status: 400 });
    }

    // Update the order in the store
    await updateDoc(orderRef, {
      order_status,
      updatedAt: serverTimestamp(),
    });

    // Update the order in the client's collection
    const clientOrderRef = doc(db, "clients", clientId, "orders", orderId);
    await updateDoc(clientOrderRef, {
      order_status,
      updatedAt: serverTimestamp(),
    });

    // Fetch the updated order data
    const updatedOrder = (await getDoc(orderRef)).data() as Order;

    // Send notifications based on the order status
    if (order_status === "Delivering") {
      await notificationService.notifyOrderDeliveryStatus(updatedOrder);
    } else if (order_status === "Delivered") {
      await notificationService.notifyOrderDeliveryStatus(updatedOrder);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("PATCH Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

  export const DELETE = async (req: Request, { params }: { params: paramsType }) => {
    try {
      console.log("DELETE Params:", params); // Debugging
      const { storeId, orderId } = await params;
  
      if (!storeId || !orderId) {
        return new NextResponse("StoreId or OrderId is missing", { status: 400 });
      }
  
      const authResult = await auth();
      const userId = authResult?.userId;
      console.log("User ID:", userId); // Debugging
  
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const store = await getDoc(doc(db, "stores", storeId));
      if (!store.exists() || store.data()?.userId !== userId) {
        return new NextResponse("Unauthorized Access", { status: 403 });
      }
  
      const orderRef = doc(db, "stores", storeId, "orders", orderId);
      const orderSnapshot = await getDoc(orderRef);
  
      if (!orderSnapshot.exists()) {
        return new NextResponse("Order Not Found", { status: 404 });
      }
  
      // Fetch the client ID from the order before deleting
      const orderData = orderSnapshot.data();
      const clientId = orderData?.clientId; // Assuming clientId is stored in the order
  
      // Delete order from store
      await deleteDoc(orderRef);
  
      // Delete order from client's order collection if clientId exists
      if (clientId) {
        const clientOrderRef = doc(db, "clients", clientId, "orders", orderId);
        await deleteDoc(clientOrderRef);
        console.log(`Deleted order ${orderId} from client ${clientId}`);
      }
  
      return NextResponse.json({ msg: "Order Deleted from store and client records" });
    } catch (error) {
      console.error("DELETE Error:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  };
  