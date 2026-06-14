import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-background pb-8">
      {/* Header */}
      <Skeleton className="h-32 md:h-64 w-full rounded-none" />

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto -mt-16 md:-mt-32 relative z-10 space-y-8">
          {/* Profile Section */}
          <section className="border rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {/* Avatar */}
              <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-2xl shrink-0" />

              {/* User Info */}
              <div className="flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-56" />
                    <Skeleton className="h-5 w-72" />
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-10 w-36 rounded-md" />
                  <Skeleton className="h-10 w-28 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <div key={i} className="border rounded-xl p-6 space-y-4">
                <Skeleton className="h-5 w-24 mx-auto" />
                <Skeleton className="h-10 w-20 mx-auto" />
              </div>
            ))}
          </section>

          {/* Tabs */}
          <section className="space-y-6">
            <div className="flex gap-6 border-b pb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <Skeleton key={i} className="h-6 w-24" />
              ))}
            </div>

            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
