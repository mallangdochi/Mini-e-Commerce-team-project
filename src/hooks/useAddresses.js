import { useCallback, useEffect, useState } from 'react';

import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from '@/api/addresses';

const normalizeAddress = (item) => ({
  ...item,
  id: item?.addressId ?? item?.id,
  addressId: item?.addressId ?? item?.id,
  label: item?.addressName ?? item?.label ?? '배송지',
  addressName: item?.addressName ?? item?.label ?? '배송지',
  isDefault: Boolean(item?.isDefault),
});

const extractAddresses = (response) => {
  const data = response?.data ?? response ?? [];
  const list = Array.isArray(data) ? data : data?.addresses;
  return (Array.isArray(list) ? list : []).map(normalizeAddress);
};

function useAddresses({ autoLoad = true } = {}) {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await getAddresses();
      const items = extractAddresses(response);
      setAddresses(items);
      return items;
    } catch (error) {
      setErrorMessage(error.message || '배송지를 불러오지 못했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoLoad) return undefined;

    const timer = window.setTimeout(() => {
      void loadAddresses().catch(() => {});
    }, 0);

    return () => window.clearTimeout(timer);
  }, [autoLoad, loadAddresses]);

  const saveAddress = useCallback(
    async ({ addressId, ...form }) => {
      const payload = {
        addressName: String(form.label ?? form.addressName ?? '배송지').trim() || '배송지',
        receiverName: String(form.receiverName ?? '').trim(),
        phone: String(form.phone ?? '').replace(/[^\d]/g, ''),
        postcode: String(form.postcode ?? '').trim(),
        address: String(form.address ?? '').trim(),
        detailAddress: String(form.detailAddress ?? '').trim(),
      };

      if (addressId) {
        await updateAddress(addressId, payload);
        if (form.isDefault) {
          await setDefaultAddress(addressId);
        }
      } else {
        await createAddress({ ...payload, isDefault: Boolean(form.isDefault) });
      }

      return loadAddresses();
    },
    [loadAddresses]
  );

  const removeAddress = useCallback(
    async (addressId) => {
      await deleteAddress(addressId);
      return loadAddresses();
    },
    [loadAddresses]
  );

  const makeDefault = useCallback(
    async (addressId) => {
      await setDefaultAddress(addressId);
      return loadAddresses();
    },
    [loadAddresses]
  );

  return {
    addresses,
    isLoading,
    errorMessage,
    loadAddresses,
    saveAddress,
    removeAddress,
    makeDefault,
  };
}

export default useAddresses;
