"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandSeparator } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, Store as StoreIcon } from "lucide-react";
import { StoreListItem } from "./store.list.item";
import { useStoreModal } from "@/hooks/use-store-modal";
import { CreateNewStoreItem } from "./create-store-item";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { Store } from "@/types-db";

interface StoreSwitcherProps {
  items: Store[];
}

export const StoreSwitcher = ({ items }: StoreSwitcherProps) => {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const storeModal = useStoreModal();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allowedStores, setAllowedStores] = useState(1); // Default to 1
  const [userStores, setUserStores] = useState(0); // Default user stores count
  const [loading, setLoading] = useState(true);

  // Flag to disable upgrade functionality
  const isUpgradeDisabled = true; // Set this to `false` to re-enable upgrade

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userId = user.id; // Use Clerk's user ID
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAllowedStores(userData?.subscription?.allowedStores || 1);
          setUserStores(items.length);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, items]);

  const formattedStores = items.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const currentStore = formattedStores.find((store) => store.value === params.storeId);

  const filteredStores = searchTerm
    ? formattedStores.filter((store) =>
        store.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : formattedStores;

  const onStoreSelect = (store: { value: string; label: string }) => {
    setOpen(false);
    router.push(`/${store.value}`);
  };

  const handleUpgradeClick = () => {
    router.push("/upgrade");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <StoreIcon className="mr-2 h-4 w-4" />
          {currentStore?.label || "Select Store..."}
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <div className="px-2 py-1 flex items-center border rounded-md border-gray-100">
            <StoreIcon className="mr-2 h-4 w-4" />
            <CommandInput
              placeholder="Search Store"
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="flex-1"
            />
          </div>
          <CommandList>
            <CommandGroup heading="Stores">
              {filteredStores.length > 0 ? (
                filteredStores.map((store) => (
                  <StoreListItem
                    key={store.value}
                    store={store}
                    onSelect={onStoreSelect}
                    isChecked={currentStore?.value === store.value}
                  />
                ))
              ) : (
                <CommandEmpty>No Store Found</CommandEmpty>
              )}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              {userStores < allowedStores ? ( 
                <CreateNewStoreItem
                  onClick={() => {
                    setOpen(false);
                    storeModal.onOpen();
                  }}
                />
              ) : (
                // Conditionally render the upgrade button based on the flag
                !isUpgradeDisabled && (
                  <div className="p-4">
                    <Button variant="secondary" className="w-full" onClick={handleUpgradeClick}>
                      Upgrade
                    </Button>
                  </div>
                )
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};