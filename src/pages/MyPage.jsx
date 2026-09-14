import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { getMe } from '@/api/authApi';
import { getOrders } from '@/api/orders';
import '@/styles/mypage.css';

const MY_PAGE_MENU = [
  { label: '마이페이지 홈', to: '/mypage' },
  { label: '주문 내역', to: '/mypage/orders' },
  { label: '취소 / 교환 / 반품', to: '/mypage/claims' },
  { label: '내 리뷰', to: '/mypage/reviews' },
  { label: '쿠폰 및 혜택', to: '/mypage/coupons' },
  { label: '회원 정보 수정', to: '/mypage/profile' },
  { label: '배송지 관리', to: '/mypage/addresses' },
  { label: '문의 내역', to: '/mypage/inquiries' },
  { label: '찜한 상품', to: '/mypage/wishlist' },
];

const EMPTY_ADDRESS_FORM = {
  label: '',
  receiverName: '',
  phone: '',
  postcode: '',
  address: '',
  detailAddress: '',
  isDefault: false,
};

const PASSWORD_MAX_LENGTH = 12;
const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[.!@#$%^&*?])[a-zA-Z\d.!@#$%^&*?]{8,12}$/;

function IconBag() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.5 8.5h13l-.8 11h-11.4l-.8-11Z" />
      <path d="M9 9V6.7a3 3 0 0 1 6 0V9" />
      <path d="M9 12.5h6" />
    </svg>
  );
}

function IconCoupon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7.5A2.5 2.5 0 0 0 6.5 10 2.5 2.5 0 0 0 4 12.5V17h16v-4.5A2.5 2.5 0 0 0 17.5 10 2.5 2.5 0 0 0 20 7.5V3H4v4.5Z" />
    </svg>
  );
}

function IconCoin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v4c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" />
      <path d="M5 14v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 5.9a5.2 5.2 0 0 0-7.4 0L12 7.3l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.7a5.2 5.2 0 0 0 0-7.4Z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 20 4.2-1 10.9-10.9a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" />
      <path d="m14.8 6.4 2.8 2.8" />
    </svg>
  );
}

function ProfileAvatar() {
  return (
    <div className="mypage-profile-avatar" aria-hidden="true">
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="27" r="16" />
        <path d="M16 68c3.5-16 13.6-24 24-24s20.5 8 24 24" />
      </svg>
    </div>
  );
}

