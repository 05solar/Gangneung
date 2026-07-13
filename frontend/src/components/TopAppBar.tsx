import './TopAppBar.css';

interface Props {
  title: string;
}

// 상단 고정 앱바 (로고 + 프로필 버튼)
export default function TopAppBar({ title }: Props) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <img className="topbar__logo" src="/logo.svg" alt="강릉 여행" width={34} height={34} />
        <h1 className="topbar__title">{title}</h1>
      </div>
    </header>
  );
}
