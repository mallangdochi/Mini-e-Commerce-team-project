import { useRef, useState } from 'react';

import ConfirmModal from '@/components/common/ConfirmModal';
import EmptyState from '@/components/common/EmptyState';
import useAddresses from '@/hooks/useAddresses';
import useAuthStore from '@/store/authStore';
import '@/styles/mypage.css';

const EMPTY_ADDRESS_FORM = {
  label: '',
  receiverName: '',
  phone: '',
  postcode: '',
  address: '',
  detailAddress: '',
  isDefault: false,
};

function formatPhoneNumber(value) {
  const numbers = String(value ?? '')
    .replace(/[^\d]/g, '')
    .slice(0, 11);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
}

function loadPostcodeScript() {
  return new Promise((resolve, reject) => {
    if (window.kakao?.Postcode || window.daum?.Postcode) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[data-postcode-api="true"]');

    if (existingScript) {
      if (window.kakao?.Postcode || window.daum?.Postcode) {
        resolve();
        return;
      }

      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    const timer = window.setTimeout(() => {
      reject(new Error('주소 검색 연결 시간이 초과되었습니다.'));
    }, 15000);

    script.src = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.dataset.postcodeApi = 'true';
    script.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error('주소 검색 서비스를 불러오지 못했습니다.'));
    };

    document.head.appendChild(script);
  });
}

