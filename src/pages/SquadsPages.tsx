import React, { useEffect, useMemo, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {
  Award,
  Check,
  Copy,
  LogOut,
  Plus,
  ShieldCheck,
  Trophy,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useApp } from '../context/AppContext';
import { SQUAD_CATEGORY_LABELS } from '../data/seedData';
import { SquadCategory, SquadMember } from '../types';

const SQUAD_CATEGORIES: SquadCategory[] = [
  'Office',
  'University',
  'Friends',
  'Family',
];

// ============================================================================
// 1. SQUADS HUB PAGE (/squads)
// ============================================================================
export const SquadsHubPage: React.FC = () => {
  const {
    lang,
    t,
    user,
    userProfile,
    squads,
    joinSquad,
    leaveSquad,
    signInWithGoogle,
    showToast,
  } = useApp();
  const navigate = useNavigate();

  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const activeSquad = squads.find((s) => s.id === userProfile?.activeSquadId);

  const filteredSquads = useMemo(() => {
    if (selectedCat === 'ALL') return squads;
    return squads.filter((s) => s.category === selectedCat);
  }, [squads, selectedCat]);

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = inviteCodeInput.trim().toUpperCase();
    if (!code) return;
    const match = squads.find((s) => s.inviteCode.toUpperCase() === code);
    if (!match) {
      showToast(
        t(
          'رمز الدعوة غير صحيح، يرجى التأكد من الرمز',
          'Invalid invite code, please check and try again'
        ),
        'error'
      );
      return;
    }
    try {
      setJoiningId(match.id);
      await joinSquad(match.id);
      navigate(`/squads/${match.id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setJoiningId(null);
    }
  };

  const handleDirectJoin = async (squadId: string) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    try {
      setJoiningId(squadId);
      await joinSquad(squadId);
      navigate(`/squads/${squadId}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Header & Create CTA */}
      <div className="bg-[#20252B] text-white rounded-3xl p-8 sm:p-12 border border-[#20252B]/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="text-xs font-semibold text-[#FF6B35]">
            {t(
              'نظام الطلب الجماعي والتنافس الأسبوعي · FOODOO SQUADS',
              'Social Team Ordering & Weekly Competition · FOODOO SQUADS'
            )}
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold leading-tight"
            style={{ textWrap: 'balance' }}
          >
            {t(
              'اطلب مع فريقك، اجمع نقطة مع كل طلب مكتمل، وتصدّر الترتيب الأسبوعي',
              'Order Together, Earn +1 Point per Completed Order, and Top the Weekly Ranks'
            )}
          </h1>
          <p className="text-sm text-white/80 max-w-2xl leading-relaxed">
            {t(
              'يمكن لكل عميل الانضمام إلى سكواد واحد نشط في نفس الوقت (المكتب، الجامعة، الأصدقاء، أو العائلة). الطلبات المكتملة فقط تمنح +1 نقطة، بينما الطلبات الملغاة لا تحتسب.',
              'Each customer can belong to one active Squad at a time (Office, University, Friends, or Family). Every completed order awards +1 Squad point; cancelled orders earn 0 points.'
            )}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/squads/create')}
              className="px-6 py-3 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('إنشاء سكواد جديد', 'Create a New Squad')}</span>
            </button>
            <Link
              to="/leaderboard"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {t('عرض المتصدرين والجوائز', 'Weekly Leaderboard & Rewards')}
            </Link>
          </div>
        </div>

        {/* Join via Invite Code Box */}
        <div className="lg:col-span-4 bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white">
            {t('لديك رمز دعوة لسكواد؟', 'Have a Squad Invite Code?')}
          </h2>
          <p className="text-xs text-white/70">
            {t(
              'أدخل رمز الدعوة (مثال: KAFD-2026 أو KSU-CODE) للانضمام المباشر:',
              'Enter an invite code (e.g. KAFD-2026 or KSU-CODE) to join:'
            )}
          </p>
          <form onSubmit={handleJoinByCode} className="flex gap-2">
            <input
              type="text"
              dir="ltr"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value)}
              placeholder="KAFD-2026"
              className="flex-1 px-3.5 py-2.5 text-sm font-mono-tabular bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B35]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t('انضمام', 'Join')}
            </button>
          </form>
        </div>
      </div>

      {/* Customer's Active Squad Banner (if in a Squad) */}
      {activeSquad && (
        <div className="bg-white rounded-2xl border-2 border-[#FF6B35] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#FF6B35]">
              {t('سكوادك النشط حالياً', 'Your Current Active Squad')} ·{' '}
              {lang === 'ar'
                ? SQUAD_CATEGORY_LABELS[activeSquad.category]?.ar
                : activeSquad.category}
            </div>
            <h2 className="text-2xl font-extrabold text-[#20252B]">
              {activeSquad.name}
            </h2>
            <div className="text-xs text-[#20252B]/70 flex flex-wrap items-center gap-2">
              <span className="tabular-nums font-bold text-[#20252B]">
                {activeSquad.weeklyPoints} / {activeSquad.weeklyGoal}{' '}
                {t('نقطة هذا الأسبوع', 'weekly points')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {activeSquad.memberCount} {t('أعضاء', 'members')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">
                {t('رمز الدعوة:', 'Invite Code:')} {activeSquad.inviteCode}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(`/squads/${activeSquad.id}`)}
              className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              {t('فتح صفحة السكواد ومشاركة الرابط', 'Open Squad & Share Invite Link')}
            </button>
            <button
              onClick={leaveSquad}
              className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200 cursor-pointer"
            >
              {t('مغادرة السكواد', 'Leave Squad')}
            </button>
          </div>
        </div>
      )}

      {/* Filter & Squads Directory */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold text-[#20252B]">
            {t('الفرق النشطة في الرياض', 'Active Squads in Riyadh')}
          </h2>

          <div className="flex items-center gap-1.5 p-1.5 bg-[#20252B]/5 rounded-xl overflow-x-auto">
            <button
              onClick={() => setSelectedCat('ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCat === 'ALL'
                  ? 'bg-[#20252B] text-white'
                  : 'text-[#20252B]/70 hover:text-[#20252B]'
              }`}
            >
              {t('الكل', 'All')}
            </button>
            {SQUAD_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCat === cat
                    ? 'bg-[#20252B] text-white'
                    : 'text-[#20252B]/70 hover:text-[#20252B]'
                }`}
              >
                {lang === 'ar' ? SQUAD_CATEGORY_LABELS[cat].ar : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSquads.map((sq) => {
            const isMember = userProfile?.activeSquadId === sq.id;
            const progressPct = Math.min(
              100,
              Math.round((sq.weeklyPoints / Math.max(1, sq.weeklyGoal)) * 100)
            );
            return (
              <div
                key={sq.id}
                className="bg-white rounded-2xl border border-[#20252B]/10 p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="text-xs text-[#20252B]/60 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#FF6B35]">
                        {lang === 'ar'
                          ? SQUAD_CATEGORY_LABELS[sq.category]?.ar
                          : sq.category}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span className="tabular-nums">
                        {sq.memberCount} {t('أعضاء', 'members')}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono-tabular">{sq.inviteCode}</span>
                    </div>
                    <span className="font-mono-tabular font-extrabold text-[#20252B]">
                      {sq.weeklyPoints} {t('نقطة أسبوعية', 'weekly pts')}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-[#20252B]">
                    {sq.name}
                  </h3>

                  <p className="text-xs text-[#20252B]/70 leading-relaxed">
                    {sq.description}
                  </p>

                  {/* Weekly Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#20252B]/70">
                        {t('التقدم نحو هدف الأسبوع:', 'Weekly Goal Progress:')}
                      </span>
                      <span className="font-mono-tabular font-bold">
                        {sq.weeklyPoints} / {sq.weeklyGoal} ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#20252B]/10">
                      <div
                        className="h-full bg-[#FF6B35] transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#20252B]/10 flex items-center justify-between gap-3">
                  <Link
                    to={`/squads/${sq.id}`}
                    className="text-xs font-bold text-[#20252B]/75 hover:text-[#FF6B35]"
                  >
                    {t('عرض الأعضاء والتفاصيل', 'View Members & Details')}
                  </Link>

                  {isMember ? (
                    <span className="text-xs font-bold text-emerald-700">
                      {t('أنت عضو في هذا السكواد ✓', 'Joined ✓')}
                    </span>
                  ) : (
                    <button
                      disabled={
                        Boolean(userProfile?.activeSquadId) ||
                        joiningId === sq.id
                      }
                      onClick={() => handleDirectJoin(sq.id)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                        userProfile?.activeSquadId
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#FF6B35] hover:bg-[#e85a25] text-white'
                      }`}
                    >
                      {userProfile?.activeSquadId
                        ? t('منضم لسكواد آخر', 'In Another Squad')
                        : t('انضم للسكواد +', 'Join Squad +')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. CREATE SQUAD PAGE (/squads/create)
// ============================================================================
export const CreateSquadPage: React.FC = () => {
  const { lang, t, user, userProfile, createSquad, signInWithGoogle } =
    useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<SquadCategory>('Office');
  const [description, setDescription] = useState('');
  const [weeklyGoal, setWeeklyGoal] = useState(15);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!user) {
      await signInWithGoogle();
      return;
    }
    if (name.trim().length < 2) {
      setErrorMsg(t('يرجى إدخال اسم السكواد', 'Please enter a Squad name'));
      return;
    }

    setSubmitting(true);
    try {
      const squadId = await createSquad({
        name,
        category,
        description:
          description.trim() ||
          t(
            'فريق فودو سكوادز للطلب الجماعي والمكافآت الأسبوعية.',
            'Foodoo Squads team competing for weekly rewards.'
          ),
        weeklyGoal,
      });
      navigate(`/squads/${squadId}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <div className="text-xs font-semibold text-[#FF6B35]">
          {t('تأسيس فريق جديد · FOODOO SQUADS', 'Create a New Team · FOODOO SQUADS')}
        </div>
        <h1 className="text-3xl font-extrabold text-[#20252B]">
          {t('أنشئ سكوادك الخاص وادعُ أصدقاءك', 'Create Your Foodoo Squad')}
        </h1>
      </div>

      {userProfile?.activeSquadId && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold space-y-2">
          <div>
            {t(
              'ملاحظة: أنت حالياً عضو في سكواد نشط. قوانين فودو تسمح بالانتماء لسكواد واحد فقط في نفس الوقت.',
              'Note: You currently belong to an active Squad. A customer can belong to one active Squad at a time.'
            )}
          </div>
          <Link
            to={`/squads/${userProfile.activeSquadId}`}
            className="inline-block text-[#FF6B35] font-bold hover:underline"
          >
            {t('انتقل إلى سكوادك الحالي ←', 'Go to Your Current Squad →')}
          </Link>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#20252B]/10 p-6 sm:p-8 space-y-6"
      >
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#20252B]">
            {t('اسم السكواد *', 'Squad Name *')}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(
              'مثال: فريق مكتب العليا أو شلة الملقا',
              'e.g. Olaya Office Crew or Campus Innovators'
            )}
            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl focus:outline-none focus:border-[#FF6B35]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#20252B]">
            {t('فئة السكواد *', 'Squad Category *')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SQUAD_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`p-4 rounded-xl border text-start transition-colors cursor-pointer ${
                  category === cat
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                    : 'border-[#20252B]/15 hover:border-[#20252B]/30'
                }`}
              >
                <div className="text-sm font-bold text-[#20252B]">
                  {lang === 'ar' ? SQUAD_CATEGORY_LABELS[cat].ar : cat}
                </div>
                <div className="text-xs text-[#20252B]/65 mt-0.5">
                  {lang === 'ar'
                    ? SQUAD_CATEGORY_LABELS[cat].descAr
                    : SQUAD_CATEGORY_LABELS[cat].descEn}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#20252B]">
            {t('وصف السكواد', 'Squad Description')}
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t(
              'اكتب نبذة قصيرة عن فريقك وأوقات طلباتكم المفضلة...',
              'Brief description of your team and ordering routine...'
            )}
            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl focus:outline-none focus:border-[#FF6B35]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#20252B]">
            {t(
              'الهدف الأسبوعي للطلبات المكتملة (نقاط)',
              'Weekly Completed Orders Target (Points)'
            )}
          </label>
          <input
            type="number"
            min={5}
            max={100}
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(Number(e.target.value))}
            className="w-full px-4 py-2.5 text-sm font-mono-tabular bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl focus:outline-none focus:border-[#FF6B35]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/squads')}
            className="px-4 py-2.5 text-xs font-bold text-[#20252B]/70 cursor-pointer"
          >
            {t('إلغاء', 'Cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting || Boolean(userProfile?.activeSquadId)}
            className="px-6 py-3 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting
              ? t('جاري الإنشاء...', 'Creating Squad...')
              : t('إنشاء السكواد وتوليد رابط الدعوة', 'Create Squad & Generate Link')}
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// 3. SQUAD DETAIL & INVITE PAGE (/squads/:id)
// ============================================================================
export const SquadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const inviteParam = searchParams.get('invite');

  const {
    lang,
    t,
    user,
    userProfile,
    squads,
    customerOrders,
    joinSquad,
    leaveSquad,
    signInWithGoogle,
    showToast,
  } = useApp();
  const navigate = useNavigate();

  const [members, setMembers] = useState<SquadMember[]>([]);
  const [copied, setCopied] = useState(false);

  const squad = squads.find((s) => s.id === id);

  useEffect(() => {
    if (!id) return;
    const membersQuery = query(
      collection(db, 'squads', id, 'members'),
      where('squadId', '==', id)
    );
    const unsub = onSnapshot(
      membersQuery,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as SquadMember);
        list.sort((a, b) => b.pointsContributed - a.pointsContributed);
        setMembers(list);
      },
      (error) => {
        console.warn('Squad members listener:', error.message);
        if (user) {
          handleFirestoreError(
            error,
            OperationType.LIST,
            `squads/${id}/members`
          );
        }
      }
    );
    return () => unsub();
  }, [id, user]);

  if (!squad) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold">
          {t('السكواد غير موجود', 'Squad Not Found')}
        </h1>
        <Link
          to="/squads"
          className="text-sm font-bold text-[#FF6B35] hover:underline"
        >
          {t('العودة إلى قائمة السكوادز', 'Back to Squads')}
        </Link>
      </div>
    );
  }

  const isMember = userProfile?.activeSquadId === squad.id;
  const shareableUrl = `${window.location.origin}/squads/${squad.id}?invite=${squad.inviteCode}`;
  const progressPct = Math.min(
    100,
    Math.round((squad.weeklyPoints / Math.max(1, squad.weeklyGoal)) * 100)
  );

  const mySquadOrders = customerOrders.filter((o) => o.squadId === squad.id);

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      showToast(
        t('تم نسخ رابط دعوة السكواد!', 'Shareable Squad invite link copied!'),
        'success'
      );
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast(shareableUrl, 'info');
    }
  };

  const handleJoin = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    try {
      await joinSquad(squad.id);
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {inviteParam && !isMember && (
        <div className="bg-[#FF6B35] text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-bold uppercase tracking-wider">
              {t('دعوة انضمام خاصة', 'Squad Invitation Link')}
            </div>
            <div className="text-base font-extrabold">
              {t(
                `تمت دعوتك للانضمام إلى "${squad.name}" برمز (${inviteParam})`,
                `You've been invited to join "${squad.name}" (Code: ${inviteParam})`
              )}
            </div>
          </div>
          <button
            onClick={handleJoin}
            className="px-5 py-2.5 bg-[#20252B] hover:bg-black text-white text-xs font-bold rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('اقبل الدعوة وانضم الآن', 'Accept Invite & Join Squad')}
          </button>
        </div>
      )}

      {/* Squad Main Card */}
      <div className="bg-[#20252B] text-white rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs text-[#FF6B35] font-bold">
              <span>
                {lang === 'ar'
                  ? SQUAD_CATEGORY_LABELS[squad.category]?.ar
                  : squad.category}
              </span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono-tabular">
                {t('رمز الدعوة:', 'Invite Code:')} {squad.inviteCode}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold">{squad.name}</h1>
            <p className="text-sm text-white/75 max-w-2xl">
              {squad.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isMember ? (
              <>
                <button
                  onClick={() => navigate('/restaurants')}
                  className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {t('اطلب الآن واكسب +1 نقطة', 'Order Now (+1 Squad Pt)')}
                </button>
                <button
                  onClick={leaveSquad}
                  className="px-4 py-2.5 bg-white/10 hover:bg-red-500/20 text-red-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  {t('مغادرة السكواد', 'Leave')}
                </button>
              </>
            ) : (
              <button
                onClick={handleJoin}
                className="px-6 py-3 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-sm font-bold rounded-xl cursor-pointer"
              >
                {t('انضم إلى هذا السكواد', 'Join This Squad')}
              </button>
            )}
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-white/60 mb-0.5">
              {t(
                'رابط الدعوة القابل للمشاركة مع الأصدقاء:',
                'Shareable Squad Invite Link:'
              )}
            </div>
            <div
              dir="ltr"
              className="text-xs font-mono-tabular text-[#FF6B35] truncate"
            >
              {shareableUrl}
            </div>
          </div>
          <button
            onClick={handleCopyInvite}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('تم النسخ!', 'Copied!')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t('نسخ رابط الدعوة', 'Copy Invite Link')}</span>
              </>
            )}
          </button>
        </div>

        {/* Squad Progress Bar & Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-white/65">
              {t('النقاط الأسبوعية (الطلبات المكتملة)', 'Weekly Points')}
            </div>
            <div className="text-2xl font-extrabold text-[#FF6B35] font-mono-tabular mt-1">
              {squad.weeklyPoints} {t('نقطة', 'pts')}
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-white/65">
              {t('إجمالي النقاط التاريخي', 'Total All-Time Points')}
            </div>
            <div className="text-2xl font-extrabold text-white font-mono-tabular mt-1">
              {squad.totalPoints} {t('نقطة', 'pts')}
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-white/65">
              {t('تقدم الهدف الأسبوعي', 'Weekly Target Progress')}
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono-tabular mt-1">
              {squad.weeklyPoints} / {squad.weeklyGoal} ({progressPct}%)
            </div>
          </div>
        </div>
      </div>

      {/* Members List & Squad Order Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#20252B] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF6B35]" />
              <span>{t('أعضاء السكواد المسجلون', 'Squad Members')}</span>
            </h2>
            <span className="text-xs font-mono-tabular font-bold text-[#20252B]/60">
              {squad.memberCount} {t('عضو', 'members')}
            </span>
          </div>

          <div className="divide-y divide-[#20252B]/10">
            {members.length === 0 ? (
              <div className="py-4 text-xs text-[#20252B]/65">
                {t('القائد المؤسس:', 'Founder Captain:')} {squad.creatorName}
              </div>
            ) : (
              members.map((mem) => (
                <div
                  key={mem.userId}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-bold text-[#20252B]">
                      {mem.displayName}
                    </div>
                    <div className="text-xs text-[#20252B]/60">
                      {mem.role === 'captain'
                        ? t('قائد السكواد (Captain)', 'Squad Captain')
                        : t('عضو فاعل (Member)', 'Squad Member')}
                    </div>
                  </div>
                  <div className="font-mono-tabular text-xs font-bold text-[#FF6B35]">
                    {mem.pointsContributed} {t('نقطة مساهمة', 'pts contributed')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Squad Rewards & My Recent Squad Orders */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-[#20252B] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FF6B35]" />
              <span>
                {t('جوائز ومكافآت السكواد الأسبوعية', 'Weekly Squad Rewards')}
              </span>
            </h2>
            <div className="space-y-3 text-xs text-[#20252B]/80">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#20252B]/10">
                <div className="font-bold text-[#20252B]">
                  {t(
                    '1. المركز الأول أسبوعياً: خصم جماعي 25% + توصيل مجاني',
                    '1. 1st Place Weekly: 25% Squad Discount + Free Delivery'
                  )}
                </div>
                <div className="text-[#20252B]/65 mt-0.5">
                  {t(
                    'يسري لجميع أعضاء السكواد لمدة 7 أيام في مطعم ومقهى فودو.',
                    'Valid for all Squad members for 7 days across FOODOO stores.'
                  )}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#20252B]/10">
                <div className="font-bold text-[#20252B]">
                  {t(
                    `2. تحقيق هدف السكواد (${squad.weeklyGoal} طلبات مكتملة): رصيد 15 ر.س`,
                    `2. Hitting Weekly Goal (${squad.weeklyGoal} completed orders): 15 SAR Credit`
                  )}
                </div>
                <div className="text-[#20252B]/65 mt-0.5">
                  {t(
                    'يُفتح تلقائياً عند وصول السكواد لهدفه الأسبوعي من الطلبات المكتملة.',
                    'Unlocked automatically when your Squad reaches its weekly order goal.'
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-3">
            <h3 className="text-base font-extrabold text-[#20252B]">
              {t('طلباتي المساهمة في هذا السكواد', 'My Orders in This Squad')}
            </h3>
            {mySquadOrders.length === 0 ? (
              <p className="text-xs text-[#20252B]/65">
                {t(
                  'اطلب الآن وأنت منضم لهذا السكواد ليظهر تقدم طلباتك هنا وتكسب +1 نقطة عند الاكتمال.',
                  'Place an order while joined to this Squad to track your point contributions here.'
                )}
              </p>
            ) : (
              <div className="divide-y divide-[#20252B]/10 text-xs">
                {mySquadOrders.map((ord) => (
                  <Link
                    key={ord.id}
                    to={`/orders/${ord.id}`}
                    className="py-2.5 flex items-center justify-between hover:text-[#FF6B35]"
                  >
                    <div>
                      <span className="font-mono-tabular font-bold">
                        {ord.orderNumber}
                      </span>{' '}
                      ·{' '}
                      <span>
                        {lang === 'ar'
                          ? ord.businessNameAr
                          : ord.businessNameEn}
                      </span>
                    </div>
                    <span className="font-bold">
                      {ord.squadPointAwarded
                        ? t('+1 نقطة مكتسبة ✓', '+1 Point Earned ✓')
                        : ord.status === 'cancelled'
                        ? t('ملغي (0 نقطة)', 'Cancelled (0 pt)')
                        : t('قيد التنفيذ...', 'In Progress...')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. WEEKLY LEADERBOARD PAGE (/leaderboard)
// ============================================================================
export const LeaderboardPage: React.FC = () => {
  const { lang, t, squads } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const rankedSquads = useMemo(() => {
    const list =
      categoryFilter === 'ALL'
        ? [...squads]
        : squads.filter((s) => s.category === categoryFilter);
    return list.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
  }, [squads, categoryFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#FF6B35]">
            {t(
              'المنافسة الأسبوعية لفرق الرياض · FOODOO LEADERBOARD',
              'Riyadh Weekly Squad Competition · FOODOO LEADERBOARD'
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-[#20252B]">
            {t(
              'جدول ترتيب فودو سكوادز والجوائز',
              'Weekly Squad Rankings & Competition Rewards'
            )}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-[#20252B]/5 rounded-xl overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-[#20252B] text-white'
                : 'text-[#20252B]/70 hover:text-[#20252B]'
            }`}
          >
            {t('كل الفئات', 'All Categories')}
          </button>
          {SQUAD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#20252B] text-white'
                  : 'text-[#20252B]/70 hover:text-[#20252B]'
              }`}
            >
              {lang === 'ar' ? SQUAD_CATEGORY_LABELS[cat].ar : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#20252B] text-white rounded-2xl p-6 space-y-2 border border-[#20252B]/10">
          <div className="text-xs font-bold text-[#FF6B35]">
            {t('جائزة المركز الأول (01)', '1st Place Weekly Reward')}
          </div>
          <div className="text-xl font-extrabold">
            {t('خصم جماعي 25% + توصيل مجاني', '25% Squad Discount + Free Delivery')}
          </div>
          <p className="text-xs text-white/75 leading-relaxed">
            {t(
              'يحصل جميع أعضاء السكواد المتصدر أسبوعياً على خصم 25% وتوصيل مجاني غير محدود لمدة 7 أيام.',
              'All members of the #1 weekly Squad receive 25% off and unlimited free delivery for 7 days.'
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-2 border border-[#20252B]/10">
          <div className="text-xs font-bold text-[#FF6B35]">
            {t('جائزة المركز الثاني (02)', '2nd Place Weekly Reward')}
          </div>
          <div className="text-xl font-extrabold text-[#20252B]">
            {t('خصم 15% + قهوة أو حلى مجاني', '15% Off + Free Specialty Coffee/Dessert')}
          </div>
          <p className="text-xs text-[#20252B]/70 leading-relaxed">
            {t(
              'خصم 15% على طلبات المطعم والمقهى مع مشروب قهوة مختصة مجاني لكل عضو.',
              '15% discount across both pilot stores plus a complimentary specialty coffee per member.'
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-2 border border-[#20252B]/10">
          <div className="text-xs font-bold text-[#FF6B35]">
            {t('جائزة المركز الثالث (03)', '3rd Place Weekly Reward')}
          </div>
          <div className="text-xl font-extrabold text-[#20252B]">
            {t('خصم جماعي 10% للأعضاء', '10% Squad Voucher for All Members')}
          </div>
          <p className="text-xs text-[#20252B]/70 leading-relaxed">
            {t(
              'قسيمة خصم فورية بنسبة 10% على جميع الطلبات للأسبوع التالي.',
              'Instant 10% reward voucher valid on all orders for the following week.'
            )}
          </p>
        </div>
      </div>

      {/* High-Density Leaderboard Table with Tabular Numerals */}
      <div className="bg-white rounded-2xl border border-[#20252B]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#20252B]/10 text-xs text-[#20252B]/65">
              <tr>
                <th className="py-3.5 px-5 text-start font-bold">
                  {t('المركز', 'Rank')}
                </th>
                <th className="py-3.5 px-5 text-start font-bold">
                  {t('اسم السكواد', 'Squad Name')}
                </th>
                <th className="py-3.5 px-5 text-start font-bold">
                  {t('الفئة', 'Category')}
                </th>
                <th className="py-3.5 px-5 text-end font-bold">
                  {t('الأعضاء', 'Members')}
                </th>
                <th className="py-3.5 px-5 text-end font-bold">
                  {t('النقاط الأسبوعية', 'Weekly Points')}
                </th>
                <th className="py-3.5 px-5 text-end font-bold">
                  {t('الإجمالي الكلي', 'Total Points')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20252B]/10">
              {rankedSquads.map((sq, index) => (
                <tr
                  key={sq.id}
                  className="hover:bg-[#FAF8F5]/70 transition-colors"
                >
                  <td className="py-4 px-5 font-mono-tabular font-extrabold text-[#FF6B35]">
                    #{index + 1}
                  </td>
                  <td className="py-4 px-5">
                    <Link
                      to={`/squads/${sq.id}`}
                      className="font-bold text-[#20252B] hover:text-[#FF6B35]"
                    >
                      {sq.name}
                    </Link>
                    <div className="text-xs text-[#20252B]/55">
                      {t('القائد:', 'Captain:')} {sq.creatorName}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-xs text-[#20252B]/75">
                    {lang === 'ar'
                      ? SQUAD_CATEGORY_LABELS[sq.category]?.ar
                      : sq.category}
                  </td>
                  <td className="py-4 px-5 text-end font-mono-tabular">
                    {sq.memberCount}
                  </td>
                  <td className="py-4 px-5 text-end font-mono-tabular font-extrabold text-[#20252B]">
                    {sq.weeklyPoints}
                  </td>
                  <td className="py-4 px-5 text-end font-mono-tabular text-[#20252B]/70">
                    {sq.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. CUSTOMER PROFILE & PILOT ROLE ASSIGNMENT (/profile)
// ============================================================================
export const ProfilePage: React.FC = () => {
  const {
    lang,
    t,
    user,
    userProfile,
    userPrivate,
    signInWithGoogle,
    signOutUser,
    updateUserProfileAndPrivate,
    assignMerchantBusiness,
    showToast,
  } = useApp();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) setDisplayName(userProfile.displayName);
    if (userPrivate) {
      setPhone(userPrivate.phone);
      setDefaultAddress(userPrivate.defaultAddress);
    }
  }, [userProfile, userPrivate]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#20252B]">
          {t('الملف الشخصي وإعدادات التجربة', 'Profile & Pilot Role Settings')}
        </h1>
        <p className="text-sm text-[#20252B]/70">
          {t(
            'سجّل الدخول بحساب Google لإدارة ملفك الشخصي، عنوانك في الرياض، والتبديل بين صلاحيات العميل ومدير المطعم أو المقهى.',
            'Sign in with Google to manage your profile, Riyadh address, and switch between Customer and Merchant Manager roles.'
          )}
        </p>
        <button
          onClick={signInWithGoogle}
          className="px-6 py-3 bg-[#FF6B35] text-white text-sm font-bold rounded-xl cursor-pointer"
        >
          {t('تسجيل الدخول بحساب Google', 'Sign in with Google')}
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfileAndPrivate({
        displayName,
        phone,
        defaultAddress,
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#FF6B35]">
            {t('حسابك الموثق عبر Firebase Auth', 'Verified Firebase Auth Account')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20252B]">
            {t('الملف الشخصي وصلاحيات التجربة', 'My Profile & Pilot Role')}
          </h1>
        </div>
        <button
          onClick={signOutUser}
          className="px-4 py-2 bg-white border border-[#20252B]/15 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('تسجيل الخروج', 'Sign Out')}</span>
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-5">
          <div className="text-xs text-[#20252B]/60">
            {t('الطلبات المكتملة', 'Completed Orders')}
          </div>
          <div className="text-2xl font-extrabold text-[#20252B] font-mono-tabular mt-1">
            {userProfile?.completedOrdersCount || 0}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-5">
          <div className="text-xs text-[#20252B]/60">
            {t('نقاط السكواد المساهمة', 'Squad Points Contributed')}
          </div>
          <div className="text-2xl font-extrabold text-[#FF6B35] font-mono-tabular mt-1">
            {userProfile?.squadPointsContributed || 0}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#20252B]/10 p-5">
          <div className="text-xs text-[#20252B]/60">
            {t('الصلاحية التجارية المعينة', 'Assigned Merchant Business')}
          </div>
          <div className="text-sm font-extrabold text-[#20252B] mt-2">
            {userProfile?.assignedBusinessId === 'foodoo-restaurant'
              ? t('مدير مطعم فودو التجريبي', 'FOODOO Restaurant Manager')
              : userProfile?.assignedBusinessId === 'foodoo-cafe'
              ? t('مدير مقهى فودو التجريبي', 'FOODOO Café Manager')
              : t('عميل فقط', 'Customer Only')}
          </div>
        </div>
      </div>

      {/* Pilot Merchant Role Switcher (Strict Business Isolation Selector) */}
      <div className="bg-[#20252B] text-white rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#FF6B35] text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>
            {t(
              'اختبار عزل البيانات والصلاحيات (Role-Based Access Control)',
              'Pilot Role Assignment & Business Data Isolation'
            )}
          </span>
        </div>
        <p className="text-xs text-white/80 leading-relaxed">
          {t(
            'كل مدير منشأة يمكنه فقط إدارة المنشأة المعينة له (مطعم فودو التجريبي أو مقهى فودو التجريبي) مع عزل تام للبيانات عبر قواعد أمان Firestore. اختر المنشأة التي ترغب باختبار لوحة التحكم الخاصة بها:',
            'Each merchant can manage only their assigned business. Restaurant and café data remain strictly isolated in Firestore Security Rules. Select which business you want to manage right now:'
          )}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <button
            onClick={async () => {
              await assignMerchantBusiness('foodoo-restaurant');
              navigate('/merchant');
            }}
            className={`p-4 rounded-xl border text-start transition-colors cursor-pointer ${
              userProfile?.assignedBusinessId === 'foodoo-restaurant'
                ? 'border-[#FF6B35] bg-[#FF6B35]/15'
                : 'border-white/15 hover:bg-white/5'
            }`}
          >
            <div className="text-sm font-extrabold text-white">
              {t(
                'إدارة: مطعم فودو التجريبي',
                'Manage: FOODOO Restaurant Demo'
              )}
            </div>
            <div className="text-xs text-white/65 mt-1">
              {t(
                'صلاحية حصرية لطلبات ومنيو وإحصائيات المطعم فقط',
                'Exclusive access to Restaurant orders, menu CRUD, and stats'
              )}
            </div>
          </button>

          <button
            onClick={async () => {
              await assignMerchantBusiness('foodoo-cafe');
              navigate('/merchant');
            }}
            className={`p-4 rounded-xl border text-start transition-colors cursor-pointer ${
              userProfile?.assignedBusinessId === 'foodoo-cafe'
                ? 'border-[#FF6B35] bg-[#FF6B35]/15'
                : 'border-white/15 hover:bg-white/5'
            }`}
          >
            <div className="text-sm font-extrabold text-white">
              {t('إدارة: مقهى فودو التجريبي', 'Manage: FOODOO Café Demo')}
            </div>
            <div className="text-xs text-white/65 mt-1">
              {t(
                'صلاحية حصرية لطلبات ومنيو وإحصائيات المقهى فقط',
                'Exclusive access to Café orders, menu CRUD, and stats'
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Personal & Isolated PII Settings Form */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl border border-[#20252B]/10 p-6 space-y-5"
      >
        <h2 className="text-lg font-extrabold text-[#20252B]">
          {t(
            'بياناتي الشخصية وعنوان التوصيل (معزولة في /user_private)',
            'Personal Info & Default Delivery Address (Isolated in /user_private)'
          )}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#20252B]">
              {t('الاسم الظاهر', 'Display Name')}
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#20252B]">
              {t('رقم الجوال السعودي', 'Saudi Mobile Number')}
            </label>
            <input
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-mono-tabular bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#20252B]">
            {t('عنوان التوصيل الافتراضي في الرياض', 'Default Riyadh Address')}
          </label>
          <input
            type="text"
            value={defaultAddress}
            onChange={(e) => setDefaultAddress(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#20252B]/15 rounded-xl"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          {saving
            ? t('جاري الحفظ...', 'Saving...')
            : t('حفظ التغييرات', 'Save Changes')}
        </button>
      </form>
    </div>
  );
};
