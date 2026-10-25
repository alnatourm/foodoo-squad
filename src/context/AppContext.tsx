import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  Business,
  BusinessId,
  CartItem,
  FulfillmentType,
  Language,
  Order,
  OrderStatus,
  Product,
  Squad,
  SquadCategory,
  SquadMember,
  UserPrivate,
  UserProfile,
} from '../types';
import { SEED_BUSINESSES, SEED_PRODUCTS, SEED_SQUADS } from '../data/seedData';

interface PendingCartConflict {
  product: Product;
  quantity: number;
  selectedOption: string;
}

interface PlaceOrderInput {
  customerName: string;
  customerPhone: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress: string;
  notes: string;
}

interface CreateSquadInput {
  name: string;
  category: SquadCategory;
  description: string;
  weeklyGoal: number;
}

interface AppContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (ar: string, en: string) => string;
  user: User | null;
  authReady: boolean;
  isSeeding: boolean;
  isFirestoreSeeded: boolean;
  userProfile: UserProfile | null;
  userPrivate: UserPrivate | null;
  businesses: Business[];
  products: Product[];
  squads: Squad[];
  customerOrders: Order[];
  merchantOrders: Order[];
  cart: CartItem[];
  cartBusiness: Business | null;
  cartSubtotalSar: number;
  cartCount: number;
  pendingCartConflict: PendingCartConflict | null;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  seedPilotDatabase: () => Promise<void>;
  addToCart: (
    product: Product,
    quantity?: number,
    selectedOption?: string
  ) => void;
  confirmCartSwitch: () => void;
  cancelCartSwitch: () => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  placeOrder: (input: PlaceOrderInput) => Promise<string>;
  updateOrderStatus: (order: Order, nextStatus: OrderStatus) => Promise<void>;
  saveProduct: (
    productData: Omit<Product, 'updatedAt'>,
    isNew: boolean
  ) => Promise<void>;
  toggleProductAvailability: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateBusinessSettings: (
    businessId: BusinessId,
    updates: Partial<Business>
  ) => Promise<void>;
  assignMerchantBusiness: (businessId: '' | BusinessId) => Promise<void>;
  updateUserProfileAndPrivate: (input: {
    displayName: string;
    phone: string;
    defaultAddress: string;
  }) => Promise<void>;
  createSquad: (input: CreateSquadInput) => Promise<string>;
  joinSquad: (squadId: string) => Promise<void>;
  leaveSquad: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'foodoo_pilot_cart_v1';
const LANG_STORAGE_KEY = 'foodoo_pilot_lang_v1';

export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
};

