import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";

const MAX_TRANSFER_AMOUNT = 2000; // Maximum withdrawal limit in GHS

interface WithdrawFormProps {
  paymentId: string;
  amount: number;
  onClose: () => void;
}

export const WithdrawForm: React.FC<WithdrawFormProps> = ({
  paymentId,
  amount,
  onClose,
}) => {
  const [momoProvider, setMomoProvider] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState<string | number>("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<{ firstName: string; lastName: string } | null>(null);
  const [withdrawalStatus, setWithdrawalStatus] = useState<string | null>(null);
  const [transferTime, setTransferTime] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  // Fetch user data (first_name and last_name) from the API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUserName({ firstName: data.firstName, lastName: data.lastName });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data");
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async () => {
    const withdrawAmountNum = parseFloat(withdrawAmount.toString());
  
    // Validate inputs
    if (!momoProvider || !momoNumber) {
      toast.error("Please fill in all fields.");
      return;
    }
  
    if (!/^\d{10}$/.test(momoNumber)) {
      toast.error("MoMo number must be exactly 10 digits.");
      return;
    }
  
    if (isNaN(withdrawAmountNum) || withdrawAmountNum <= 0 || withdrawAmountNum > amount) {
      toast.error(`You can only withdraw between GHS 0 and GHS ${amount}.`);
      return;
    }
  
    if (withdrawAmountNum > MAX_TRANSFER_AMOUNT) {
      toast.error(`Maximum withdrawal limit is GHS ${MAX_TRANSFER_AMOUNT}.`);
      return;
    }
  
    setLoading(true);
    setWithdrawalStatus("Initializing Withdrawal...");
    setTransferTime("Please allow up to 20 minutes for the funds to appear in your account.");
  
    try {
      const storeId = params.storeId;
  
      if (!userName) throw new Error("User data not found.");
  
      // Check withdrawal limit
      const limitCheckResponse = await fetch(`/api/${storeId}/withdrawCheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
  
      const limitCheckData = await limitCheckResponse.json();
  
      if (limitCheckData.limitReached) {
        toast.error("You have reached your daily withdrawal limit. You can withdraw again after 24 hours.");
        return;
      }
  
      // Proceed with the withdrawal
      const response = await fetch(`/api/${storeId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          amount: withdrawAmountNum,
          paymentMethod: "momo",
          momoProvider,
          momoNumber,
          firstName: userName.firstName,
          lastName: userName.lastName,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to process withdrawal");
      }
  
      // Simulate webhook success
      setTimeout(() => {
        setWithdrawalStatus("Money transferred successfully! 💸");
        setTransferTime("You will see the money in your account shortly.");
        onClose();
        toast.success("Money withdrawn successfully! 💸");
        router.push(`/${storeId}/payment`);
      }, 5000);
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast.error("Error processing withdrawal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Amount Available: <strong>GHS {amount.toFixed(2)}</strong>
          </p>
          <p>You can only withdraw up to GHS {MAX_TRANSFER_AMOUNT} in a single transaction.</p>
          <Input
            placeholder="Enter withdrawal amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            type="number"
            min="1"
            max={MAX_TRANSFER_AMOUNT}
            disabled={loading}
          />
          <div className="space-y-2">
            <Select onValueChange={setMomoProvider} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select MoMo Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                <SelectItem value="Vodafone">Vodafone Cash</SelectItem>
                <SelectItem value="AirtelTigo">AirtelTigo Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="MoMo Number (10 digits)"
            value={momoNumber}
            onChange={(e) => setMomoNumber(e.target.value)}
            type="text"
            maxLength={10}
            disabled={loading}
          />
          <p className="text-sm text-gray-700">
            <span className="text-gray-800">NOTE:</span> Withdrawals are processed for the current store only.
          </p>

          {withdrawalStatus && (
            <p className="mt-4 text-lg font-semibold">{withdrawalStatus}</p>
          )}
          {transferTime && (
            <p className="text-sm text-gray-600">{transferTime}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};