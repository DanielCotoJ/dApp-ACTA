import ApiKeys from '@/components/modules/api-keys/ui/ApiKeys';

export const metadata = {
  title: 'API Keys',
};

export default function ApiKeysPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-[#edeed1]/20 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">API Keys</h1>
                <p className="text-base text-white/50 mt-1">
                  Create and manage programmatic access
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        <ApiKeys />
      </div>
    </div>
  );
}
