"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PauseCircle, PlayCircle, Search, Users } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import forms from "@/components/dashboard/forms.module.css";
import DataTable, { type Column } from "./ui/DataTable";
import EmptyState from "./ui/EmptyState";
import ErrorState from "./ui/ErrorState";
import LoadingState from "./ui/LoadingState";
import StatusBadge from "./ui/StatusBadge";
import styles from "./admin.module.css";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  store: { nameAr: string } | null;
};
type UsersResponse = { users: UserRow[]; pagination: { total: number } };
type UserAction = { action: "suspend"; reason: string } | { action: "reactivate" };

const roles: Record<string, { label: string; color: string; bg: string }> = {
  BUYER: { label: "مشتري", color: t.colors.text.mid, bg: t.colors.cream.bg },
  SELLER: { label: "تاجر", color: t.colors.primary[800], bg: t.colors.primary[100] },
  ADMIN: { label: "مدير", color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
  SUPER_ADMIN: { label: "مدير عام", color: t.colors.semantic.warning, bg: t.colors.semantic.warningBg },
};
const countFormat = new Intl.NumberFormat("ar-SA");

export default function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function load(term: string) {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ limit: "20", ...(term ? { search: term } : {}) });
      const response = await api.get<UsersResponse>(`/api/admin/users?${params}`);
      setUsers(response.users);
      setTotal(response.pagination.total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(""); }, []);

  function findUsers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = search.trim();
    setAppliedSearch(term);
    void load(term);
  }

  async function updateUser(user: UserRow, body: UserAction) {
    setBusy(user.id);
    setMessage(null);
    try {
      await api.post(`/api/admin/users/${user.id}/suspend`, body);
      await load(appliedSearch);
      setMessage({ type: "success", text: body.action === "suspend" ? "أُوقف الحساب." : "أُعيد تفعيل الحساب." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "تعذّر تنفيذ الإجراء." });
    } finally {
      setBusy(null);
    }
  }

  const columns: Column<UserRow>[] = [
    { key: "name", label: "الاسم", render: user => <strong>{user.name || "بدون اسم"}</strong> },
    { key: "contact", label: "التواصل", render: user => <span className={styles.userContact}>
      <bdi dir="ltr">{user.email}</bdi>{user.phone && <bdi dir="ltr">{user.phone}</bdi>}
    </span> },
    { key: "store", label: "المتجر", render: user => user.store?.nameAr ?? "—" },
    { key: "role", label: "الدور", render: user => {
      const badge = roles[user.role];
      return badge ? <StatusBadge {...badge} /> : <bdi>{user.role}</bdi>;
    } },
    { key: "status", label: "الحالة", render: user => user.isActive
      ? <StatusBadge label="نشط" color={t.colors.semantic.success} bg={t.colors.semantic.successBg} />
      : <StatusBadge label="موقوف" color={t.colors.semantic.danger} bg={t.colors.semantic.dangerBg} /> },
    { key: "action", label: "الإجراء", render: user => <button type="button"
      className={`${forms.btnSm} ${styles.userAction}`} disabled={busy !== null}
      aria-label={user.isActive ? "إيقاف المستخدم" : "تفعيل المستخدم"}
      onClick={() => {
        if (!user.isActive) {
          void updateUser(user, { action: "reactivate" });
          return;
        }
        const reason = window.prompt("سبب الإيقاف؟")?.trim();
        if (reason) void updateUser(user, { action: "suspend", reason });
      }}>
      {user.isActive ? <PauseCircle size={15} aria-hidden="true" /> : <PlayCircle size={15} aria-hidden="true" />}
      {busy === user.id ? "جارٍ الحفظ…" : user.isActive ? "إيقاف" : "تفعيل"}
    </button> },
  ];

  return <section className={styles.usersPanel} aria-label="إدارة المستخدمين">
    <div className={styles.usersHeader}>
      <form className={styles.usersSearch} onSubmit={findUsers} role="search">
        <input value={search} onChange={event => setSearch(event.target.value)}
          placeholder="الاسم أو البريد الإلكتروني" aria-label="البحث عن مستخدم" />
        <button type="submit" className={`${forms.btnSm} ${forms.btnPrimary}`} disabled={loading || busy !== null}>
          <Search size={15} aria-hidden="true" /> بحث
        </button>
      </form>
      {!loading && !error && <span className={styles.usersCount}>{countFormat.format(total)} مستخدم</span>}
    </div>
    {message && <p role={message.type === "error" ? "alert" : "status"} className={message.type === "error" ? forms.err : undefined}>{message.text}</p>}
    {loading ? <LoadingState label="جارٍ تحميل المستخدمين…" />
      : error ? <ErrorState message="تعذّر تحميل المستخدمين." onRetry={() => void load(appliedSearch)} />
      : users.length ? <DataTable rows={users} columns={columns} />
      : <EmptyState icon={Users} message={appliedSearch ? "لم نجد مستخدمين مطابقين للبحث." : "لا يوجد مستخدمون."} />}
  </section>;
}
