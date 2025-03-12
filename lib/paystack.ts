import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

interface Transfer {
  amount: number;
  momoNumber: string;
  momoProvider: string;
  reason: string;
  firstName: string;
  lastName: string;
  userId: string;
  storeId: string;
  tax: number; // Add the `tax` property
}
interface TransferRequest extends express.Request {
  body: {
    amount: number;
    momoNumber: string;
    momoProvider: string;
    reason: string;
    firstName: string;
    lastName: string;
    userId: string;
    storeId: string;
  };
}


const PAYSTACK_BASE_URL = "https://api.paystack.co";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not defined");
}

const paystackHeaders = {
  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
};

// Middleware to validate withdrawal requests
function validateWithdrawalRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const { amount, momoNumber, momoProvider, reason } = req.body;

  if (!amount || amount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }
  if (!/^\d{10}$/.test(momoNumber)) {
    res.status(400).json({ error: "MoMo number must be exactly 10 digits" });
    return;
  }
  if (!momoProvider) {
    res.status(400).json({ error: "MoMo provider is required" });
    return;
  }
  if (!reason) {
    res.status(400).json({ error: "Reason for transfer is required" });
    return;
  }

  next();
}

// Utility to handle Axios errors
function handleAxiosError(error: unknown): { message: string; data?: unknown } {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || "Axios error occurred",
      data: error.response?.data,
    };
  } else if (error instanceof Error) {
    return { message: error.message };
  } else {
    return { message: "An unknown error occurred" };
  }
}

// Create recipient and initiate batch transfers
export async function createRecipientAndTransferBatch(transfers: Transfer[]) {
  try {
    const responses = await Promise.all(
      transfers.map(async (transfer) => {
        // Create transfer recipient
        const recipientResponse = await axios.post(
          `${PAYSTACK_BASE_URL}/transferrecipient`,
          {
            type: "mobile_money",
            name: `${transfer.firstName} ${transfer.lastName}`,
            account_number: transfer.momoNumber,
            bank_code: transfer.momoProvider,
            currency: "GHS",
            metadata: {
              userId: transfer.userId,
              storeId: transfer.storeId,
              momoProvider: transfer.momoProvider,
              momoNumber: transfer.momoNumber,
              firstName: transfer.firstName,
              lastName: transfer.lastName,
              tax: transfer.tax, // Include tax in metadata
            },
          },
          { headers: paystackHeaders }
        );

        const recipientCode = recipientResponse.data.data.recipient_code;

        // Initiate transfer with metadata
        const transferResponse = await axios.post(
          `${PAYSTACK_BASE_URL}/transfer`,
          {
            source: "balance",
            amount: transfer.amount,
            recipient: recipientCode,
            reason: transfer.reason,
            metadata: {
              userId: transfer.userId,
              storeId: transfer.storeId,
              momoProvider: transfer.momoProvider,
              momoNumber: transfer.momoNumber,
              firstName: transfer.firstName,
              lastName: transfer.lastName,
              tax: transfer.tax, // Include tax in metadata
            },
          },
          { headers: paystackHeaders }
        );

        return transferResponse.data;
      })
    );

    return responses;
  } catch (error) {
    throw handleAxiosError(error);
  }
}

// Route to initiate a transfer
app.post("/initiate-transfer", validateWithdrawalRequest, async (req: TransferRequest, res: express.Response): Promise<void> => {
  try {
    const { amount, momoNumber, momoProvider, reason, firstName, lastName, userId, storeId } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !userId || !storeId) {
      res.status(400).json({ error: "Missing required fields (firstName, lastName, userId, storeId)" });
    }

    // Calculate tax (6%)
    const tax = amount * 0.06;

    // Convert amount to kobo (Paystack uses kobo for transactions)
    const amountInKobo = Math.round(amount * 100);

    // Prepare transfers array with all required fields
    const transfers = [
      {
        amount: amountInKobo,
        momoNumber,
        momoProvider,
        reason,
        firstName,
        lastName,
        userId,
        storeId,
        tax, // Include the tax property
      },
    ];

    // Initiate transfer
    const transferResults = await createRecipientAndTransferBatch(transfers);

    res.status(200).json({ message: "Transfer initiated", data: transferResults });
  } catch (error) {
    const { message } = handleAxiosError(error);
    res.status(400).json({ error: message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});