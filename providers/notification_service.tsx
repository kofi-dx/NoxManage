import sgMail from "@sendgrid/mail";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Order, Withdraw } from "@/types-db";

// Configure SendGrid for emails
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

class NotificationService {
  // Send SMS using the API route
async sendSMS(phone: string, message: string) {
  try {
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, message }),
    });

    if (!response.ok) {
      throw new Error("Failed to send SMS");
    }

    console.log("SMS sent to:", phone);
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
}

// Send Email using the API route
async sendEmail(email: string, subject: string, body: string) {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, subject, body }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    console.log("Email sent to:", email);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

  // Fetch user details from Firebase
  async getUserById(userId: string) {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error(`User not found: ${userId}`);
      }

      const userData = userDoc.data();
      return {
        id: userDoc.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        email: userData.email,
      };
    } catch (error) {
      console.error("Failed to fetch user from Firebase:", error);
      throw error;
    }
  }

  // Notify User Approval
  async notifyUserApproval(userId: string) {
    const user = await this.getUserById(userId);
    const message = `Dear ${user.first_name}, your account has been approved. Welcome to our platform!`;
    await this.sendSMS(user.phone!, message);
    await this.sendEmail(user.email, "Account Approved", message);
  }

  // Notify Withdrawal Status
  async notifyWithdrawalStatus(withdraw: Withdraw) {
    const user = await this.getUserById(withdraw.userId);
    if (withdraw.status === "completed") {
      const message = `Dear ${user.first_name}, your withdrawal of $${withdraw.amount} was successful.`;
      await this.sendSMS(user.phone!, message);
      await this.sendEmail(user.email, "Withdrawal Successful", message);
    } else if (withdraw.status === "failed") {
      const message = `Dear ${user.first_name}, your withdrawal of $${withdraw.amount} failed. Reason: ${withdraw.reason}.`;
      await this.sendSMS(user.phone!, message);
      await this.sendEmail(user.email, "Withdrawal Failed", message);
    }
  }

  // Notify New Order
  async notifyNewOrder(order: Order) {
    try {
      const client = await this.getUserById(order.clientId);
      const clientMessage = `Dear ${client.first_name}, your order (ID: ${order.id}) has been placed successfully.`;
      await this.sendSMS(client.phone!, clientMessage);
      await this.sendEmail(client.email, "Order Placed Successfully", clientMessage);

      const storeOwner = await this.getUserById(order.storeOwnerId);
      const storeOwnerMessage = `Dear ${storeOwner.first_name}, a new order (ID: ${order.id}) has been placed in your store.`;
      await this.sendSMS(storeOwner.phone!, storeOwnerMessage);
      await this.sendEmail(storeOwner.email, "New Order Received", storeOwnerMessage);
    } catch (error) {
      console.error("Failed to notify new order:", error);
    }
  }

  // Notify Order Delivery Status
  async notifyOrderDeliveryStatus(order: Order) {
    try {
      const client = await this.getUserById(order.clientId);

      if (order.order_status === "Delivering") {
        const message = `Dear ${client.first_name}, your order (ID: ${order.id}) is out for delivery.`;
        await this.sendSMS(client.phone!, message);
        await this.sendEmail(client.email, "Order Out for Delivery", message);
      } else if (order.order_status === "Delivered") {
        const message = `Dear ${client.first_name}, your order (ID: ${order.id}) has been delivered.`;
        await this.sendSMS(client.phone!, message);
        await this.sendEmail(client.email, "Order Delivered", message);

        const storeOwner = await this.getUserById(order.storeOwnerId);
        const storeOwnerMessage = `Dear ${storeOwner.first_name}, the order (ID: ${order.id}) has been delivered to the customer.`;
        await this.sendSMS(storeOwner.phone!, storeOwnerMessage);
        await this.sendEmail(storeOwner.email, "Order Delivered", storeOwnerMessage);
      }
    } catch (error) {
      console.error("Failed to notify order delivery status:", error);
    }
  }

  async notifyOrderPending(order: Order) {
    try {
      // Notify the client (customer)
      const client = await this.getUserById(order.clientId);
      const clientMessage = `Dear ${client.first_name}, your order (ID: ${order.id}) is currently pending. We will notify you once it is processed.`;
      await this.sendSMS(client.phone!, clientMessage);
      await this.sendEmail(client.email, 'Order Pending', clientMessage);

      // Notify the store owner (optional)
      const storeOwner = await this.getUserById(order.storeOwnerId);
      const storeOwnerMessage = `Dear ${storeOwner.first_name}, the order (ID: ${order.id}) is currently pending.`;
      await this.sendSMS(storeOwner.phone!, storeOwnerMessage);
      await this.sendEmail(storeOwner.email, 'Order Pending', storeOwnerMessage);
    } catch (error) {
      console.error('Failed to notify order pending status:', error);
    }
  }

 // Notify Order Success
 async notifyOrderSuccess(clientId: string, storeOwnerId: string, orderId: string) {
  try {
    const client = await this.getUserById(clientId);
    const storeOwner = await this.getUserById(storeOwnerId);

    const clientMessage = `Dear ${client.first_name}, your order (ID: ${orderId}) has been placed successfully.`;
    const storeOwnerMessage = `Dear ${storeOwner.first_name}, a new order (ID: ${orderId}) has been placed in your store.`;

    await this.sendSMS(client.phone!, clientMessage);
    await this.sendEmail(client.email, 'Order Placed Successfully', clientMessage);

    await this.sendSMS(storeOwner.phone!, storeOwnerMessage);
    await this.sendEmail(storeOwner.email, 'New Order Received', storeOwnerMessage);
  } catch (error) {
    console.error('Failed to notify order success:', error);
  }
}

