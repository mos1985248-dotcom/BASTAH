// hooks/useAddressBook.ts
"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { Address } from "@/components/shared/address-types";

export function useAddressBook(enabled: boolean) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ name: "", phone: "", city: "", region: "", address: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return;
    api
      .get<{ addresses: Address[] }>("/api/addresses")
      .then(({ addresses }) => {
        setAddresses(addresses);
        const def = addresses.find((a) => a.isDefault) ?? addresses[0];
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const handleAddAddress = async () => {
    try {
      const { address } = await api.post<{ address: Address }>("/api/addresses", { ...addrForm, isDefault: addresses.length === 0 });
      setAddresses((p) => [address, ...p]);
      setSelectedAddressId(address.id);
      setShowAddressForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر حفظ العنوان");
    }
  };

  return {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    showAddressForm,
    setShowAddressForm,
    addrForm,
    setAddrForm,
    handleAddAddress,
    error,
  };
}
