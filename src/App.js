import { useEffect, useState } from 'react';
import './App.css';

// 后端需要提供的 GitHub 登录地址（例如重定向到 GitHub OAuth 授权页）
// 可以按需改成你实际的 API 路径，如 `/api/auth/github` 或带 query 的地址
// const GITHUB_LOGIN_URL = '/api/auth/github/login';
// 建议现在这么写，避免 proxy 干扰
const GITHUB_LOGIN_URL = 'http://localhost:4000/api/auth/github/login';
// 获取当前登录用户信息的接口，要求返回 GitHub 用户的基础信息
// 例如 { name, login, avatar_url, email } 等
// const USER_INFO_URL = '/api/auth/me';
const USER_INFO_URL = 'http://localhost:4000/api/auth/me';
const LOGOUT_URL = 'http://localhost:4000/api/auth/logout';
function App() {
  // user：登录成功后从后端拿到的 GitHub 用户信息
  const [user, setUser] = useState(null);
  // loading：是否正在加载当前用户
  const [loading, setLoading] = useState(true);
  // error：请求失败时的错误提示
  const [error, setError] = useState('');

  // 首次渲染时，仅在从 GitHub 授权回跳（URL 携带 login=success）时才去拉取用户信息
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldFetchUser = params.get('login') === 'success';

    if (!shouldFetchUser) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(USER_INFO_URL, {
          // 携带 cookie，方便后端用 session / JWT 等方式识别登录状态
          credentials: 'include',
        });

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUser(data);
      } catch (e) {
        setError('Failed to load user information.');
      } finally {
        setLoading(false);

        // 拉取完成后，把地址栏中的 login 参数去掉，避免刷新页面重复触发
        const url = new URL(window.location.href);
        url.searchParams.delete('login');
        window.history.replaceState({}, '', url.toString());
      }
    };

    fetchUser();
  }, []);

  // 点击 GitHub 登录按钮时，跳转到后端提供的 OAuth 登录入口
  // 后端应负责：构造 GitHub 授权 URL -> GitHub 回调 -> 保存会话 -> 重定向回本前端
  const handleGithubLogin = () => {
    window.location.href = GITHUB_LOGIN_URL;
  };

  return (
    <div className="App">
      {/* 整体登录页面布局：左侧是产品介绍，右侧是登录卡片 */}
      <div className="login-layout">
        {/* 左侧区域：整块展示登录大图，无文字提示 */}
        <div className="login-left">
          <div className="login-illustration-wrapper">
            {/* 使用 public/login.png 这张图片，请确保文件已放到 login-page/public/ 目录下 */}
            <img
              src="/login.png"
              alt="Login illustration"
              className="login-illustration"
            />
          </div>
        </div>

        {/* 右侧区域：登录卡片 */}
        <div className="login-right">
          <div className="login-card">
            <h2 className="card-title">Sign in to Bytebase</h2>
            <p className="card-subtitle">Use your GitHub account to continue.</p>

            {/* GitHub 登录按钮，点击后走 OAuth 流程 */}
            <button
              type="button"
              className="github-button"
              onClick={handleGithubLogin}
            >
              <span className="github-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                </svg>
              </span>
              <span className="github-button-text">Continue with GitHub</span>
            </button>

            {/* 当前登录用户信息展示区域 */}
            <div className="user-info-section">
              {loading && <p className="hint-text">Loading user...</p>}
              {!loading && !user && !error && (
                <p className="hint-text">Not signed in yet.</p>
              )}
              {error && <p className="error-text">{error}</p>}
              {user && (
                <div className="user-card">
                  {user.avatar_url && (
                    <img
                      src={user.avatar_url}
                      alt={user.name || user.login}
                      className="user-avatar"
                    />
                  )}
                  <div className="user-meta">
                    <div className="user-name">{user.name || 'GitHub User'}</div>
                    {user.login && (
                      <div className="user-login">@{user.login}</div>
                    )}
                    {user.email && (
                      <div className="user-email">{user.email}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="logout-button"
                    onClick={async () => {
                      try {
                        await fetch(LOGOUT_URL, {
                          method: 'POST',
                          credentials: 'include',
                        });
                      } catch (e) {
                        // 忽略退出异常，仅清空本地状态
                      } finally {
                        setUser(null);
                      }
                    }}
                  >
                    退出登录 / 切换账号
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