function AddressManagementPage() {
  const user = useAuthStore((state) => state.user);
  const postcodeDialogRef = useRef(null);
  const postcodeContainerRef = useRef(null);

  const [addressLoading, setAddressLoading] = useState(false);
  const { addresses, saveAddress, removeAddress, makeDefault } = useAddresses();
  const [isAddressEditorOpen, setIsAddressEditorOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [deleteAddressId, setDeleteAddressId] = useState(null);

  const handleAddressInputChange = (event) => {
    const { name, value, checked, type } = event.target;

    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'phone' ? formatPhoneNumber(value) : value,
    }));
  };

  const handlePostcodeSearch = async () => {
    if (addressLoading) return;

    setAddressLoading(true);

    try {
      await loadPostcodeScript();

      const Postcode = window.kakao?.Postcode || window.daum?.Postcode;

      if (!Postcode) {
        throw new Error('주소 검색 서비스를 불러오지 못했습니다.');
      }

      postcodeContainerRef.current?.replaceChildren();
      postcodeDialogRef.current?.showModal();

      new Postcode({
        width: '100%',
        height: '100%',
        oncomplete: (data) => {
          setAddressForm((prev) => ({
            ...prev,
            postcode: data.zonecode,
            address: data.address,
            detailAddress: '',
          }));

          postcodeDialogRef.current?.close();

          window.requestAnimationFrame(() => {
            document.getElementById('mypageDetailAddress')?.focus();
          });
        },
      }).embed(postcodeContainerRef.current);
    } catch (error) {
      postcodeDialogRef.current?.close();
      alert(`${error.message} 일반 브라우저에서 다시 시도해주세요.`);
    } finally {
      setAddressLoading(false);
    }
  };

  const openNewAddressEditor = () => {
    setEditingAddressId(null);
    setAddressForm({
      ...EMPTY_ADDRESS_FORM,
      receiverName: user?.name ?? '',
      phone: formatPhoneNumber(user?.phone ?? user?.phoneNumber ?? user?.mobile ?? ''),
      isDefault: addresses.length === 0,
    });
    setIsAddressEditorOpen(true);
  };

  const openEditAddressEditor = (addressItem) => {
    setEditingAddressId(addressItem.addressId ?? addressItem.id);
    setAddressForm({
      label: addressItem.label ?? '',
      receiverName: addressItem.receiverName ?? '',
      phone: formatPhoneNumber(addressItem.phone ?? ''),
      postcode: addressItem.postcode ?? '',
      address: addressItem.address ?? '',
      detailAddress: addressItem.detailAddress ?? '',
      isDefault: Boolean(addressItem.isDefault),
    });
    setIsAddressEditorOpen(true);
  };

  const closeAddressEditor = () => {
    setIsAddressEditorOpen(false);
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
  };

  const handleAddressSave = async () => {
    if (
      !addressForm.receiverName.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.postcode.trim() ||
      !addressForm.address.trim()
    ) {
      alert('받는 사람, 연락처, 우편번호, 주소를 입력해주세요.');
      return;
    }

    try {
      await saveAddress({
        addressId: editingAddressId,
        ...addressForm,
        phone: addressForm.phone.replace(/[^\d]/g, ''),
        label: addressForm.label.trim() || '배송지',
      });

      closeAddressEditor();
    } catch (error) {
      alert(error.message || '배송지를 저장하지 못했습니다.');
    }
  };

  const closeAddressDeletePanel = () => {
    setDeleteAddressId(null);
  };

  const confirmAddressDelete = async () => {
    if (!deleteAddressId) return;

    try {
      await removeAddress(deleteAddressId);
      setDeleteAddressId(null);
    } catch (error) {
      alert(error.message || '배송지를 삭제하지 못했습니다.');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await makeDefault(addressId);
    } catch (error) {
      alert(error.message || '기본 배송지를 변경하지 못했습니다.');
    }
  };

  const deleteTargetAddress = deleteAddressId
    ? addresses.find((item) => String(item.addressId ?? item.id) === String(deleteAddressId))
    : null;

  return (
    <>
      <section className="mypage-content">
        <header className="mypage-heading mypage-profile-heading">
          <h1>배송지 관리</h1>
          <p>자주 사용하는 배송지를 등록하고 기본 배송지를 설정할 수 있습니다.</p>
        </header>

        <section className="mypage-edit-section mypage-address-management">
          <div className="mypage-address-title-row">
            <div>
              <h2>등록된 배송지 {addresses.length}개</h2>
              <p>배송지를 추가하거나 기존 배송지를 수정할 수 있습니다.</p>
            </div>

            <button type="button" className="mypage-solid-button" onClick={openNewAddressEditor}>
              새 배송지 추가
            </button>
          </div>

          {addresses.length === 0 ? (
            <EmptyState
              className="mypage-address-empty"
              message="등록된 배송지가 없습니다. 새 배송지를 추가해주세요."
            />
          ) : (
            <div className="mypage-address-list">
              {addresses.map((addressItem) => (
                <article
                  className="mypage-address-card"
                  key={addressItem.addressId ?? addressItem.id}
                >
                  <div className="mypage-address-card-title">
                    <div>
                      <h3>{addressItem.label || '배송지'}</h3>
                      {addressItem.isDefault && <span>기본 배송지</span>}
                    </div>
                  </div>

                  <div className="mypage-address-card-grid">
                    <div>
                      <span>받는 사람</span>
                      <strong>{addressItem.receiverName || '-'}</strong>
                    </div>

                    <div>
                      <span>연락처</span>
                      <strong>{addressItem.phone || '-'}</strong>
                    </div>

                    <div>
                      <span>우편번호</span>
                      <strong>{addressItem.postcode || '-'}</strong>
                    </div>

                    <div>
                      <span>주소</span>
                      <strong>{addressItem.address || '-'}</strong>
                    </div>

                    <div>
                      <span>상세주소</span>
                      <strong>{addressItem.detailAddress || '-'}</strong>
                    </div>
                  </div>

                  <div className="mypage-address-card-actions">
                    {!addressItem.isDefault && (
                      <button
                        type="button"
                        className="is-primary"
                        onClick={() =>
                          handleSetDefaultAddress(addressItem.addressId ?? addressItem.id)
                        }
                      >
                        기본으로 설정
                      </button>
                    )}

                    <button type="button" onClick={() => openEditAddressEditor(addressItem)}>
                      수정
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteAddressId(addressItem.addressId ?? addressItem.id)}
                    >
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <dialog
        ref={postcodeDialogRef}
        className="mypage-postcode-dialog"
        aria-labelledby="mypagePostcodeDialogTitle"
      >
        <div className="mypage-postcode-dialog-header">
          <h2 id="mypagePostcodeDialogTitle">우편번호 찾기</h2>

          <button
            type="button"
            aria-label="주소 검색 닫기"
            onClick={() => postcodeDialogRef.current?.close()}
          >
            ×
          </button>
        </div>

        <div ref={postcodeContainerRef} className="mypage-postcode-embed" />
      </dialog>

      {isAddressEditorOpen && (
        <div className="mypage-address-modal-backdrop" onClick={closeAddressEditor}>
          <section
            className="mypage-address-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="addressEditorTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mypage-address-modal-header">
              <div>
                <h2 id="addressEditorTitle">
                  {editingAddressId ? '배송지 수정' : '새 배송지 추가'}
                </h2>
                <p>우편번호 검색으로 주소를 불러온 뒤 상세주소를 입력해주세요.</p>
              </div>

              <button
                type="button"
                className="mypage-address-modal-close"
                aria-label="닫기"
                onClick={closeAddressEditor}
              >
                ×
              </button>
            </div>

            <div className="mypage-address-modal-form">
              <label>
                <span>배송지명</span>
                <input
                  type="text"
                  name="label"
                  value={addressForm.label}
                  onChange={handleAddressInputChange}
                  placeholder="예: 집, 회사"
                />
              </label>

              <label>
                <span>받는 사람</span>
                <input
                  type="text"
                  name="receiverName"
                  value={addressForm.receiverName}
                  onChange={handleAddressInputChange}
                  placeholder="받는 사람"
                />
              </label>

              <label>
                <span>연락처</span>
                <input
                  type="text"
                  name="phone"
                  value={addressForm.phone}
                  onChange={handleAddressInputChange}
                  placeholder="010-0000-0000"
                  maxLength={13}
                />
              </label>

              <div className="mypage-postcode-field">
                <span>주소</span>

                <div className="mypage-postcode-row">
                  <input
                    type="text"
                    name="postcode"
                    value={addressForm.postcode}
                    placeholder="우편번호"
                    readOnly
                  />

                  <button type="button" onClick={handlePostcodeSearch} disabled={addressLoading}>
                    {addressLoading ? '불러오는 중' : '우편번호 찾기'}
                  </button>
                </div>

                <input
                  type="text"
                  name="address"
                  value={addressForm.address}
                  placeholder="주소"
                  readOnly
                />

                <input
                  id="mypageDetailAddress"
                  type="text"
                  name="detailAddress"
                  value={addressForm.detailAddress}
                  onChange={handleAddressInputChange}
                  placeholder="상세주소"
                />
              </div>

              <label className="mypage-address-default-check">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={addressForm.isDefault}
                  onChange={handleAddressInputChange}
                />
                <span>기본 배송지로 설정</span>
              </label>
            </div>

            <div className="mypage-address-modal-actions">
              <button type="button" className="is-cancel" onClick={closeAddressEditor}>
                취소
              </button>

              <button type="button" className="is-save" onClick={handleAddressSave}>
                {editingAddressId ? '수정 저장' : '배송지 추가'}
              </button>
            </div>
          </section>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTargetAddress)}
        title="배송지를 삭제하시겠습니까?"
        description={
          <>
            삭제한 배송지는 다시 복구할 수 없습니다.
            <br />
            {deleteTargetAddress?.label || '선택한 배송지'} 정보를 삭제할까요?
          </>
        }
        confirmText="삭제"
        cancelText="취소"
        onConfirm={confirmAddressDelete}
        onClose={closeAddressDeletePanel}
        titleId="mypageDeleteAddressTitle"
        backdropClassName="mypage-delete-address-backdrop"
        modalClassName="mypage-delete-address-modal"
        iconClassName="mypage-delete-address-icon"
        actionsClassName="mypage-delete-address-actions"
        cancelClassName="is-cancel"
        confirmClassName="is-delete"
        icon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="m19 6-1 14H6L5 6" />
            <path d="M10 11v5" />
            <path d="M14 11v5" />
          </svg>
        }
      >
        {deleteTargetAddress && (
          <div className="mypage-delete-address-preview">
            <strong>{deleteTargetAddress.label || '배송지'}</strong>
            <span>
              {[
                deleteTargetAddress.postcode,
                deleteTargetAddress.address,
                deleteTargetAddress.detailAddress,
              ]
                .filter(Boolean)
                .join(' ')}
            </span>
          </div>
        )}
      </ConfirmModal>
    </>
  );
}

export default AddressManagementPage;
