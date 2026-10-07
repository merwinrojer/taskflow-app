import React, {useCallback, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

type Priority = 'Low' | 'Medium' | 'High';
type Status = 'all' | 'pending' | 'completed';
type Sort = 'smart' | 'priority' | 'deadline' | 'createdAt';

interface User {
  id: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  deadline: string | null;
  completed: boolean;
  createdAt: string;
}

interface TaskDraft {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  deadline: string | null;
}

interface TaskList {
  tasks: Task[];
  total: number;
  stats: {total: number; completed: number; pending: number};
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'taskflow.web.authToken';
const EMPTY_DRAFT: TaskDraft = {
  title: '',
  description: '',
  priority: 'Medium',
  category: '',
  deadline: null,
};

async function api<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {...options, headers});
  } catch {
    throw new Error(`Cannot reach the TaskFlow API at ${API_BASE_URL}. Start the backend and retry.`);
  }

  const data = (await response.json().catch(() => ({}))) as T & {error?: string};
  if (!response.ok) throw new Error(data.error ?? `Request failed (${response.status})`);
  return data;
}

function formatDate(value: string | null): string {
  if (!value) return 'No deadline';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Invalid date'
    : date.toLocaleString([], {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'});
}

function AuthScreen({onAuthenticated}: {onAuthenticated: (token: string, user: User) => void}) {
  const [registering, setRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await api<{token: string; user: User}>(
        registering ? '/auth/register' : '/auth/login',
        undefined,
        {method: 'POST', body: JSON.stringify({email, password})},
      );
      onAuthenticated(result.token, result.user);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">T</div>
        <p className="eyebrow">TASKFLOW WEB DEMO</p>
        <h1>{registering ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted">Sign in to manage your tasks in the browser.</p>
        <form onSubmit={submit} className="auth-form">
          <label>
            Email
            <input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" autoComplete={registering ? 'new-password' : 'current-password'} minLength={registering ? 8 : undefined} required value={password} onChange={event => setPassword(event.target.value)} />
          </label>
          {error && <p className="error-banner" role="alert">{error}</p>}
          <button className="primary-button full-width" disabled={busy}>
            {busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <button className="text-button auth-switch" onClick={() => {setRegistering(!registering); setError('');}}>
          {registering ? 'Already registered? Sign in' : 'New to TaskFlow? Create an account'}
        </button>
      </section>
    </main>
  );
}

function TaskDialog({
  task,
  onClose,
  onSave,
}: {
  task: Task | null;
  onClose: () => void;
  onSave: (draft: TaskDraft, id?: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<TaskDraft>(() => task ? {
    title: task.title,
    description: task.description,
    priority: task.priority,
    category: task.category,
    deadline: task.deadline,
  } : EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave(draft, task?._id);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save task');
    } finally {
      setBusy(false);
    }
  }

  const localDeadline = draft.deadline
    ? new Date(new Date(draft.deadline).getTime() - new Date(draft.deadline).getTimezoneOffset() * 60_000)
        .toISOString().slice(0, 16)
    : '';

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={event => {if (event.target === event.currentTarget) onClose();}}>
      <section className="task-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-heading">
          <div><p className="eyebrow">TASK DETAILS</p><h2 id="dialog-title">{task ? 'Edit task' : 'Create a task'}</h2></div>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} className="task-form">
          <label className="wide-field">Title<input autoFocus maxLength={120} required value={draft.title} onChange={event => setDraft({...draft, title: event.target.value})} placeholder="What needs to get done?" /></label>
          <label className="wide-field">Description<textarea maxLength={2000} rows={3} value={draft.description} onChange={event => setDraft({...draft, description: event.target.value})} placeholder="Add a few details…" /></label>
          <label>Priority<select value={draft.priority} onChange={event => setDraft({...draft, priority: event.target.value as Priority})}><option>Low</option><option>Medium</option><option>High</option></select></label>
          <label>Category<input maxLength={40} value={draft.category} onChange={event => setDraft({...draft, category: event.target.value})} placeholder="e.g. Work" /></label>
          <label className="wide-field">Deadline<input type="datetime-local" value={localDeadline} onChange={event => setDraft({...draft, deadline: event.target.value ? new Date(event.target.value).toISOString() : null})} /></label>
          {error && <p className="error-banner wide-field" role="alert">{error}</p>}
          <div className="dialog-actions wide-field"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button></div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? '');
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({total: 0, pending: 0, completed: 0});
  const [status, setStatus] = useState<Status>('all');
  const [sort, setSort] = useState<Sort>('smart');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<{open: boolean; task: Task | null}>({open: false, task: null});

  const loadTasks = useCallback(async (activeToken: string, cancelled?: () => boolean) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({status, sort});
      if (search.trim()) params.set('search', search.trim());
      const result = await api<TaskList>(`/tasks?${params}`, activeToken);
      if (cancelled?.()) return;
      setTasks(result.tasks);
      setStats(result.stats);
    } catch (cause) {
      if (cancelled?.()) return;
      const message = cause instanceof Error ? cause.message : 'Unable to load tasks';
      setError(message);
      if (message.includes('Invalid or expired token') || message.includes('Authentication required')) logout();
    } finally {
      if (!cancelled?.()) setLoading(false);
    }
  }, [status, sort, search]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      try {
        const result = await api<{user: User}>('/auth/me', token);
        if (!cancelled) setUser(result.user);
      } catch (cause) {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken('');
          setUser(null);
          setError(cause instanceof Error ? cause.message : 'Your session could not be restored');
        }
      }
    })();
    return () => {cancelled = true;};
  }, [token]);

  useEffect(() => {
    if (!token || !user) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {void loadTasks(token, () => cancelled);}, search ? 250 : 0);
    return () => {cancelled = true; window.clearTimeout(timer);};
  }, [token, user, status, sort, search, loadTasks]);

  function acceptAuth(nextToken: string, nextUser: User) {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
    setError('');
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setUser(null);
    setTasks([]);
    setStats({total: 0, pending: 0, completed: 0});
  }

  async function saveTask(draft: TaskDraft, id?: string) {
    await api<{task: Task}>(id ? `/tasks/${id}` : '/tasks', token, {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(draft),
    });
    await loadTasks(token);
  }

  async function toggleTask(task: Task) {
    try {
      await api(`/tasks/${task._id}/complete`, token, {method: 'PATCH'});
      await loadTasks(token);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update task');
    }
  }

  async function deleteTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try {
      await api(`/tasks/${task._id}`, token, {method: 'DELETE'});
      await loadTasks(token);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete task');
    }
  }

  if (!token || !user) return <AuthScreen onAuthenticated={acceptAuth} />;

  const completion = stats.total ? Math.round(stats.completed * 100 / stats.total) : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="TaskFlow home"><span className="brand-mark small">T</span><span>taskflow</span></a>
        <p className="sidebar-label">WORKSPACE</p>
        <button className={`nav-item ${status === 'all' ? 'active' : ''}`} onClick={() => setStatus('all')}><span>▦</span>All tasks</button>
        <button className={`nav-item ${status === 'pending' ? 'active' : ''}`} onClick={() => setStatus('pending')}><span>◷</span>Pending</button>
        <button className={`nav-item ${status === 'completed' ? 'active' : ''}`} onClick={() => setStatus('completed')}><span>✓</span>Completed</button>
        <div className="sidebar-bottom"><div className="avatar">{user.email.slice(0, 1).toUpperCase()}</div><div className="user-info"><strong>{user.email}</strong><span>Personal workspace</span></div><button className="icon-button logout" title="Sign out" aria-label="Sign out" onClick={logout}>↪</button></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div><span className="breadcrumb">Workspace</span><span className="breadcrumb-separator">/</span><strong>Tasks</strong></div><div className="topbar-right"><span className="live-badge"><i /> API connected</span><span className="avatar top-avatar">{user.email.slice(0, 1).toUpperCase()}</span></div></header>
        <section className="content">
          <div className="page-heading"><div><p className="eyebrow">{new Date().toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'})}</p><h1>My tasks<span className="task-count">{stats.total}</span></h1><p className="muted">Make today count. One task at a time.</p></div><button className="primary-button create-button" onClick={() => setDialog({open: true, task: null})}><span>＋</span> New task</button></div>
          <section className="stats-grid" aria-label="Task statistics">
            <article className="stat-card"><div className="stat-icon purple">▦</div><p>Total tasks</p><strong>{stats.total}</strong><span className="stat-hint">In your workspace</span></article>
            <article className="stat-card"><div className="stat-icon amber">◷</div><p>In progress</p><strong>{stats.pending}</strong><span className="stat-hint">Ready when you are</span></article>
            <article className="stat-card"><div className="stat-icon green">✓</div><p>Completed</p><strong>{stats.completed}</strong><span className="stat-hint">{completion}% completion rate</span></article>
          </section>
          <section className="tasks-panel">
            <div className="panel-heading"><div><h2>Task list</h2><p className="muted">Stay focused on what matters.</p></div><button className="secondary-button refresh-button" onClick={() => void loadTasks(token)} disabled={loading}>↻ <span>Refresh</span></button></div>
            <div className="toolbar"><label className="search-box"><span>⌕</span><input aria-label="Search tasks" placeholder="Search tasks…" value={search} onChange={event => setSearch(event.target.value)} /><kbd>/</kbd></label><label className="sort-control"><span>Sort by</span><select value={sort} onChange={event => setSort(event.target.value as Sort)}><option value="smart">Smart priority</option><option value="priority">Priority</option><option value="deadline">Deadline</option><option value="createdAt">Created date</option></select></label></div>
            {error && <div className="error-banner" role="alert">{error} <button className="text-button" onClick={() => void loadTasks(token)}>Retry</button></div>}
            {loading ? <div className="loading-state"><span className="spinner" />Loading tasks…</div> : tasks.length === 0 ? <div className="empty-state"><div className="empty-icon">✦</div><h3>{search ? 'No matching tasks' : status === 'completed' ? 'Nothing completed yet' : 'Your task list is clear'}</h3><p>{search ? 'Try another search term.' : 'Add a task to get started and keep your day moving.'}</p>{!search && <button className="primary-button" onClick={() => setDialog({open: true, task: null})}>Create your first task</button>}</div> : (
              <div className="task-list">
                {tasks.map(task => <article className={`task-row ${task.completed ? 'is-complete' : ''}`} key={task._id}>
                  <button className={`check-button ${task.completed ? 'checked' : ''}`} aria-label={task.completed ? 'Mark as pending' : 'Mark as complete'} onClick={() => void toggleTask(task)}>{task.completed ? '✓' : ''}</button>
                  <div className="task-main"><div className="task-title-line"><h3>{task.title}</h3><span className={`priority-pill ${task.priority.toLowerCase()}`}>{task.priority}</span></div><p>{task.description || 'No description added.'}</p><div className="task-meta"><span>◷ {formatDate(task.deadline)}</span>{task.category && <span className="category-pill">{task.category}</span>}</div></div>
                  <div className="task-actions"><button className="icon-button" title="Edit task" aria-label={`Edit ${task.title}`} onClick={() => setDialog({open: true, task})}>✎</button><button className="icon-button delete-button" title="Delete task" aria-label={`Delete ${task.title}`} onClick={() => void deleteTask(task)}>⌫</button></div>
                </article>)}
              </div>
            )}
            {!loading && tasks.length > 0 && <div className="list-footer">Showing {tasks.length} of {tasks.length} tasks</div>}
          </section>
          <footer className="demo-footer">TaskFlow browser demo <span>•</span> Connected to your local API</footer>
        </section>
      </main>
      {dialog.open && <TaskDialog key={dialog.task?._id ?? 'new'} task={dialog.task} onClose={() => setDialog({open: false, task: null})} onSave={saveTask} />}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
