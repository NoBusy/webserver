import ClientProvider from './ClientProvider';
import WalletPage from '@/fsdpages/WalletPage/ui/WalletPage/WalletPage';

export default function NextJsPage() {
  return (
    <ClientProvider>
      <WalletPage />
    </ClientProvider>
  );
}