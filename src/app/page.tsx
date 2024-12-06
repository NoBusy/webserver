import dynamic from 'next/dynamic';

const WalletPage = dynamic(
  () => import('@/fsdpages/WalletPage/ui/WalletPage/WalletPage'),
  { ssr: false }
);

export default function NextJsPage() {
  return <WalletPage />;
}