export const SAUDI_PHONE_REGEX = /^(05|5|\+9665|009665)[0-9]{8}$/;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'ar';
  });

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isFirestoreSeeded, setIsFirestoreSeeded] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPrivate, setUserPrivate] = useState<UserPrivate | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>(SEED_BUSINESSES);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [squads, setSquads] = useState<Squad[]>(SEED_SQUADS);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [merchantOrders, setMerchantOrders] = useState<Order[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [pendingCartConflict, setPendingCartConflict] =
    useState<PendingCartConflict | null>(null);

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (
    text: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setToastMessage({ text, type });
  };

  const clearToast = () => setToastMessage(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
    localStorage.setItem(LANG_STORAGE_KEY, nextLang);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  // Seed initial businesses, products, and squads into Firestore if not yet present
  const ensurePilotDataSeeded = async (currentUser: User) => {
    try {
      const restRef = doc(db, 'businesses', 'foodoo-restaurant');
      const restSnap = await getDoc(restRef);

      if (!restSnap.exists()) {
        setIsSeeding(true);
        for (const biz of SEED_BUSINESSES) {
          await setDoc(doc(db, 'businesses', biz.id), {
            ...biz,
            managerUid: currentUser.uid,
            updatedAt: serverTimestamp(),
          });
        }

        for (const prod of SEED_PRODUCTS) {
          await setDoc(doc(db, 'products', prod.id), {
            ...prod,
            updatedAt: serverTimestamp(),
          });
        }

        for (const sq of SEED_SQUADS) {
          await setDoc(doc(db, 'squads', sq.id), {
            ...sq,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          // Seed initial captain member record
          await setDoc(doc(db, 'squads', sq.id, 'members', sq.creatorId), {
            userId: sq.creatorId,
            squadId: sq.id,
            displayName: sq.creatorName,
            role: 'captain',
            pointsContributed: Math.max(1, Math.floor(sq.weeklyPoints / 2)),
            joinedAt: serverTimestamp(),
          });
        }
        setIsSeeding(false);
        setIsFirestoreSeeded(true);
      } else {
        setIsFirestoreSeeded(true);
      }
    } catch (error) {
      setIsSeeding(false);
      console.error('Seed check error:', error);
    }
  };

  // Ensure user_profiles and user_private exist upon login
  const ensureUserRecords = async (currentUser: User) => {
    const profileRef = doc(db, 'user_profiles', currentUser.uid);
    const privateRef = doc(db, 'user_private', currentUser.uid);
    try {
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        const defaultName = (
          currentUser.displayName ||
          currentUser.email?.split('@')[0] ||
          'عميل فودو'
        ).slice(0, 90);
        await setDoc(profileRef, {
          uid: currentUser.uid,
          displayName: defaultName,
          activeSquadId: '',
          assignedBusinessId: 'foodoo-restaurant',
          completedOrdersCount: 0,
          squadPointsContributed: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      const privateSnap = await getDoc(privateRef);
      if (!privateSnap.exists()) {
        await setDoc(privateRef, {
          uid: currentUser.uid,
          email: (currentUser.email || '').slice(0, 190),
          phone: '0501234567',
          defaultAddress: 'الرياض - حي الملقا، شارع أنس بن مالك',
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `user_profiles/${currentUser.uid}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (currentUser) {
        await ensureUserRecords(currentUser);
        await ensurePilotDataSeeded(currentUser);
      } else {
        setUserProfile(null);
        setUserPrivate(null);
        setCustomerOrders([]);
        setMerchantOrders([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to public catalog collections (businesses, products, squads)
  useEffect(() => {
    const bizQuery = query(
      collection(db, 'businesses'),
      where('isDemoData', '==', true)
    );
    const unsubBiz = onSnapshot(
      bizQuery,
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as Business);
          setBusinesses(list);
          setIsFirestoreSeeded(true);
        }
      },
      (error) => {
        console.warn('Businesses listener awaiting seed:', error.message);
      }
    );

    const prodQuery = query(
      collection(db, 'products'),
      where('businessId', 'in', ['foodoo-restaurant', 'foodoo-cafe'])
    );
    const unsubProd = onSnapshot(
      prodQuery,
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as Product);
          setProducts(list);
        }
      },
      (error) => {
        console.warn('Products listener awaiting seed:', error.message);
      }
    );

    const squadsQuery = query(
      collection(db, 'squads'),
      where('isActive', '==', true)
    );
    const unsubSquads = onSnapshot(
      squadsQuery,
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as Squad);
          list.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
          setSquads(list);
        }
      },
      (error) => {
        console.warn('Squads listener awaiting seed:', error.message);
      }
    );

    return () => {
      unsubBiz();
      unsubProd();
      unsubSquads();
    };
  }, [user]);

  // Subscribe to current user profile, private PII, customer orders, and merchant orders
  useEffect(() => {
    if (!authReady || !user) return;

    const profileRef = doc(db, 'user_profiles', user.uid);
    const unsubProfile = onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists()) {
          setUserProfile(snap.data() as UserProfile);
        }
      },
      (error) =>
        handleFirestoreError(
          error,
          OperationType.GET,
          `user_profiles/${user.uid}`
        )
    );

    const privateRef = doc(db, 'user_private', user.uid);
    const unsubPrivate = onSnapshot(
      privateRef,
      (snap) => {
        if (snap.exists()) {
          setUserPrivate(snap.data() as UserPrivate);
        }
      },
      (error) =>
        handleFirestoreError(
          error,
          OperationType.GET,
          `user_private/${user.uid}`
        )
    );

    const custOrdersQuery = query(
      collection(db, 'orders'),
      where('customerId', '==', user.uid)
    );
    const unsubCustOrders = onSnapshot(
      custOrdersQuery,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Order);
        list.sort((a, b) => {
          const tA = (a.createdAt as { seconds?: number })?.seconds || 0;
          const tB = (b.createdAt as { seconds?: number })?.seconds || 0;
          return tB - tA;
        });
        setCustomerOrders(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'orders')
    );

    return () => {
      unsubProfile();
      unsubPrivate();
      unsubCustOrders();
    };
  }, [authReady, user]);

  // Subscribe to isolated Merchant Orders for userProfile.assignedBusinessId
  useEffect(() => {
    if (!authReady || !user || !userProfile?.assignedBusinessId) {
      setMerchantOrders([]);
      return;
    }

    const assignedBiz = userProfile.assignedBusinessId;
    const isBootstrappedAdmin =
      user.email === 'alnatour.m@gmail.com' && user.emailVerified;

    const merchQuery = isBootstrappedAdmin
      ? query(
          collection(db, 'orders'),
          where('businessId', '==', assignedBiz)
        )
      : query(
          collection(db, 'orders'),
          where('merchantUid', '==', user.uid)
        );

    const unsubMerch = onSnapshot(
      merchQuery,
      (snap) => {
        const list = snap.docs
          .map((d) => d.data() as Order)
          .filter((o) => o.businessId === assignedBiz);
        list.sort((a, b) => {
          const tA = (a.createdAt as { seconds?: number })?.seconds || 0;
          const tB = (b.createdAt as { seconds?: number })?.seconds || 0;
          return tB - tA;
        });
        setMerchantOrders(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'orders')
    );

    return () => unsubMerch();
  }, [authReady, user, userProfile?.assignedBusinessId]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast(
        t('تم تسجيل الدخول بنجاح وتفعيل قاعدة البيانات', 'Signed in successfully'),
        'success'
      );
    } catch (error) {
      showToast(
        t(
          'تعذر تسجيل الدخول، يرجى المحاولة مرة أخرى',
          'Sign-in failed, please try again'
        ),
        'error'
      );
      console.error(error);
    }
  };

  const signOutUser = async () => {
    await fbSignOut(auth);
    showToast(t('تم تسجيل الخروج', 'Signed out'), 'info');
  };

  const seedPilotDatabase = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    setIsSeeding(true);
    try {
      for (const biz of SEED_BUSINESSES) {
        await setDoc(doc(db, 'businesses', biz.id), {
          ...biz,
          managerUid: user.uid,
          updatedAt: serverTimestamp(),
        });
      }
      for (const prod of SEED_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), {
          ...prod,
          updatedAt: serverTimestamp(),
        });
      }
      for (const sq of SEED_SQUADS) {
        await setDoc(doc(db, 'squads', sq.id), {
          ...sq,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await setDoc(doc(db, 'squads', sq.id, 'members', sq.creatorId), {
          userId: sq.creatorId,
          squadId: sq.id,
          displayName: sq.creatorName,
          role: 'captain',
          pointsContributed: Math.max(1, Math.floor(sq.weeklyPoints / 2)),
          joinedAt: serverTimestamp(),
        });
      }
      setIsFirestoreSeeded(true);
      showToast(
        t(
          'تمت مزامنة البيانات التجريبية في Firestore بنجاح',
          'Demo businesses, menus, and Squads synced to Firestore'
        ),
        'success'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'businesses');
    } finally {
      setIsSeeding(false);
    }
  };

  const cartBusiness = useMemo(() => {
    if (cart.length === 0) return null;
    const bizId = cart[0].product.businessId;
    return businesses.find((b) => b.id === bizId) || null;
  }, [cart, businesses]);

  const cartSubtotalSar = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.product.priceSar * item.quantity,
        0
      ),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const internalAppendToCart = (
    baseCart: CartItem[],
    product: Product,
    quantity: number,
    selectedOption: string
  ): CartItem[] => {
    const option =
      selectedOption || product.customizationOptions?.[0] || 'Standard';
    const cartItemId = `${product.id}__${option}`;
    const existingIdx = baseCart.findIndex((i) => i.cartItemId === cartItemId);
    if (existingIdx >= 0) {
      const updated = [...baseCart];
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantity: Math.min(25, updated[existingIdx].quantity + quantity),
      };
      return updated;
    }
    return [
      ...baseCart,
      {
        cartItemId,
        product,
        quantity: Math.min(25, quantity),
        selectedOption: option,
      },
    ];
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedOption = ''
  ) => {
    if (!product.isAvailable) {
      showToast(
        t('هذا المنتج غير متوفر حالياً', 'This item is currently unavailable'),
        'error'
      );
      return;
    }

    if (cart.length > 0 && cart[0].product.businessId !== product.businessId) {
      // Restrict cart to one business per order and prompt before clearing
      setPendingCartConflict({
        product,
        quantity,
        selectedOption:
          selectedOption || product.customizationOptions?.[0] || 'Standard',
      });
      return;
    }

    setCart((prev) =>
      internalAppendToCart(prev, product, quantity, selectedOption)
    );
    showToast(
      t(
        `تمت إضافة "${product.nameAr}" إلى السلة`,
        `Added "${product.nameEn}" to cart`
      ),
      'success'
    );
  };

  const confirmCartSwitch = () => {
    if (!pendingCartConflict) return;
    const { product, quantity, selectedOption } = pendingCartConflict;
    setCart(internalAppendToCart([], product, quantity, selectedOption));
    setPendingCartConflict(null);
    showToast(
      t(
        'تم تفريغ السلة السابقة وإضافة المنتج الجديد',
        'Cleared previous cart and added new item'
      ),
      'success'
    );
  };

  const cancelCartSwitch = () => {
    setPendingCartConflict(null);
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (input: PlaceOrderInput): Promise<string> => {
    if (!user) {
      throw new Error(
        t('يرجى تسجيل الدخول لإتمام الطلب', 'Please sign in to place an order')
      );
    }
    if (cart.length === 0 || !cartBusiness) {
      throw new Error(t('السلة فارغة', 'Your cart is empty'));
    }

    const cleanPhone = input.customerPhone.trim().replace(/\s+/g, '');
    if (!SAUDI_PHONE_REGEX.test(cleanPhone)) {
      throw new Error(
        t(
          'يرجى إدخال رقم جوال سعودي صحيح (مثال: 0501234567)',
          'Please enter a valid Saudi mobile number (e.g. 0501234567)'
        )
      );
    }

    const cleanName = input.customerName.trim().slice(0, 100);
    if (cleanName.length < 2) {
      throw new Error(
        t('يرجى إدخال الاسم الكامل', 'Please enter your full name')
      );
    }

    const deliveryFeeSar =
      input.fulfillmentType === 'delivery' ? cartBusiness.deliveryFeeSar : 0;
    const totalSar = cartSubtotalSar + deliveryFeeSar;

    const orderId = `ord-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `FD-${randomNum}`;

    const itemsSummary = cart.slice(0, 20).map((item) => {
      const optText = item.selectedOption ? ` (${item.selectedOption})` : '';
      return `${item.quantity}x ${item.product.nameAr} | ${item.product.nameEn}${optText} — ${
        item.product.priceSar * item.quantity
      } SAR`.slice(0, 240);
    });

    const activeSquad = squads.find(
      (s) => s.id === (userProfile?.activeSquadId || '')
    );

    const resolvedMerchantUid =
      cartBusiness.managerUid &&
      !cartBusiness.managerUid.startsWith('demo-manager-')
        ? cartBusiness.managerUid
        : user.uid;

    const orderDoc = {
      id: orderId,
      orderNumber,
      customerId: user.uid,
      merchantUid: resolvedMerchantUid,
      customerName: cleanName,
      customerPhone: cleanPhone,
      businessId: cartBusiness.id,
      businessNameAr: cartBusiness.nameAr,
      businessNameEn: cartBusiness.nameEn,
      fulfillmentType: input.fulfillmentType,
      deliveryAddress: (input.deliveryAddress || '').trim().slice(0, 300),
      notes: (input.notes || '').trim().slice(0, 400),
      paymentMethod: 'DEMO_PAYMENT_ONLY' as const,
      itemsSummary,
      itemsCount: Math.min(100, cartCount),
      subtotalSar: cartSubtotalSar,
      deliveryFeeSar,
      totalSar,
      status: 'pending' as OrderStatus,
      squadId: activeSquad ? activeSquad.id : '',
      squadName: activeSquad ? activeSquad.name.slice(0, 100) : '',
      squadPointAwarded: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'orders', orderId), orderDoc);
      clearCart();
      showToast(
        t(
          `تم تأكيد طلبك رقم ${orderNumber} بنجاح!`,
          `Order ${orderNumber} confirmed!`
        ),
        'success'
      );
      return orderId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
    }
  };

  const updateOrderStatus = async (
    order: Order,
    nextStatus: OrderStatus
  ): Promise<void> => {
    const allowed = ALLOWED_STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes(nextStatus)) {
      showToast(
        t(
          `لا يمكن تغيير حالة الطلب من ${order.status} إلى ${nextStatus}`,
          `Illegal status transition from ${order.status} to ${nextStatus}`
        ),
        'error'
      );
      return;
    }

    const willAwardSquadPoint =
      nextStatus === 'completed' &&
      Boolean(order.squadId) &&
      !order.squadPointAwarded;

    try {
      const orderRef = doc(db, 'orders', order.id);
      if (nextStatus === 'completed') {
        await updateDoc(orderRef, {
          status: 'completed',
          squadPointAwarded: willAwardSquadPoint,
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(orderRef, {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      }

      // If order is completed, award +1 Squad point and update customer stats
      if (nextStatus === 'completed') {
        if (willAwardSquadPoint && order.squadId) {
          const squadRef = doc(db, 'squads', order.squadId);
          const squadSnap = await getDoc(squadRef);
          if (squadSnap.exists()) {
            const sqData = squadSnap.data() as Squad;
            await updateDoc(squadRef, {
              weeklyPoints: (sqData.weeklyPoints || 0) + 1,
              totalPoints: (sqData.totalPoints || 0) + 1,
              updatedAt: serverTimestamp(),
            });
          }

          const memberRef = doc(
            db,
            'squads',
            order.squadId,
            'members',
            order.customerId
          );
          const memberSnap = await getDoc(memberRef);
          if (memberSnap.exists()) {
            const memData = memberSnap.data() as SquadMember;
            await updateDoc(memberRef, {
              pointsContributed: (memData.pointsContributed || 0) + 1,
            });
          }
        }

        const custProfileRef = doc(db, 'user_profiles', order.customerId);
        const custSnap = await getDoc(custProfileRef);
        if (custSnap.exists()) {
          const profData = custSnap.data() as UserProfile;
          await updateDoc(custProfileRef, {
            completedOrdersCount: (profData.completedOrdersCount || 0) + 1,
            squadPointsContributed:
              (profData.squadPointsContributed || 0) +
              (willAwardSquadPoint ? 1 : 0),
            updatedAt: serverTimestamp(),
          });
        }
      }

      showToast(
        willAwardSquadPoint
          ? t(
              `تم إكمال الطلب ${order.orderNumber} ومنح +1 نقطة للسكواد!`,
              `Order ${order.orderNumber} completed & +1 Squad point awarded!`
            )
          : t(
              `تم تحديث حالة الطلب ${order.orderNumber}`,
              `Updated order ${order.orderNumber} status`
            ),
        'success'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
    }
  };

  const saveProduct = async (
    productData: Omit<Product, 'updatedAt'>,
    isNew: boolean
  ) => {
    const cleanProduct = {
      id: productData.id.trim(),
      businessId: productData.businessId,
      nameAr: productData.nameAr.trim().slice(0, 120),
      nameEn: productData.nameEn.trim().slice(0, 120),
      descriptionAr: productData.descriptionAr.trim().slice(0, 500),
      descriptionEn: productData.descriptionEn.trim().slice(0, 500),
      category: productData.category.trim().slice(0, 60),
      priceSar: Math.max(1, Math.min(5000, Number(productData.priceSar) || 1)),
      calories: Math.max(0, Math.min(5000, Number(productData.calories) || 0)),
      imageKey: (productData.imageKey || 'burger-double').trim().slice(0, 500),
      isAvailable: Boolean(productData.isAvailable),
      isFeatured: Boolean(productData.isFeatured),
      isPopular: Boolean(productData.isPopular),
      isDemoData: Boolean(productData.isDemoData),
      customizationLabelAr: (productData.customizationLabelAr || '')
        .trim()
        .slice(0, 100),
      customizationLabelEn: (productData.customizationLabelEn || '')
        .trim()
        .slice(0, 100),
      customizationOptions: (productData.customizationOptions || [])
        .map((o) => o.trim().slice(0, 80))
        .filter(Boolean)
        .slice(0, 8),
      updatedAt: serverTimestamp(),
    };

    try {
      if (isNew) {
        await setDoc(doc(db, 'products', cleanProduct.id), cleanProduct);
      } else {
        const { id: _id, businessId: _biz, isDemoData: _demo, ...editable } =
          cleanProduct;
        await updateDoc(doc(db, 'products', cleanProduct.id), editable);
      }
      showToast(
        t('تم حفظ المنتج بنجاح', 'Product saved successfully'),
        'success'
      );
    } catch (error) {
      handleFirestoreError(
        error,
        isNew ? OperationType.CREATE : OperationType.UPDATE,
        `products/${cleanProduct.id}`
      );
    }
  };

  const toggleProductAvailability = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), {
        isAvailable: !product.isAvailable,
        updatedAt: serverTimestamp(),
      });
      showToast(
        t(
          `تم تحديث توفر "${product.nameAr}"`,
          `Updated availability for "${product.nameEn}"`
        ),
        'info'
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `products/${product.id}`
      );
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      showToast(t('تم حذف المنتج', 'Product deleted'), 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
  };

  const updateBusinessSettings = async (
    businessId: BusinessId,
    updates: Partial<Business>
  ) => {
    const current = businesses.find((b) => b.id === businessId);
    if (!current) return;
    try {
      await updateDoc(doc(db, 'businesses', businessId), {
        nameAr: (updates.nameAr ?? current.nameAr).trim().slice(0, 100),
        nameEn: (updates.nameEn ?? current.nameEn).trim().slice(0, 100),
        locationAr: (updates.locationAr ?? current.locationAr)
          .trim()
          .slice(0, 100),
        locationEn: (updates.locationEn ?? current.locationEn)
          .trim()
          .slice(0, 100),
        descriptionAr: (updates.descriptionAr ?? current.descriptionAr)
          .trim()
          .slice(0, 500),
        descriptionEn: (updates.descriptionEn ?? current.descriptionEn)
          .trim()
          .slice(0, 500),
        categories: (updates.categories ?? current.categories)
          .map((c) => c.trim().slice(0, 60))
          .filter(Boolean)
          .slice(0, 10),
        isOpen: updates.isOpen ?? current.isOpen,
        prepTimeMinutes: Math.max(
          1,
          Math.min(180, Number(updates.prepTimeMinutes ?? current.prepTimeMinutes))
        ),
        minOrderSar: Math.max(
          0,
          Math.min(1000, Number(updates.minOrderSar ?? current.minOrderSar))
        ),
        deliveryFeeSar: Math.max(
          0,
          Math.min(200, Number(updates.deliveryFeeSar ?? current.deliveryFeeSar))
        ),
        managerUid: user?.uid || current.managerUid,
        updatedAt: serverTimestamp(),
      });
      showToast(
        t('تم تحديث إعدادات المنشأة بنجاح', 'Business settings updated'),
        'success'
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `businesses/${businessId}`
      );
    }
  };

  const assignMerchantBusiness = async (businessId: '' | BusinessId) => {
    if (!user || !userProfile) return;
    try {
      await updateDoc(doc(db, 'user_profiles', user.uid), {
        assignedBusinessId: businessId,
        updatedAt: serverTimestamp(),
      });

      if (businessId) {
        const bizRef = doc(db, 'businesses', businessId);
        const bizSnap = await getDoc(bizRef);
        if (bizSnap.exists()) {
          await updateDoc(bizRef, {
            managerUid: user.uid,
            updatedAt: serverTimestamp(),
          });
        }
      }

      showToast(
        businessId === 'foodoo-restaurant'
          ? t(
              'تم تعيينك كمدير: مطعم فودو التجريبي',
              'Assigned as Manager: FOODOO Restaurant Demo'
            )
          : businessId === 'foodoo-cafe'
          ? t(
              'تم تعيينك كمدير: مقهى فودو التجريبي',
              'Assigned as Manager: FOODOO Café Demo'
            )
          : t('تم التبديل إلى وضع العميل', 'Switched to Customer role'),
        'success'
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `user_profiles/${user.uid}`
      );
    }
  };

  const updateUserProfileAndPrivate = async (input: {
    displayName: string;
    phone: string;
    defaultAddress: string;
  }) => {
    if (!user) return;
    const cleanPhone = input.phone.trim().replace(/\s+/g, '');
    if (cleanPhone && !SAUDI_PHONE_REGEX.test(cleanPhone)) {
      throw new Error(
        t(
          'رقم الجوال يجب أن يكون بالصيغة السعودية (05XXXXXXXX)',
          'Phone must be in valid Saudi format (05XXXXXXXX)'
        )
      );
    }
    try {
      await updateDoc(doc(db, 'user_profiles', user.uid), {
        displayName: input.displayName.trim().slice(0, 100),
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'user_private', user.uid), {
        email: (user.email || '').slice(0, 200),
        phone: cleanPhone.slice(0, 20),
        defaultAddress: input.defaultAddress.trim().slice(0, 300),
        updatedAt: serverTimestamp(),
      });
      showToast(
        t('تم حفظ بيانات الملف الشخصي', 'Profile updated successfully'),
        'success'
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `user_profiles/${user.uid}`
      );
    }
  };

  const createSquad = async (input: CreateSquadInput): Promise<string> => {
    if (!user || !userProfile) {
      throw new Error(
        t('يرجى تسجيل الدخول أولاً', 'Please sign in to create a Squad')
      );
    }
    if (userProfile.activeSquadId) {
      throw new Error(
        t(
          'أنت منضم بالفعل لسكواد نشط. يجب مغادرة السكواد الحالي أولاً لأن العميل ينتمي لسكواد واحد فقط في نفس الوقت.',
          'You already belong to an active Squad. Leave your current Squad first (1 active Squad per customer).'
        )
      );
    }

    const squadId = `sq-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 6)}`;
    const inviteCode = `FD-${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    try {
      await setDoc(doc(db, 'squads', squadId), {
        id: squadId,
        name: input.name.trim().slice(0, 80),
        category: input.category,
        description: input.description.trim().slice(0, 300),
        inviteCode,
        creatorId: user.uid,
        creatorName: userProfile.displayName.slice(0, 100),
        memberCount: 1,
        weeklyPoints: 0,
        totalPoints: 0,
        weeklyGoal: Math.max(5, Math.min(200, Number(input.weeklyGoal) || 15)),
        isActive: true,
        isDemoData: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'squads', squadId, 'members', user.uid), {
        userId: user.uid,
        squadId,
        displayName: userProfile.displayName.slice(0, 100),
        role: 'captain',
        pointsContributed: 0,
        joinedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'user_profiles', user.uid), {
        activeSquadId: squadId,
        updatedAt: serverTimestamp(),
      });

      showToast(
        t('تم إنشاء السكواد بنجاح!', 'Squad created successfully!'),
        'success'
      );
      return squadId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `squads/${squadId}`);
    }
  };

  const joinSquad = async (squadId: string) => {
    if (!user || !userProfile) {
      throw new Error(
        t('يرجى تسجيل الدخول للانضمام للسكواد', 'Please sign in to join a Squad')
      );
    }
    if (userProfile.activeSquadId) {
      if (userProfile.activeSquadId === squadId) {
        showToast(
          t('أنت عضو بالفعل في هذا السكواد', 'You are already in this Squad'),
          'info'
        );
        return;
      }
      throw new Error(
        t(
          'يمكنك الانضمام إلى سكواد واحد نشط فقط في نفس الوقت. غادر سكوادك الحالي أولاً.',
          'You can only belong to one active Squad at a time. Leave your current Squad first.'
        )
      );
    }

    const squadRef = doc(db, 'squads', squadId);
    try {
      const squadSnap = await getDoc(squadRef);
      if (!squadSnap.exists()) {
        throw new Error(t('السكواد غير موجود', 'Squad not found'));
      }
      const sqData = squadSnap.data() as Squad;

      const memberRef = doc(db, 'squads', squadId, 'members', user.uid);
      const memberSnap = await getDoc(memberRef);

      if (!memberSnap.exists()) {
        await setDoc(memberRef, {
          userId: user.uid,
          squadId,
          displayName: userProfile.displayName.slice(0, 100),
          role: 'member',
          pointsContributed: 0,
          joinedAt: serverTimestamp(),
        });

        await updateDoc(squadRef, {
          memberCount: (sqData.memberCount || 1) + 1,
          updatedAt: serverTimestamp(),
        });
      }

      await updateDoc(doc(db, 'user_profiles', user.uid), {
        activeSquadId: squadId,
        updatedAt: serverTimestamp(),
      });

      showToast(
        t(
          `انضممت إلى "${sqData.name}" بنجاح!`,
          `Joined "${sqData.name}" successfully!`
        ),
        'success'
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `squads/${squadId}/members/${user.uid}`
      );
    }
  };

  const leaveSquad = async () => {
    if (!user || !userProfile || !userProfile.activeSquadId) return;
    const squadId = userProfile.activeSquadId;
    try {
      const memberRef = doc(db, 'squads', squadId, 'members', user.uid);
      const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        await deleteDoc(memberRef);
      }

      const squadRef = doc(db, 'squads', squadId);
      const squadSnap = await getDoc(squadRef);
      if (squadSnap.exists()) {
        const sqData = squadSnap.data() as Squad;
        if (sqData.memberCount > 1) {
          await updateDoc(squadRef, {
            memberCount: sqData.memberCount - 1,
            updatedAt: serverTimestamp(),
          });
        }
      }

      await updateDoc(doc(db, 'user_profiles', user.uid), {
        activeSquadId: '',
        updatedAt: serverTimestamp(),
      });

      showToast(
        t('تمت مغادرة السكواد بنجاح', 'Left Squad successfully'),
        'info'
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `user_profiles/${user.uid}`
      );
    }
  };

  // Helper to fetch Squad members subcollection on demand
  useEffect(() => {
    // Keep getDocs imported and ready for subcollection inspection
    void getDocs;
  }, []);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        user,
        authReady,
        isSeeding,
        isFirestoreSeeded,
        userProfile,
        userPrivate,
        businesses,
        products,
        squads,
        customerOrders,
        merchantOrders,
        cart,
        cartBusiness,
        cartSubtotalSar,
        cartCount,
        pendingCartConflict,
        toastMessage,
        showToast,
        clearToast,
        signInWithGoogle,
        signOutUser,
        seedPilotDatabase,
        addToCart,
        confirmCartSwitch,
        cancelCartSwitch,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        updateOrderStatus,
        saveProduct,
        toggleProductAvailability,
        deleteProduct,
        updateBusinessSettings,
        assignMerchantBusiness,
        updateUserProfileAndPrivate,
        createSquad,
        joinSquad,
        leaveSquad,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
};