// Notify Order Failure
async notifyOrderFailure(clientId: string, storeOwnerId: string, orderId: string) {
  try {
    const client = await this.getUserById(clientId);
    const storeOwner = await this.getUserById(storeOwnerId);

    const failureMessage = `Dear ${client.first_name}, your order (ID: ${orderId}) payment failed. Please try again.`;
    const storeOwnerFailureMessage = `Dear ${storeOwner.first_name}, the order (ID: ${orderId}) payment failed.`;

    await this.sendSMS(client.phone!, failureMessage);
    await this.sendEmail(client.email, 'Order Payment Failed', failureMessage);

    await this.sendSMS(storeOwner.phone!, storeOwnerFailureMessage);
    await this.sendEmail(storeOwner.email, 'Order Payment Failed', storeOwnerFailureMessage);
  } catch (error) {
    console.error('Failed to notify order failure:', error);
  }
}

 // Notify Subscription Success
 async notifySubscriptionProductSuccess(storeOwnerId: string, planName: string) {
  try {
    const storeOwner = await this.getUserById(storeOwnerId);
    const successMessage = `Dear ${storeOwner.first_name}, your subscription to the ${planName} has been successfully processed.`;
    await this.sendSMS(storeOwner.phone!, successMessage);
    await this.sendEmail(storeOwner.email, 'Subscription Successful', successMessage);
  } catch (error) {
    console.error('Failed to notify subscription success:', error);
  }
}

// Notify Subscription Failure
async notifySubscriptionProductFailure(storeOwnerId: string) {
  try {
    const storeOwner = await this.getUserById(storeOwnerId);
    const failureMessage = `Dear ${storeOwner.first_name}, your subscription payment failed. Please try again.`;
    await this.sendSMS(storeOwner.phone!, failureMessage);
    await this.sendEmail(storeOwner.email, 'Subscription Payment Failed', failureMessage);
  } catch (error) {
    console.error('Failed to notify subscription failure:', error);
  }
}

 // Notify Subscription Success
 async notifySubscriptionStoreSuccess(userId: string, planName: string) {
  try {
    const user = await this.getUserById(userId);
    const successMessage = `Dear ${user.first_name}, your subscription to the ${planName} plan has been successfully processed.`;
    await this.sendSMS(user.phone!, successMessage);
    await this.sendEmail(user.email, 'Subscription Successful', successMessage);
  } catch (error) {
    console.error('Failed to notify subscription success:', error);
  }
}

// Notify Subscription Failure
async notifySubscriptionStoreFailure(userId: string) {
  try {
    const user = await this.getUserById(userId);
    const failureMessage = `Dear ${user.first_name}, your subscription payment failed. Please try again.`;
    await this.sendSMS(user.phone!, failureMessage);
    await this.sendEmail(user.email, 'Subscription Payment Failed', failureMessage);
  } catch (error) {
    console.error('Failed to notify subscription failure:', error);
  }
}

 // Notify Transaction Success
 async notifyTransactionSuccess(storeOwnerId: string, amount: number) {
  try {
    const storeOwner = await this.getUserById(storeOwnerId);
    const transactionDate = new Date().toLocaleString();
    const transactionMessage = `Dear ${storeOwner.first_name}, a transaction of $${amount.toFixed(2)} has been processed on ${transactionDate}.`;
    await this.sendSMS(storeOwner.phone!, transactionMessage);
    await this.sendEmail(storeOwner.email, 'Transaction Processed', transactionMessage);
  } catch (error) {
    console.error('Failed to notify transaction success:', error);
  }
}

}

const notificationService = new NotificationService();
export default notificationService;