function maskName(name) {
  if (!name) return '-';
  if (name.length === 1) return name;
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(1, name.length - 2))}`;
}

function maskLoginId(loginId) {
  if (!loginId) return '-';
  if (loginId.length <= 3) return `${loginId.charAt(0)}***`;
  return `${loginId.slice(0, 3)}***`;
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '-';

  const [localPart, domain] = email.split('@');
  const visible = localPart.slice(0, Math.min(3, localPart.length));

  return `${visible}***@${domain}`;
}

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

function maskPhone(phone) {
  if (!phone) return '-';

  const numbers = String(phone).replace(/\D/g, '');

  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 8)}***`;
  }

  if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 7)}***`;
  }

  return `${numbers.slice(0, 3)}-****`;
}

function maskPostcode(postcode) {
  if (!postcode) return '-';

  const value = String(postcode);

  if (value.length <= 2) return `${value}*`;

  return `${value.slice(0, Math.max(1, value.length - 1))}*`;
}

function maskAddress(address) {
  if (!address) return '-';

  const words = String(address).trim().split(' ').filter(Boolean);

  if (words.length <= 3) {
    return `${words.join(' ')} ***`;
  }

  return `${words.slice(0, 3).join(' ')} ***`;
}

function maskDetailAddress(detailAddress) {
  if (!detailAddress) return '-';

  const value = String(detailAddress);

  if (value.length <= 2) return `${value.charAt(0)}*`;

  return `${value.slice(0, Math.max(1, value.length - 1))}*`;
}

function getProfile(response) {
  return response?.data?.user ?? response?.data ?? response?.user ?? response?.userInfo ?? null;
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

function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const addressSectionRef = useRef(null);
  const postcodeDialogRef = useRef(null);
  const postcodeContainerRef = useRef(null);
  const saveToastTimerRef = useRef(null);

  const [user, setUser] = useState(null);
  const [orderCount, setOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailNotice, setEmailNotice] = useState(true);
  const [smsNotice, setSmsNotice] = useState(true);
  const [pushNotice, setPushNotice] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    loginId: '',
    email: '',
    phone: '',
    birthday: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });
  const [isPasswordEditorOpen, setIsPasswordEditorOpen] = useState(false);
  const [passwordSaveMessage, setPasswordSaveMessage] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addresses, setAddresses] = useState(() => {
    try {
      const savedAddresses = JSON.parse(localStorage.getItem('arc-addresses') ?? '[]');
      return Array.isArray(savedAddresses) ? savedAddresses : [];
    } catch {
      return [];
    }
  });
  const [isAddressEditorOpen, setIsAddressEditorOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaveToastVisible, setIsSaveToastVisible] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      navigate('/login', { replace: true });
      return;
    }

    const loadMyPage = async () => {
      setIsLoading(true);
      setErrorMessage('');

      const [profileResult, ordersResult] = await Promise.allSettled([
        getMe(accessToken),
        getOrders({ page: 1, limit: 1 }),
      ]);

      if (profileResult.status === 'rejected') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/login', { replace: true });
        return;
      }

      const profile = getProfile(profileResult.value);

      if (!profile) {
        setErrorMessage('회원 정보를 불러오지 못했습니다.');
        setIsLoading(false);
        return;
      }

      let savedProfileOverrides = {};

      try {
        savedProfileOverrides = JSON.parse(localStorage.getItem('arc-profile-overrides') ?? '{}');
      } catch {
        localStorage.removeItem('arc-profile-overrides');
      }

      const nextProfileForm = {
        name: savedProfileOverrides.name ?? profile.name ?? '',
        loginId:
          savedProfileOverrides.loginId ??
          profile.loginId ??
          profile.identifier ??
          profile.id ??
          '',
        email: savedProfileOverrides.email ?? profile.email ?? '',
        phone: formatPhoneNumber(
          savedProfileOverrides.phone ??
            profile.phone ??
            profile.phoneNumber ??
            profile.mobile ??
            ''
        ),
        birthday:
          savedProfileOverrides.birthday ??
          profile.birthday ??
          profile.birthDate ??
          profile.dateOfBirth ??
          '',
      };

      setUser({
        ...profile,
        ...savedProfileOverrides,
      });
      setProfileForm(nextProfileForm);

      const signupPostcode =
        profile.postcode ?? profile.zonecode ?? profile.address?.postcode ?? '';
      const signupAddress =
        typeof profile.address === 'string'
          ? profile.address
          : (profile.address?.address ?? profile.address?.roadAddress ?? '');
      const signupDetailAddress = profile.detailAddress ?? profile.address?.detailAddress ?? '';
      const signupPhone = profile.phone ?? profile.phoneNumber ?? profile.mobile ?? '';

      if (signupPostcode || signupAddress || signupDetailAddress) {
        setAddresses((prev) => {
          const hasSignupAddress = prev.some((item) => item.id === 'signup-default');

          if (hasSignupAddress) {
            return prev;
          }

          const hasDefaultAddress = prev.some((item) => item.isDefault);

          return [
            {
              id: 'signup-default',
              label: '기본 배송지',
              receiverName: profile.name ?? nextProfileForm.name,
              phone: signupPhone,
              postcode: signupPostcode,
              address: signupAddress,
              detailAddress: signupDetailAddress,
              isDefault: !hasDefaultAddress,
            },
            ...prev,
          ];
        });
      }

      if (ordersResult.status === 'fulfilled') {
        const ordersData = ordersResult.value?.data ?? {};
        setOrderCount(
          Number(
            ordersData.pagination?.totalCount ??
              ordersData.pageInfo?.totalCount ??
              ordersData.totalCount ??
              ordersData.orders?.length ??
              0
          )
        );
      }

      setIsLoading(false);
    };

    loadMyPage();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('arc-addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    const savedNoticeSettings = localStorage.getItem('arc-notice-settings');

    if (!savedNoticeSettings) {
      return;
    }

    try {
      const settings = JSON.parse(savedNoticeSettings);

      setEmailNotice(Boolean(settings.emailNotice));
      setSmsNotice(Boolean(settings.smsNotice));
      setPushNotice(Boolean(settings.pushNotice));
    } catch {
      localStorage.removeItem('arc-notice-settings');
    }
  }, []);

  useEffect(() => {
    if (location.pathname === '/mypage/addresses' && addressSectionRef.current) {
      window.setTimeout(() => {
        addressSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 0);
    }
  }, [location.pathname]);

  const userName = user?.name ?? user?.nickname ?? user?.loginId ?? user?.id ?? '회원';
  const loginId = user?.loginId ?? user?.identifier ?? user?.id ?? '';
  const email = user?.email ?? '';
  const phone = user?.phone ?? user?.phoneNumber ?? user?.mobile ?? '';
  const couponCount = Number(user?.couponCount ?? user?.availableCouponCount ?? 0);
  const pointBalance = Number(user?.points ?? user?.pointBalance ?? user?.mileage ?? 0);
  const wishlistCount = Number(user?.wishlistCount ?? user?.wishCount ?? 0);
  const defaultAddress = addresses.find((item) => item.isDefault) ?? addresses[0] ?? null;

  const summaryItems = useMemo(
    () => [
      {
        label: '주문 내역',
        value: `${orderCount}건`,
        to: '/mypage/orders',
        icon: <IconBag />,
      },
      {
        label: '보유 쿠폰',
        value: `${couponCount}개`,
        to: '/mypage/coupons',
        icon: <IconCoupon />,
      },
      {
        label: '적립금',
        value: `${pointBalance.toLocaleString()}원`,
        to: '/mypage/coupons',
        icon: <IconCoin />,
      },
      {
        label: '찜한 상품',
        value: `${wishlistCount}개`,
        to: '/mypage/wishlist',
        icon: <IconHeart />,
      },
    ],
    [couponCount, orderCount, pointBalance, wishlistCount]
  );

  const isProfileView =
    location.pathname === '/mypage/profile' || location.pathname === '/mypage/addresses';

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === 'name') {
      nextValue = value.replace(/[^가-힣a-zA-Z\s]/g, '').slice(0, 20);
    }

    if (name === 'phone') {
      nextValue = formatPhoneNumber(value);
    }

    setProfileForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setSaveMessage('');
  };

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === 'currentPassword'
        ? value
        : value.replace(/[^a-zA-Z0-9.!@#$%^&*?]/g, '').slice(0, PASSWORD_MAX_LENGTH);

    setPasswordForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setPasswordSaveMessage('');
  };

  const passwordStatus = useMemo(() => {
    if (!passwordForm.newPassword) return 'idle';

    return PASSWORD_PATTERN.test(passwordForm.newPassword) ? 'success' : 'error';
  }, [passwordForm.newPassword]);

  const passwordCheckStatus = useMemo(() => {
    if (!passwordForm.newPasswordConfirm) return 'idle';

    return passwordForm.newPassword === passwordForm.newPasswordConfirm ? 'success' : 'error';
  }, [passwordForm.newPassword, passwordForm.newPasswordConfirm]);

  const handleAddressInputChange = (event) => {
    const { name, value, checked, type } = event.target;

    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePostcodeSearch = async () => {
    if (addressLoading) {
      return;
    }

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
      receiverName: profileForm.name,
      phone: profileForm.phone,
      isDefault: addresses.length === 0,
    });
    setIsAddressEditorOpen(true);
  };

  const openEditAddressEditor = (addressItem) => {
    setEditingAddressId(addressItem.id);
    setAddressForm({
      label: addressItem.label ?? '',
      receiverName: addressItem.receiverName ?? '',
      phone: addressItem.phone ?? '',
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

  const closePasswordEditor = () => {
    setIsPasswordEditorOpen(false);
    setPasswordSaveMessage('');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    });
  };

  const handlePasswordSave = () => {
    if (!passwordForm.currentPassword) {
      setPasswordSaveMessage('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (passwordStatus !== 'success') {
      setPasswordSaveMessage('영문, 숫자, 특수문자(.!@#$%^&*?)를 포함한 8~12자로 입력해주세요.');
      return;
    }

    if (passwordCheckStatus !== 'success') {
      setPasswordSaveMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    localStorage.setItem(
      'arc-password-change-draft',
      JSON.stringify({
        changedAt: new Date().toISOString(),
      })
    );

    setPasswordSaveMessage('비밀번호 변경 값이 저장되었습니다.');
    window.setTimeout(() => {
      closePasswordEditor();
    }, 600);
  };

  const handleAddressSave = () => {
    if (
      !addressForm.receiverName.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.postcode.trim() ||
      !addressForm.address.trim()
    ) {
      alert('받는 사람, 연락처, 우편번호, 주소를 입력해주세요.');
      return;
    }

    const nextAddress = {
      ...addressForm,
      id: editingAddressId ?? `address-${Date.now()}`,
      label: addressForm.label.trim() || '배송지',
    };

    setAddresses((prev) => {
      let nextItems;

      if (editingAddressId) {
        nextItems = prev.map((item) => (item.id === editingAddressId ? nextAddress : item));
      } else {
        nextItems = [...prev, nextAddress];
      }

      if (nextAddress.isDefault) {
        return nextItems.map((item) => ({
          ...item,
          isDefault: item.id === nextAddress.id,
        }));
      }

      if (!nextItems.some((item) => item.isDefault) && nextItems.length > 0) {
        return nextItems.map((item, index) => ({
          ...item,
          isDefault: index === 0,
        }));
      }

      return nextItems;
    });

    closeAddressEditor();
    setSaveMessage('배송지 정보가 현재 화면에 반영되었습니다.');
  };

  const handleAddressDelete = (addressId) => {
    const target = addresses.find((item) => item.id === addressId);

    if (!window.confirm('이 배송지를 삭제하시겠습니까?')) {
      return;
    }

    setAddresses((prev) => {
      const nextItems = prev.filter((item) => item.id !== addressId);

      if (target?.isDefault && nextItems.length > 0) {
        return nextItems.map((item, index) => ({
          ...item,
          isDefault: index === 0,
        }));
      }

      return nextItems;
    });
  };

  const handleSetDefaultAddress = (addressId) => {
    setAddresses((prev) =>
      prev.map((item) => ({
        ...item,
        isDefault: item.id === addressId,
      }))
    );
  };

  const handleSaveAll = () => {
    const phoneNumbers = profileForm.phone.replace(/[^\d]/g, '');

    if (phoneNumbers.length !== 11) {
      setSaveMessage('휴대폰 번호는 3-4-4 형식으로 입력해주세요.');
      return;
    }

    const profileOverrides = {
      name: profileForm.name,
      loginId: profileForm.loginId,
      email: profileForm.email,
      phone: formatPhoneNumber(profileForm.phone),
      birthday: profileForm.birthday,
    };

    const nextUser = {
      ...user,
      ...profileOverrides,
    };

    setUser(nextUser);
    localStorage.setItem('userInfo', JSON.stringify(nextUser));
    localStorage.setItem('arc-profile-overrides', JSON.stringify(profileOverrides));
    localStorage.setItem(
      'arc-notice-settings',
      JSON.stringify({
        emailNotice,
        smsNotice,
        pushNotice,
      })
    );
    localStorage.setItem('arc-addresses', JSON.stringify(addresses));
    window.dispatchEvent(new Event('auth-change'));

    setSaveMessage('');

    if (saveToastTimerRef.current) {
      window.clearTimeout(saveToastTimerRef.current);
    }

    setIsSaveToastVisible(true);

    saveToastTimerRef.current = window.setTimeout(() => {
      setIsSaveToastVisible(false);
      saveToastTimerRef.current = null;
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  if (isLoading) {
    return (
      <main className="mypage-page">
        <div className="mypage-loading">회원 정보를 불러오는 중입니다.</div>
      </main>
    );
  }

  return (
    <main className="mypage-page">
      <div className="mypage-shell">
        <aside className="mypage-sidebar">
          <div className="mypage-user-panel">
            <ProfileAvatar />
            <strong className="mypage-user-name">{userName}님</strong>
            <span className="mypage-user-email">{email || loginId}</span>
          </div>

          <div className="mypage-sidebar-divider" />

          <nav className="mypage-nav" aria-label="마이페이지 메뉴">
            {MY_PAGE_MENU.map((item) => {
              const isActive =
                item.to === '/mypage'
                  ? location.pathname === '/mypage'
                  : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`mypage-nav-link${isActive ? ' is-active' : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              type="button"
              className="mypage-nav-link mypage-logout-button"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </nav>
        </aside>

        <section className="mypage-content">
          {errorMessage ? (
            <div className="mypage-error">{errorMessage}</div>
          ) : isProfileView ? (
            <>
              <header className="mypage-heading mypage-profile-heading">
                <h1>회원 정보 수정</h1>
                <p>더 나은 서비스를 위해 회원 정보를 최신 상태로 관리해주세요.</p>
              </header>

              <section className="mypage-edit-section">
                <div className="mypage-edit-section-header">
                  <div>
                    <h2>기본 회원 정보</h2>
                    <p>회원 정보와 생일을 바로 수정할 수 있습니다.</p>
                  </div>
                </div>

                <div className="mypage-direct-form">
                  <label className="mypage-direct-row">
                    <span>이름</span>
                    <input
                      type="text"
                      name="name"
                      maxLength={20}
                      value={profileForm.name}
                      onChange={handleProfileInputChange}
                    />
                  </label>

                  <label className="mypage-direct-row">
                    <span>아이디</span>
                    <input
                      type="text"
                      name="loginId"
                      value={profileForm.loginId}
                      onChange={handleProfileInputChange}
                    />
                  </label>

                  <label className="mypage-direct-row">
                    <span>이메일</span>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileInputChange}
                    />
                  </label>

                  <label className="mypage-direct-row">
                    <span>휴대폰 번호</span>
                    <input
                      type="text"
                      name="phone"
                      inputMode="numeric"
                      maxLength={13}
                      value={profileForm.phone}
                      onChange={handleProfileInputChange}
                      placeholder="010-1234-5678"
                    />
                  </label>

                  <label className="mypage-direct-row">
                    <span>생일</span>
                    <input
                      type="date"
                      name="birthday"
                      value={profileForm.birthday}
                      onChange={handleProfileInputChange}
                    />
                  </label>
                </div>

                <div className="mypage-password-toggle-row">
                  <div>
                    <h3>비밀번호</h3>
                    <p>비밀번호를 변경하려면 별도 패널에서 진행해주세요.</p>
                  </div>

                  <button
                    type="button"
                    className="mypage-outline-button"
                    onClick={() => {
                      setPasswordSaveMessage('');
                      setIsPasswordEditorOpen(true);
                    }}
                  >
                    비밀번호 변경
                  </button>
                </div>
              </section>

              <section className="mypage-edit-section">
                <div className="mypage-edit-section-header">
                  <div>
                    <h2>수신 설정</h2>
                    <p>상품, 혜택, 이벤트 소식을 받아보세요. 선택 사항입니다.</p>
                  </div>
                </div>

                <div className="mypage-notice-list">
                  <label className="mypage-notice-row">
                    <span>
                      <strong>이메일 수신</strong>
                      <small>이메일로 마케팅 소식과 이벤트 정보를 받습니다.</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={emailNotice}
                      onChange={(event) => setEmailNotice(event.target.checked)}
                    />
                  </label>

                  <label className="mypage-notice-row">
                    <span>
                      <strong>SMS 수신</strong>
                      <small>SMS로 주요 혜택 및 이벤트 정보를 받습니다.</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={smsNotice}
                      onChange={(event) => setSmsNotice(event.target.checked)}
                    />
                  </label>

                  <label className="mypage-notice-row">
                    <span>
                      <strong>푸시 알림 수신</strong>
                      <small>앱 푸시 알림으로 실시간 소식을 받습니다.</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={pushNotice}
                      onChange={(event) => setPushNotice(event.target.checked)}
                    />
                  </label>
                </div>
              </section>

              <section
                ref={addressSectionRef}
                className="mypage-edit-section mypage-address-management"
              >
                <div className="mypage-address-title-row">
                  <div>
                    <h2>등록된 배송지 {addresses.length}개</h2>
                    <p>배송지를 추가하거나 기존 배송지를 수정할 수 있습니다.</p>
                  </div>

                  <button
                    type="button"
                    className="mypage-solid-button"
                    onClick={openNewAddressEditor}
                  >
                    새 배송지 추가
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="mypage-address-empty">
                    등록된 배송지가 없습니다. 새 배송지를 추가해주세요.
                  </div>
                ) : (
                  <div className="mypage-address-list">
                    {addresses.map((addressItem) => (
                      <article className="mypage-address-card" key={addressItem.id}>
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
                              onClick={() => handleSetDefaultAddress(addressItem.id)}
                            >
                              기본으로 설정
                            </button>
                          )}

                          <button type="button" onClick={() => openEditAddressEditor(addressItem)}>
                            수정
                          </button>

                          <button type="button" onClick={() => handleAddressDelete(addressItem.id)}>
                            삭제
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <div className="mypage-all-save-bar">
                {saveMessage && <span>{saveMessage}</span>}

                <button
                  type="button"
                  className="mypage-solid-button mypage-all-save-button"
                  onClick={handleSaveAll}
                >
                  전체 저장
                </button>
              </div>
            </>
          ) : (
            <>
              <header className="mypage-heading">
                <h1>MY PAGE</h1>
                <p>ARC와 함께 더 나은 움직임을 만들어가요.</p>
              </header>

              <section className="mypage-summary-grid" aria-label="내 활동 요약">
                {summaryItems.map((item) => (
                  <Link key={item.label} to={item.to} className="mypage-summary-card">
                    <div className="mypage-summary-top">
                      <span className="mypage-summary-icon">{item.icon}</span>
                      <span className="mypage-summary-arrow" aria-hidden="true">
                        ›
                      </span>
                    </div>

                    <span className="mypage-summary-label">{item.label}</span>
                    <strong className="mypage-summary-value">{item.value}</strong>
                  </Link>
                ))}
              </section>

              <section className="mypage-info-card">
                <div className="mypage-info-toolbar">
                  <div className="mypage-security-badge">
                    <span className="mypage-security-icon">
                      <IconLock />
                    </span>
                    <span>비밀번호 확인 후 수정 가능</span>
                  </div>

                  <Link to="/mypage/profile" className="mypage-edit-button">
                    <IconEdit />
                    <span>수정하기</span>
                  </Link>
                </div>

                <section className="mypage-info-section">
                  <h2>기본 회원 정보</h2>

                  <div className="mypage-info-grid">
                    <div className="mypage-info-item">
                      <span className="mypage-info-label">이름</span>
                      <strong>{maskName(userName)}</strong>
                    </div>

                    <div className="mypage-info-item">
                      <span className="mypage-info-label">아이디</span>
                      <strong>{maskLoginId(loginId)}</strong>
                    </div>

                    <div className="mypage-info-item">
                      <span className="mypage-info-label">이메일</span>
                      <strong>{maskEmail(email)}</strong>
                    </div>

                    <div className="mypage-info-item">
                      <span className="mypage-info-label">휴대폰 번호</span>
                      <strong>{maskPhone(phone)}</strong>
                    </div>
                  </div>
                </section>

                <section className="mypage-info-section mypage-address-section">
                  <h2>기본 배송지</h2>

                  <div className="mypage-info-grid">
                    <div className="mypage-info-item">
                      <span className="mypage-info-label">수령인</span>
                      <strong>{maskName(defaultAddress?.receiverName ?? userName)}</strong>
                    </div>

                    <div className="mypage-info-item">
                      <span className="mypage-info-label">우편번호</span>
                      <strong>{maskPostcode(defaultAddress?.postcode)}</strong>
                    </div>

                    <div className="mypage-info-item">
                      <span className="mypage-info-label">주소</span>
                      <strong>{maskAddress(defaultAddress?.address)}</strong>
                    </div>

                    <div className="mypage-info-item">
                      <span className="mypage-info-label">상세 주소</span>
                      <strong>{maskDetailAddress(defaultAddress?.detailAddress)}</strong>
                    </div>
                  </div>
                </section>
              </section>
            </>
          )}
        </section>
      </div>

      {isSaveToastVisible && (
        <div className="mypage-save-toast" role="status" aria-live="polite">
          저장되었습니다.
        </div>
      )}

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

      {isPasswordEditorOpen && (
        <div className="mypage-password-modal-backdrop" onClick={closePasswordEditor}>
          <section
            className="mypage-password-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mypagePasswordModalTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mypage-password-modal-header">
              <div>
                <h2 id="mypagePasswordModalTitle">비밀번호 변경</h2>
                <p>회원가입과 동일한 비밀번호 조건을 사용합니다.</p>
              </div>

              <button type="button" aria-label="비밀번호 변경 닫기" onClick={closePasswordEditor}>
                ×
              </button>
            </div>

            <div className="mypage-password-modal-body">
              <label>
                <span>현재 비밀번호</span>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="현재 비밀번호를 입력해주세요."
                  autoComplete="current-password"
                />
              </label>

              <label>
                <span>새 비밀번호</span>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="새 비밀번호를 입력해주세요."
                  maxLength={PASSWORD_MAX_LENGTH}
                  autoComplete="new-password"
                />
                <small className={passwordStatus === 'error' ? 'is-error' : ''}>
                  영문, 숫자, 특수문자(.!@#$%^&amp;*?)를 포함한 8~12자
                </small>
              </label>

              <label>
                <span>새 비밀번호 확인</span>
                <input
                  type="password"
                  name="newPasswordConfirm"
                  value={passwordForm.newPasswordConfirm}
                  onChange={handlePasswordInputChange}
                  placeholder="새 비밀번호를 다시 입력해주세요."
                  maxLength={PASSWORD_MAX_LENGTH}
                  autoComplete="new-password"
                />
                {passwordCheckStatus === 'error' && (
                  <small className="is-error">비밀번호가 일치하지 않습니다.</small>
                )}
              </label>

              {passwordSaveMessage && (
                <p className="mypage-password-save-message">{passwordSaveMessage}</p>
              )}
            </div>

            <div className="mypage-password-modal-actions">
              <button type="button" className="is-cancel" onClick={closePasswordEditor}>
                취소
              </button>

              <button type="button" className="is-save" onClick={handlePasswordSave}>
                저장
              </button>
            </div>
          </section>
        </div>
      )}

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
    </main>
  );
}

export default MyPage;
